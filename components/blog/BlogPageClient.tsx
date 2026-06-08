'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, Search, UserRound } from 'lucide-react';
import {
  BLOG_CATEGORIES,
  BlogPostCard,
  blogMatchesCategory,
  blogMatchesSearch,
  formatBlogDate,
  getCategoryStyle,
  getReadTime,
} from '@/lib/blogUtils';

function BlogCard({ blog }: { blog: BlogPostCard }) {
  const categoryStyle = getCategoryStyle(blog.category);

  return (
    <article className="group flex min-h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-8 transition-all duration-300 hover:border-orange-400/40 hover:bg-white/[0.06]">
      <div>
        {blog.category && (
          <span
            className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${categoryStyle.bg} ${categoryStyle.border} ${categoryStyle.text}`}
          >
            {blog.category}
          </span>
        )}
        <h2 className="mb-4 text-2xl font-bold leading-snug text-white transition-colors group-hover:text-orange-200">
          {blog.title}
        </h2>
        <p className="mb-6 line-clamp-2 text-sm leading-7 text-gray-400">{blog.excerpt}</p>
        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500">
          <span className="inline-flex items-center gap-2">
            <UserRound className="h-4 w-4 text-orange-400/80" />
            {blog.author}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-orange-400/80" />
            {formatBlogDate(blog.publishedAt || blog.createdAt)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-400/80" />
            {getReadTime(blog.content)} min
          </span>
        </div>
      </div>
      <Link
        href={`/blog/${blog.slug}`}
        className="mt-8 inline-flex w-fit rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(to right, #fb923c, #ea580c)' }}
      >
        Read Post
      </Link>
    </article>
  );
}

export default function BlogPageClient({ blogs }: { blogs: BlogPostCard[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredBlogs = useMemo(
    () =>
      blogs.filter((blog) => {
        const matchesSearch = blogMatchesSearch(blog, searchQuery);
        const matchesCategory = !selectedCategory || blogMatchesCategory(blog, selectedCategory);
        return matchesSearch && matchesCategory;
      }),
    [blogs, searchQuery, selectedCategory]
  );

  return (
    <section className="relative px-6 pb-20 pt-36 lg:px-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.2) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="container relative z-10 mx-auto max-w-6xl">
        <header className="mb-10 max-w-3xl">
          <h1 className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-4xl font-bold leading-tight text-transparent md:text-5xl">
            Email Deliverability, Infrastructure & SaaS Blog
          </h1>
          <p className="mt-5 text-base leading-8 text-gray-400 md:text-lg">
            Practical guides on inbox placement, Microsoft Partner accounts, DNS setup, and scaling cold outreach
            without hitting spam.
          </p>
        </header>

        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-orange-500 text-white'
                  : 'border border-white/10 text-gray-400 hover:border-orange-400/30 hover:text-white'
              }`}
            >
              All Posts
            </button>
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? `${getCategoryStyle(category).bg} ${getCategoryStyle(category).border} ${getCategoryStyle(category).text}`
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-400/40"
            />
          </div>
        </div>

        {filteredBlogs.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-12 text-center text-gray-400">
            No articles match your search or filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
