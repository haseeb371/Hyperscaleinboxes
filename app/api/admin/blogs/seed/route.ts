import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/lib/models/Blog';
import { verifyAdminRequest } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const authError = await verifyAdminRequest(request);
  const setupKey = request.headers.get('x-setup-key');

  if (authError && setupKey !== process.env.JWT_SECRET) {
    return authError;
  }

  try {
    await connectDB();

    const blogsPath = path.join(process.cwd(), 'data', 'blogs.json');
    const blogs = JSON.parse(fs.readFileSync(blogsPath, 'utf8')) as Array<Record<string, unknown>>;

    if (!Array.isArray(blogs)) {
      return NextResponse.json({ error: 'Invalid blogs seed file.' }, { status: 500 });
    }

    const slugs: string[] = [];

    for (const blog of blogs) {
      const slug = String(blog.slug || '').trim();
      const title = String(blog.title || '').trim();
      const excerpt = String(blog.excerpt || '').trim();
      const content = String(blog.content || '').trim();

      if (!slug || !title || !excerpt || !content) {
        return NextResponse.json({ error: 'Each seed blog needs a title, slug, excerpt, and content.' }, { status: 400 });
      }

      const tags = Array.isArray(blog.tags) ? blog.tags.map(String).filter(Boolean) : [];
      const status: 'draft' | 'published' = blog.status === 'published' ? 'published' : 'draft';

      const payload = {
        title,
        slug,
        excerpt,
        content,
        coverImage: blog.coverImage ? String(blog.coverImage) : undefined,
        author: blog.author ? String(blog.author) : 'HyperScale Team',
        category: blog.category ? String(blog.category) : undefined,
        tags,
        status,
        publishedAt: blog.publishedAt ? new Date(String(blog.publishedAt)) : undefined,
      };

      await Blog.findOneAndUpdate({ slug }, payload, { upsert: true, new: true });
      slugs.push(slug);
    }

    return NextResponse.json({
      success: true,
      message: `${slugs.length} blogs uploaded successfully.`,
      slugs,
    });
  } catch (error) {
    console.error('Seed blogs error:', error);
    return NextResponse.json({ error: 'Failed to seed blogs.' }, { status: 500 });
  }
}
