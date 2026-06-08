import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CalendarDays, UserRound } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogArticleReader from '@/components/blog/BlogArticleReader';
import { getPublishedBlogBySlug, getPublishedBlogs } from '@/lib/blogStore';
import { formatBlogDate, getCategoryStyle, type BlogPostCard } from '@/lib/blogUtils';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const getRelatedPosts = (allBlogs: BlogPostCard[], currentSlug: string, category?: string, tags: string[] = []) =>
  allBlogs
    .filter((post) => post.slug !== currentSlug)
    .map((post) => {
      let score = 0;
      if (category && post.category === category) score += 2;
      if (post.tags.some((tag) => tags.includes(tag))) score += 1;
      return { post, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ post }) => post);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) return { title: 'Blog Post | HyperScale Inboxes' };

  return {
    title: `${blog.title} | HyperScale Inboxes`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getPublishedBlogBySlug(slug);

  if (!blog) notFound();

  const allBlogs = await getPublishedBlogs();
  const relatedPosts = getRelatedPosts(
    allBlogs.map((item) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      coverImage: item.coverImage,
      author: item.author,
      category: item.category,
      tags: item.tags || [],
      publishedAt: item.publishedAt,
      createdAt: item.createdAt,
    })),
    slug,
    blog.category,
    blog.tags || []
  );

  return (
    <main
      className="min-h-screen text-white"
      style={{ background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)' }}
    >
      <Navigation />
      <BlogArticleReader
        blog={{
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
        }}
      />

      {relatedPosts.length > 0 && (
        <section className="border-t border-white/10 px-6 py-16 lg:px-20">
          <div className="container mx-auto max-w-6xl">
            <h2 className="mb-8 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-2xl font-bold text-transparent">
              Related Posts
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((post) => {
                const style = getCategoryStyle(post.category);
                return (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group flex min-h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition-all hover:border-orange-400/35"
                  >
                    {post.category && (
                      <span className={`mb-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style.bg} ${style.border} ${style.text}`}>
                        {post.category}
                      </span>
                    )}
                    <h3 className="mb-3 text-lg font-bold text-white group-hover:text-orange-200">{post.title}</h3>
                    <p className="mb-4 line-clamp-2 flex-1 text-sm text-gray-500">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="h-3.5 w-3.5" />
                        {post.author}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatBlogDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-300">
                      Read Post
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
