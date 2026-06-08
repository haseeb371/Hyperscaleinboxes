export type BlogPostCard = {
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

export const BLOG_CATEGORIES = [
  'Deliverability Tactics',
  'Infrastructure & DNS',
  'Cold Outreach Scale',
  'Product Updates',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const formatBlogDate = (date?: string) => {
  if (!date) return 'Draft';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const formatBlogDateLong = (date?: string) => {
  if (!date) return 'Draft';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

export const getReadTime = (content: string) => {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export const getDifficulty = (content: string, category?: string): DifficultyLevel => {
  const minutes = getReadTime(content);
  const lower = `${content} ${category || ''}`.toLowerCase();

  if (minutes >= 9 || lower.includes('advanced') || lower.includes('api') || lower.includes('dmarc')) {
    return 'Advanced';
  }

  if (minutes >= 5) return 'Intermediate';
  return 'Beginner';
};

export const getAuthorInitials = (author: string) =>
  author
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'HS';

type CategoryStyle = { bg: string; border: string; text: string; accent: string };

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  'Deliverability Tactics': {
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/30',
    text: 'text-cyan-200',
    accent: '#22d3ee',
  },
  'Infrastructure & DNS': {
    bg: 'bg-violet-400/10',
    border: 'border-violet-400/30',
    text: 'text-violet-200',
    accent: '#a78bfa',
  },
  'Cold Outreach Scale': {
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-200',
    accent: '#34d399',
  },
  'Product Updates': {
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/30',
    text: 'text-orange-200',
    accent: '#fb923c',
  },
};

export const getCategoryStyle = (category?: string): CategoryStyle => {
  if (category && CATEGORY_STYLES[category]) {
    return CATEGORY_STYLES[category];
  }

  return {
    bg: 'bg-white/[0.06]',
    border: 'border-white/10',
    text: 'text-gray-300',
    accent: '#fb923c',
  };
};

const DIFFICULTY_STYLES: Record<DifficultyLevel, string> = {
  Beginner: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
  Intermediate: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
  Advanced: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
};

export const getDifficultyStyle = (level: DifficultyLevel) => DIFFICULTY_STYLES[level];

export const blogMatchesCategory = (blog: BlogPostCard, category: string) => {
  const normalized = category.toLowerCase();
  const blogCategory = (blog.category || '').toLowerCase();

  if (blogCategory === normalized || blogCategory.includes(normalized)) return true;

  const aliasMap: Record<string, string[]> = {
    'deliverability tactics': ['deliverability', 'inbox', 'spam', 'placement'],
    'infrastructure & dns': ['infrastructure', 'dns', 'spf', 'dkim', 'dmarc', 'cloudflare'],
    'cold outreach scale': ['outreach', 'cold email', 'scale', 'campaign'],
    'product updates': ['product', 'release', 'update', 'feature'],
  };

  const aliases = aliasMap[normalized] || [];
  return (
    aliases.some((alias) => blogCategory.includes(alias)) ||
    blog.tags.some((tag) => tag.toLowerCase().includes(normalized) || aliases.some((a) => tag.toLowerCase().includes(a)))
  );
};

export const blogMatchesSearch = (blog: BlogPostCard, query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [blog.title, blog.excerpt, blog.author, blog.category || '', ...blog.tags].some((field) =>
    field.toLowerCase().includes(q)
  );
};

export type TocItem = { id: string; title: string; level: 2 | 3 };

export const extractTableOfContents = (content: string): TocItem[] => {
  const items: TocItem[] = [];

  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      const title = trimmed.replace(/^##\s+/, '');
      items.push({ id: slugifyHeading(title), title, level: 2 });
    } else if (trimmed.startsWith('### ')) {
      const title = trimmed.replace(/^###\s+/, '');
      items.push({ id: slugifyHeading(title), title, level: 3 });
    }
  });

  return items;
};

export const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
