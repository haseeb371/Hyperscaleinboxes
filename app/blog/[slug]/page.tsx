import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Clock,
  Tag,
  UserRound,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getPublishedBlogBySlug } from '@/lib/blogStore';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category?: string;
  tags: string[];
  publishedAt?: string;
  createdAt: string;
};

const formatDate = (date?: string) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const getReadTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const getBlogBySlug = async (slug: string): Promise<BlogPost | null> => {
  try {
    const blog = await getPublishedBlogBySlug(slug);

    if (!blog) return null;

    return {
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
    };
  } catch (error) {
    console.error('Fetch public blog error:', error);
    return null;
  }
};

const renderContent = (content: string) => {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith('### ')) {
      return (
        <h3 key={index} className="mt-10 text-2xl font-bold tracking-tight text-white">
          {block.replace(/^###\s+/, '')}
        </h3>
      );
    }

    if (block.startsWith('## ')) {
      return (
        <h2 key={index} className="mt-12 border-t border-white/10 pt-8 text-3xl font-bold tracking-tight text-white">
          {block.replace(/^##\s+/, '')}
        </h2>
      );
    }

    if (block.split('\n').every((line) => line.trim().startsWith('- '))) {
      return (
        <ul key={index} className="my-8 space-y-4">
          {block.split('\n').map((line, lineIndex) => (
            <li key={lineIndex} className="flex gap-3 text-lg leading-8 text-gray-300">
              <span className="mt-3 h-2 w-2 flex-shrink-0 rounded-full bg-orange-300" />
              <span>{line.replace(/^-\s+/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }

    const lines = block.split('\n');

    return (
      <p key={index} className="text-lg leading-9 text-gray-300">
        {lines.map((line, lineIndex) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    return {
      title: 'Blog Post | HyperScale Inboxes',
    };
  }

  return {
    title: `${blog.title} | HyperScale Inboxes`,
    description: blog.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const publishedDate = formatDate(blog.publishedAt || blog.createdAt);
  const readTime = getReadTime(blog.content);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation />

      <article>
        <header className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#0a0a0a_0%,#141414_62%,#101010_100%)] pt-36">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)',
              backgroundSize: '72px 72px',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

          <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-12 lg:px-20">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-orange-400/35 hover:text-orange-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-end">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                  {blog.category && (
                    <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 font-semibold text-orange-200">
                      {blog.category}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {publishedDate}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {readTime} min read
                  </span>
                </div>

                <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                  {blog.title}
                </h1>

                <p className="mt-6 max-w-3xl text-xl leading-8 text-gray-300">
                  {blog.excerpt}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-orange-300" />
                    {blog.author}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-cyan-300" />
                    HyperScale field notes
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Article Brief</p>
                <div className="space-y-4 text-sm text-gray-300">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span>Reading time</span>
                    <span className="font-semibold text-white">{readTime} min</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span>Published</span>
                    <span className="font-semibold text-white">{publishedDate}</span>
                  </div>
                  {blog.category && (
                    <div className="flex items-center justify-between">
                      <span>Focus</span>
                      <span className="font-semibold text-orange-200">{blog.category}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {blog.coverImage && (
          <section className="bg-[#101010]">
            <div className="container mx-auto max-w-7xl px-6 py-10 lg:px-20">
              <div className="relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#111] md:h-[520px]">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
              </div>
            </div>
          </section>
        )}

        <section className="bg-[linear-gradient(180deg,#101010_0%,#171717_48%,#0f0f0f_100%)] pb-24 pt-4">
          <div className="container mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[240px_1fr] lg:px-20">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {(blog.tags.length > 0 ? blog.tags : [blog.category || 'Email infrastructure']).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-gray-300">
                      <Tag className="h-3.5 w-3.5 text-orange-300" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </aside>

            <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 md:p-10 lg:p-12">
              <div className="space-y-7">
                {renderContent(blog.content)}
              </div>

              {blog.tags.length > 0 && (
                <div className="mt-12 border-t border-white/10 pt-8 lg:hidden">
                  <div className="flex flex-wrap gap-3">
                    {blog.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </article>

      <Footer />
    </main>
  );
}
