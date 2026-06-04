import connectDB, { tryConnectDB } from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';

export type BlogStatus = 'draft' | 'published';

export type BlogInput = {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  tags?: string[] | string;
  status?: BlogStatus;
};

export type BlogRecord = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category?: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export class BlogStoreError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

export const createBlogSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

export const normalizeBlogTags = (tags: BlogInput['tags']) => {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const serializeBlog = (blog: Record<string, unknown>): BlogRecord => ({
  id: String(blog._id || blog.id),
  title: String(blog.title || ''),
  slug: String(blog.slug || ''),
  excerpt: String(blog.excerpt || ''),
  content: String(blog.content || ''),
  coverImage: blog.coverImage ? String(blog.coverImage) : undefined,
  author: String(blog.author || 'HyperScale Team'),
  category: blog.category ? String(blog.category) : undefined,
  tags: Array.isArray(blog.tags) ? blog.tags.map(String) : [],
  status: blog.status === 'published' ? 'published' : 'draft',
  publishedAt: blog.publishedAt ? new Date(String(blog.publishedAt)).toISOString() : undefined,
  createdAt: blog.createdAt ? new Date(String(blog.createdAt)).toISOString() : new Date().toISOString(),
  updatedAt: blog.updatedAt ? new Date(String(blog.updatedAt)).toISOString() : new Date().toISOString(),
});

const validateBlogInput = (input: BlogInput, requireAll = true) => {
  const title = input.title?.trim();
  const excerpt = input.excerpt?.trim();
  const content = input.content?.trim();
  const slug = createBlogSlug(input.slug || title || '');

  if (requireAll && (!title || !excerpt || !content)) {
    throw new BlogStoreError('Title, excerpt, and content are required', 400);
  }

  if ((requireAll || input.slug !== undefined || input.title !== undefined) && !slug) {
    throw new BlogStoreError('A valid slug is required', 400);
  }

  const status: BlogStatus = input.status === 'published' ? 'published' : 'draft';

  return {
    title,
    excerpt,
    content,
    slug,
    status,
    coverImage: input.coverImage?.trim() || undefined,
    author: input.author?.trim() || 'HyperScale Team',
    category: input.category?.trim() || undefined,
    tags: normalizeBlogTags(input.tags),
  };
};

export async function getAdminBlogs() {
  await connectDB();
  const blogs = await Blog.find({}).sort({ updatedAt: -1 }).lean();
  return blogs.map((blog) => serializeBlog(blog as unknown as Record<string, unknown>));
}

export async function getPublishedBlogs() {
  if (!(await tryConnectDB())) return [];
  const blogs = await Blog.find({ status: 'published' })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();

  return blogs.map((blog) => serializeBlog(blog as unknown as Record<string, unknown>));
}

export async function getPublishedBlogBySlug(slug: string) {
  if (!(await tryConnectDB())) return null;
  const blog = await Blog.findOne({ slug, status: 'published' }).lean();
  return blog ? serializeBlog(blog as unknown as Record<string, unknown>) : null;
}

export async function createBlog(input: BlogInput) {
  const payload = validateBlogInput(input);

  await connectDB();

  const existingBlog = await Blog.findOne({ slug: payload.slug }).lean();
  if (existingBlog) {
    throw new BlogStoreError('A blog post with this slug already exists', 409);
  }

  const blog = await Blog.create({
    ...payload,
    publishedAt: payload.status === 'published' ? new Date() : undefined,
  });

  return serializeBlog(blog.toObject() as unknown as Record<string, unknown>);
}

export async function updateBlog(id: string, input: BlogInput) {
  await connectDB();

  const existingBlog = await Blog.findById(id);

  if (!existingBlog) {
    throw new BlogStoreError('Blog not found', 404);
  }

  const updateData: Record<string, unknown> = {};
  const update: Record<string, unknown> = { $set: updateData };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) throw new BlogStoreError('Title is required', 400);
    updateData.title = title;
  }

  if (input.excerpt !== undefined) {
    const excerpt = input.excerpt.trim();
    if (!excerpt) throw new BlogStoreError('Excerpt is required', 400);
    updateData.excerpt = excerpt;
  }

  if (input.content !== undefined) {
    const content = input.content.trim();
    if (!content) throw new BlogStoreError('Content is required', 400);
    updateData.content = content;
  }

  if (input.slug !== undefined) {
    const slug = createBlogSlug(input.slug);
    if (!slug) throw new BlogStoreError('A valid slug is required', 400);

    const duplicateBlog = await Blog.findOne({ slug, _id: { $ne: id } }).lean();
    if (duplicateBlog) {
      throw new BlogStoreError('A blog post with this slug already exists', 409);
    }

    updateData.slug = slug;
  }

  if (input.coverImage !== undefined) updateData.coverImage = input.coverImage.trim() || undefined;
  if (input.author !== undefined) updateData.author = input.author.trim() || 'HyperScale Team';
  if (input.category !== undefined) updateData.category = input.category.trim() || undefined;
  if (input.tags !== undefined) updateData.tags = normalizeBlogTags(input.tags);

  if (input.status !== undefined) {
    const status = input.status === 'published' ? 'published' : 'draft';
    updateData.status = status;

    if (status === 'published' && existingBlog.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    if (status === 'draft') {
      update.$unset = { publishedAt: '' };
    }
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, update, { new: true }).lean();

  if (!updatedBlog) {
    throw new BlogStoreError('Blog not found', 404);
  }

  return serializeBlog(updatedBlog as unknown as Record<string, unknown>);
}

export async function deleteBlog(id: string) {
  await connectDB();

  const deletedBlog = await Blog.findByIdAndDelete(id).lean();
  if (!deletedBlog) {
    throw new BlogStoreError('Blog not found', 404);
  }

  return true;
}
