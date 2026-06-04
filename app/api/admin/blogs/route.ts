import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { BlogStoreError, createBlog, getAdminBlogs } from '@/lib/blogStore';

export async function GET(request: NextRequest) {
  const unauthorized = await verifyAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const blogs = await getAdminBlogs();
    return NextResponse.json({ blogs });
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await verifyAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const blog = await createBlog(await request.json());

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error('Create blog error:', error);

    if (error instanceof BlogStoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
