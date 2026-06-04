const dns = require('node:dns');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};

  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const idx = trimmed.indexOf('=');
      if (idx === -1) return;

      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1).replace(/\\\$/g, '$');
      env[key] = value;
    });

  return env;
}

function srvToStandardUri(srvUri) {
  const match = srvUri.match(/^mongodb\+srv:\/\/([^@]+)@([^/]+)\/([^?]+)(\?.*)?$/);
  if (!match) return null;

  const [, credentials, host, database, query = ''] = match;
  const params = new URLSearchParams(query.replace(/^\?/, ''));
  params.set('ssl', 'true');
  params.set('authSource', 'admin');

  const clusterPrefix = host.split('.')[0];
  const domain = host.substring(clusterPrefix.length + 1);
  const shards = [0, 1, 2]
    .map((n) => `${clusterPrefix}-shard-00-0${n}.${domain}:27017`)
    .join(',');

  return `mongodb://${credentials}@${shards}/${database}?${params.toString()}`;
}

async function connect(uri) {
  const options = { serverSelectionTimeoutMS: 15000 };

  try {
    await mongoose.connect(uri, options);
    return;
  } catch (error) {
    if (uri.startsWith('mongodb+srv://')) {
      const fallback = srvToStandardUri(uri);
      if (fallback) {
        await mongoose.connect(fallback, options);
        return;
      }
    }
    throw error;
  }
}

const BlogSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    excerpt: String,
    content: String,
    coverImage: String,
    author: String,
    category: String,
    tags: [String],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: Date,
  },
  { timestamps: true }
);

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function seed() {
  const env = loadEnv();
  const uri = env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
  }

  const blogsPath = path.join(__dirname, '..', 'data', 'blogs.json');
  const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8'));

  if (!Array.isArray(blogs)) {
    console.error('data/blogs.json must contain an array of blog posts');
    process.exit(1);
  }

  await connect(uri);

  for (const blog of blogs) {
    const payload = {
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage,
      author: blog.author || 'HyperScale Team',
      category: blog.category,
      tags: blog.tags || [],
      status: blog.status === 'published' ? 'published' : 'draft',
      publishedAt: blog.publishedAt ? new Date(blog.publishedAt) : undefined,
    };

    await Blog.findOneAndUpdate({ slug: blog.slug }, payload, { upsert: true, new: true });
    console.log('Seeded:', blog.slug);
  }

  const count = await Blog.countDocuments({ status: 'published' });
  console.log(`Done. ${count} published blog(s) in MongoDB.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
