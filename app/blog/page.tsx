import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  Library,
  MailCheck,
  PenLine,
  ShieldCheck,
  Tag,
  UserRound,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getPublishedBlogs } from '@/lib/blogStore';
import { tryConnectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Blog | HyperScale Inboxes',
  description: 'Email infrastructure, inbox placement, deliverability, and scaling insights from HyperScale Inboxes.',
};

type BlogCard = {
  id: string;
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
  if (!date) return 'Draft';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

const getReadTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

const loadPublishedBlogs = async (): Promise<{ blogs: BlogCard[]; dbError: string | null }> => {
  const connected = await tryConnectDB();
  if (!connected) {
    return {
      blogs: [],
      dbError: 'Unable to load blog posts right now. Please try again in a moment.',
    };
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
    return {
      blogs: [],
      dbError: 'Unable to load blog posts right now. Please try again in a moment.',
    };
  }
};

const DatabaseErrorState = () => (
  <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-10 text-center md:p-14">
    <h2 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">Blog temporarily unavailable</h2>
    <p className="mx-auto max-w-xl text-gray-300">
      Unable to load blog posts right now. Please try again in a moment.
    </p>
  </div>
);

const EmptyState = () => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center md:p-14">
    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-orange-400/25 bg-orange-400/10 text-orange-300">
      <Library className="h-7 w-7" />
    </div>
    <h2 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">No published posts yet</h2>
    <p className="mx-auto max-w-xl text-gray-400">
      Published admin posts will appear here automatically.
    </p>
  </div>
);

export default async function BlogPage() {
  const { blogs, dbError } = await loadPublishedBlogs();
  const featuredPost = blogs[0];
  const remainingPosts = blogs.slice(1);
  const categories = Array.from(
    new Set(blogs.flatMap((blog) => [blog.category, ...blog.tags]).filter(Boolean) as string[])
  ).slice(0, 8);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation />

      <section className="relative overflow-hidden border-b border-white/10 bg-[linear-gradient(180deg,#0a0a0a_0%,#141414_58%,#0f0f0f_100%)] pt-36">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.28) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.28) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent" />

        <div className="container relative z-10 mx-auto max-w-7xl px-6 pb-16 lg:px-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-orange-400/30 bg-orange-400/10 px-5 py-2.5 text-sm font-semibold text-orange-200 backdrop-blur-md">
                <BookOpen className="h-4 w-4" />
                HyperScale field notes
              </div>

              <h1 className="max-w-4xl text-5xl font-bold leading-[1.04] tracking-tight md:text-6xl lg:text-7xl">
                Inbox strategy for teams that need serious sending capacity.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-300">
                Practical writing on deliverability, sender reputation, Microsoft Partner account infrastructure, and the operating discipline behind scaled outreach.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Editorial Focus</p>
              <div className="space-y-4">
                {[
                  { icon: ShieldCheck, label: 'Deliverability systems', color: 'text-orange-300' },
                  { icon: MailCheck, label: 'Inbox operations', color: 'text-cyan-300' },
                  { icon: PenLine, label: 'Scaling playbooks', color: 'text-emerald-300' },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] ${item.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-semibold text-gray-200">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#0f0f0f_0%,#171717_52%,#0f0f0f_100%)] py-12">
        <div className="container mx-auto max-w-7xl px-6 lg:px-20">
          {dbError ? (
            <DatabaseErrorState />
          ) : blogs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-12">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-gray-300"
                    >
                      <Tag className="h-4 w-4 text-orange-300" />
                      {category}
                    </span>
                  ))}
                </div>
              )}

              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] transition-all duration-500 hover:-translate-y-1 hover:border-orange-400/45 hover:bg-white/[0.07] lg:grid-cols-[1.08fr_.92fr]"
                >
                  <div className="relative min-h-[330px] overflow-hidden bg-[#111] md:min-h-[420px]">
                    {featuredPost.coverImage ? (
                      <img
                        src={featuredPost.coverImage}
                        alt={featuredPost.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(249,115,22,.16),rgba(6,182,212,.08))]">
                        <span className="text-8xl font-bold text-white/10">HS</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-black/40 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                      Featured
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-7 md:p-10 lg:p-12">
                    <div>
                      <div className="mb-5 flex flex-wrap items-center gap-3 text-sm text-gray-400">
                        {featuredPost.category && (
                          <span className="rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 font-semibold text-orange-200">
                            {featuredPost.category}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {formatDate(featuredPost.publishedAt || featuredPost.createdAt)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {getReadTime(featuredPost.content)} min read
                        </span>
                      </div>

                      <h2 className="mb-5 text-3xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-orange-200 md:text-5xl">
                        {featuredPost.title}
                      </h2>

                      <p className="text-base leading-8 text-gray-300 md:text-lg">
                        {featuredPost.excerpt}
                      </p>
                    </div>

                    <div className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <span className="inline-flex items-center gap-2 text-sm text-gray-400">
                        <UserRound className="h-4 w-4 text-orange-300" />
                        {featuredPost.author}
                      </span>
                      <span className="inline-flex items-center gap-2 font-semibold text-orange-300">
                        Read insight
                        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {remainingPosts.length > 0 && (
                <div>
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Latest</p>
                      <h2 className="text-3xl font-bold tracking-tight text-white">More insights</h2>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {remainingPosts.map((blog) => (
                      <Link
                        href={`/blog/${blog.slug}`}
                        key={blog.id}
                        className="group flex min-h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] transition-all duration-500 hover:-translate-y-1 hover:border-orange-400/40 hover:bg-white/[0.065]"
                      >
                        <div className="relative h-52 overflow-hidden bg-[#111]">
                          {blog.coverImage ? (
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(249,115,22,.14),rgba(16,185,129,.08))]">
                              <span className="text-6xl font-bold text-white/10">HS</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {blog.category && (
                              <span className="rounded-full border border-orange-400/25 bg-orange-400/10 px-3 py-1 font-semibold text-orange-200">
                                {blog.category}
                              </span>
                            )}
                            <span>{getReadTime(blog.content)} min read</span>
                          </div>

                          <h3 className="mb-3 text-xl font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-orange-200">
                            {blog.title}
                          </h3>
                          <p className="line-clamp-3 flex-1 text-sm leading-7 text-gray-400">
                            {blog.excerpt}
                          </p>

                          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-sm">
                            <span className="text-gray-500">{formatDate(blog.publishedAt || blog.createdAt)}</span>
                            <span className="inline-flex items-center gap-2 font-semibold text-orange-300">
                              Read
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}
