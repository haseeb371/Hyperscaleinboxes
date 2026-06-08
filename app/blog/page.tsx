import type { Metadata } from 'next';
import Link from 'next/link';
import { Library } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogPageClient from '@/components/blog/BlogPageClient';
import { getPublishedBlogs } from '@/lib/blogStore';
import { tryConnectDB } from '@/lib/mongodb';
import type { BlogPostCard } from '@/lib/blogUtils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | HyperScale Inboxes',
  description: 'Email deliverability, infrastructure, and SaaS insights from HyperScale Inboxes.',
};

const loadPublishedBlogs = async (): Promise<{ blogs: BlogPostCard[]; dbError: string | null }> => {
  const connected = await tryConnectDB();
  if (!connected) {
    return { blogs: [], dbError: 'Unable to load blog posts right now. Please try again in a moment.' };
  }

  try {
    const blogs = await getPublishedBlogs();
    return {
      blogs: blogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        coverImage: blog.coverImage,
        author: blog.author,
        category: blog.category,
        tags: blog.tags || [],
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
      })),
      dbError: null,
    };
  } catch (error) {
    console.warn('Fetch public blogs error:', error instanceof Error ? error.message : error);
    return { blogs: [], dbError: 'Unable to load blog posts right now. Please try again in a moment.' };
  }
};

export default async function BlogPage() {
  const { blogs, dbError } = await loadPublishedBlogs();

  return (
    <main
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)' }}
    >
      <Navigation />

      {dbError ? (
        <section className="px-6 pb-20 pt-36 lg:px-20">
          <div className="container mx-auto max-w-3xl rounded-2xl border border-red-400/20 bg-red-400/10 p-10 text-center">
            <h2 className="mb-3 text-2xl font-bold text-white">Blog temporarily unavailable</h2>
            <p className="text-gray-300">{dbError}</p>
          </div>
        </section>
      ) : blogs.length === 0 ? (
        <section className="px-6 pb-20 pt-36 lg:px-20">
          <div className="container mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <Library className="mx-auto mb-4 h-10 w-10 text-orange-400" />
            <h2 className="mb-3 text-2xl font-bold text-white">No published posts yet</h2>
            <p className="text-gray-400">Publish from the admin panel to populate this feed.</p>
            <Link
              href="/admin/blogs"
              className="mt-6 inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(to right, #fb923c, #ea580c)' }}
            >
              Admin panel
            </Link>
          </div>
        </section>
      ) : (
        <BlogPageClient blogs={blogs} />
      )}

      <Footer />
    </main>
  );
}
