import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { BlogStoreError, deleteBlog, updateBlog } from '@/lib/blogStore';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  const unauthorized = await verifyAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    const blog = await updateBlog(id, await request.json());

    return NextResponse.json({
      success: true,
      blog,
    });
  } catch (error) {
    console.error('Update blog error:', error);

    if (error instanceof BlogStoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const unauthorized = await verifyAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await context.params;
    await deleteBlog(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete blog error:', error);

    if (error instanceof BlogStoreError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
