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
        publishedAt: blog.publishedAt ? new Date(String(blog.publishedAt)) : undefined,
      };

      await Blog.findOneAndUpdate({ slug: blog.slug }, payload, { upsert: true, new: true });
      slugs.push(String(blog.slug));
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
