'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Clock, Copy, List, UserRound } from 'lucide-react';
import OrderPopup from '@/components/OrderPopup';
import BlogCoverImage from '@/components/blog/BlogCoverImage';
import {
  extractTableOfContents,
  formatBlogDateLong,
  getAuthorInitials,
  getReadTime,
  slugifyHeading,
} from '@/lib/blogUtils';

type BlogArticleReaderProps = {
  blog: {
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
};

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(100, (window.scrollY / docHeight) * 100) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="fixed left-0 right-0 top-0 z-[70] h-0.5 bg-white/5">
      <div
        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function CopyCodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="my-8 overflow-hidden rounded-xl border border-orange-400/20 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-gray-500">DNS / API</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-orange-300"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-7 text-gray-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderArticleContent(content: string) {
  const blocks = content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks.map((block, index) => {
    if (block.startsWith('```')) {
      const code = block.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '');
      return <CopyCodeBlock key={index} code={code} />;
    }

    if (block.startsWith('> ')) {
      return (
        <blockquote
          key={index}
          className="my-6 border-l-4 border-orange-400/60 bg-orange-400/5 px-5 py-4 italic leading-8 text-gray-300"
        >
          {block.replace(/^>\s?/gm, '')}
        </blockquote>
      );
    }

    if (block.startsWith('### ')) {
      const title = block.replace(/^###\s+/, '');
      return (
        <h3 key={index} id={slugifyHeading(title)} className="scroll-mt-32 mt-10 text-xl font-bold text-white">
          {title}
        </h3>
      );
    }

    if (block.startsWith('## ')) {
      const title = block.replace(/^##\s+/, '');
      return (
        <h2 key={index} id={slugifyHeading(title)} className="scroll-mt-32 mt-12 text-2xl font-bold text-white">
          {title}
        </h2>
      );
    }

    if (block.split('\n').every((line) => line.trim().startsWith('- '))) {
      return (
        <ul key={index} className="my-6 space-y-2 pl-5 text-gray-300">
          {block.split('\n').map((line, lineIndex) => (
            <li key={lineIndex} className="list-disc leading-8">
              {line.replace(/^-\s+/, '')}
            </li>
          ))}
        </ul>
      );
    }

    return (
      <p key={index} className="text-base leading-8 text-gray-300">
        {block.split('\n').map((line, lineIndex, arr) => (
          <span key={lineIndex}>
            {line}
            {lineIndex < arr.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

export default function BlogArticleReader({ blog }: BlogArticleReaderProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const toc = useMemo(() => extractTableOfContents(blog.content), [blog.content]);
  const updatedDate = formatBlogDateLong(blog.publishedAt || blog.createdAt);
  const tagLine = [blog.category, ...blog.tags].filter(Boolean).slice(0, 3);

  return (
    <>
      <ReadingProgressBar />
      <OrderPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      <article className="px-6 pb-20 pt-32 lg:px-20">
        <div className="mx-auto w-full max-w-5xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-orange-400/30 hover:text-orange-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {tagLine.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {tagLine.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Side-by-side hero: image left, title + summary right */}
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-10">
            <BlogCoverImage src={blog.coverImage} alt={blog.title} variant="split" />
            <div>
              <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                {blog.title}
              </h1>
              <p className="mt-4 text-base leading-8 text-gray-400">{blog.excerpt}</p>
              <p className="mt-4 text-sm text-gray-500">{getReadTime(blog.content)} min read</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-white/10 pb-8 text-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-orange-400/30 bg-orange-400/10 text-xs font-bold text-orange-200">
                {getAuthorInitials(blog.author)}
              </div>
              <span className="font-semibold text-orange-400">{blog.author}</span>
            </div>
            <span className="inline-flex items-center gap-2 text-gray-500">
              <Clock className="h-4 w-4 text-orange-400/70" />
              Last Updated On: {updatedDate}
            </span>
          </div>

          {/* Promo strip */}
          <div
            className="mt-6 flex items-center justify-between gap-4 rounded-xl border px-5 py-4"
            style={{
              background: 'linear-gradient(135deg, rgba(255,110,64,0.12) 0%, rgba(255,255,255,0.04) 100%)',
              borderColor: 'rgba(255,110,64,0.25)',
            }}
          >
            <div>
              <p className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-lg font-bold text-transparent">
                HyperScale
              </p>
              <p className="mt-0.5 text-sm text-gray-400">
                Scale email infrastructure — first month free.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPopupOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{ background: 'linear-gradient(to right, #fb923c, #ea580c)' }}
              aria-label="Get started"
            >
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          </div>

          {toc.length > 0 && (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
                <List className="h-4 w-4 text-orange-400" />
                Table of Contents
              </div>
              <ol className="space-y-2 pl-4 text-sm text-gray-400">
                {toc.map((item) => (
                  <li key={item.id} className={item.level === 3 ? 'ml-3 list-[circle]' : 'list-decimal'}>
                    <a href={`#${item.id}`} className="hover:text-orange-300">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-8 space-y-6">
            {renderArticleContent(blog.content)}
          </div>

          <div className="mt-10 flex items-center gap-3 border-t border-white/10 pt-8 text-sm text-gray-500">
            <UserRound className="h-4 w-4 text-orange-400/70" />
            <span>
              Written by <span className="font-semibold text-orange-400">{blog.author}</span>
              {' · '}
              {getReadTime(blog.content)} min read
            </span>
          </div>
        </div>
      </article>
    </>
  );
}
