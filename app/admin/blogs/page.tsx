"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  FileText,
  LayoutDashboard,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";

type BlogStatus = "draft" | "published";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category?: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string;
  status: BlogStatus;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "HyperScale Team",
  category: "",
  tags: "",
  status: "draft",
};

const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);

const formatDate = (date?: string) => {
  if (!date) return "Not published";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [slugWasEdited, setSlugWasEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const stats = useMemo(() => {
    const published = blogs.filter((blog) => blog.status === "published").length;
    const drafts = blogs.filter((blog) => blog.status === "draft").length;

    return {
      total: blogs.length,
      published,
      drafts,
    };
  }, [blogs]);

  const fetchBlogs = async () => {
    setError("");

    try {
      const response = await fetch("/api/admin/blogs");

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch blog posts");
      }

      setBlogs(data.blogs || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      await fetchBlogs();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const updateForm = (field: keyof BlogForm, value: string) => {
    setNotice("");
    setError("");

    if (field === "title") {
      setForm((current) => ({
        ...current,
        title: value,
        slug: slugWasEdited ? current.slug : createSlug(value),
      }));
      return;
    }

    if (field === "slug") {
      setSlugWasEdited(true);
      setForm((current) => ({
        ...current,
        slug: createSlug(value),
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingBlog(null);
    setSlugWasEdited(false);
    setError("");
    setNotice("");
  };

  const startEditing = (blog: Blog) => {
    setEditingBlog(blog);
    setSlugWasEdited(true);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      coverImage: blog.coverImage || "",
      author: blog.author || "HyperScale Team",
      category: blog.category || "",
      tags: blog.tags.join(", "),
      status: blog.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const endpoint = editingBlog
        ? `/api/admin/blogs/${editingBlog.id}`
        : "/api/admin/blogs";

      const response = await fetch(endpoint, {
        method: editingBlog ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save blog post");
      }

      await fetchBlogs();
      setNotice(editingBlog ? "Blog post updated." : "Blog post created.");
      setForm(emptyForm);
      setEditingBlog(null);
      setSlugWasEdited(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save blog post");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBlog = async (blog: Blog) => {
    const confirmed = window.confirm(`Delete "${blog.title}"?`);
    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete blog post");
      }

      await fetchBlogs();
      if (editingBlog?.id === blog.id) {
        resetForm();
      }
      setNotice("Blog post deleted.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete blog post");
    }
  };

  const toggleStatus = async (blog: Blog) => {
    const nextStatus: BlogStatus = blog.status === "published" ? "draft" : "published";
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/blogs/${blog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (response.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update blog status");
      }

      await fetchBlogs();
      setNotice(nextStatus === "published" ? "Blog post published." : "Blog post moved to draft.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update blog status");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-orange-400" />
          <p className="text-gray-300 text-lg">Loading blog manager...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}>
      <div className="fixed inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, rgba(255, 110, 64, 0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl animate-pulse" style={{ background: "radial-gradient(circle, rgba(255, 110, 64, 0.2) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 lg:px-12 py-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                Blog
              </span>{" "}
              Manager
            </h1>
            <p className="text-gray-400">Create, edit, publish, and remove site blog posts.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <LayoutDashboard className="w-5 h-5" />
              Orders
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <Eye className="w-5 h-5" />
              View Blog
            </Link>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)" }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Posts", value: stats.total, icon: FileText },
            { label: "Published", value: stats.published, icon: Eye },
            { label: "Drafts", value: stats.drafts, icon: Pencil },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="p-6 rounded-2xl border"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{item.label}</p>
                    <p className="text-3xl font-bold text-white">{item.value}</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-500/20 text-orange-300">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {(error || notice) && (
          <div
            className="p-4 rounded-xl border mb-8"
            style={{
              background: error ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              borderColor: error ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)",
            }}
          >
            <p className={error ? "text-red-400" : "text-green-400"}>{error || notice}</p>
          </div>
        )}

        <section
          className="rounded-2xl border p-6 md:p-8 mb-10"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingBlog ? "Edit Blog Post" : "Create Blog Post"}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {editingBlog ? `Editing "${editingBlog.title}"` : "Write a new post for the public blog."}
              </p>
            </div>
            {editingBlog && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <X className="w-4 h-4" />
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="How to scale inboxes without hurting deliverability"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="slug">
                Slug
              </label>
              <input
                id="slug"
                value={form.slug}
                onChange={(event) => updateForm("slug", event.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="scale-inboxes-without-hurting-deliverability"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="author">
                Author
              </label>
              <input
                id="author"
                value={form.author}
                onChange={(event) => updateForm("author", event.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="HyperScale Team"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="category">
                Category
              </label>
              <input
                id="category"
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="Deliverability"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="excerpt">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(event) => updateForm("excerpt", event.target.value)}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none resize-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="A short summary that appears on the blog listing page."
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="content">
                Content
              </label>
              <textarea
                id="content"
                value={form.content}
                onChange={(event) => updateForm("content", event.target.value)}
                required
                rows={14}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder={"Draft the full article content here.\n\nExample section title\n\nExample paragraph content."}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="coverImage">
                Cover Image URL
              </label>
              <input
                id="coverImage"
                value={form.coverImage}
                onChange={(event) => updateForm("coverImage", event.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2" htmlFor="tags">
                Tags
              </label>
              <input
                id="tags"
                value={form.tags}
                onChange={(event) => updateForm("tags", event.target.value)}
                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none text-white"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
                placeholder="email, deliverability, scaling"
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-2">
              <div className="inline-flex p-1 rounded-xl border w-full md:w-auto" style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)" }}>
                {(["draft", "published"] as BlogStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, status }))}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-lg font-semibold capitalize transition-all duration-300"
                    style={{
                      background: form.status === status ? "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)" : "transparent",
                      color: form.status === status ? "#ffffff" : "#d1d5db",
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                >
                  <Plus className="w-5 h-5" />
                  New
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ background: "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)" }}
                >
                  <Save className="w-5 h-5" />
                  {isSaving ? "Saving..." : editingBlog ? "Update Post" : "Create Post"}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section
          className="rounded-2xl border overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        >
          <div className="p-6 border-b" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <h2 className="text-2xl font-bold text-white">Posts</h2>
            <p className="text-gray-400 text-sm mt-1">Newest updates appear first.</p>
          </div>

          {blogs.length === 0 ? (
            <div className="text-center py-16 px-6">
              <FileText className="w-14 h-14 mx-auto mb-4 text-orange-300 opacity-70" />
              <p className="text-gray-400 text-lg">No blog posts yet</p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
              {blogs.map((blog) => (
                <article key={blog.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span
                          className="px-3 py-1 rounded-lg text-xs font-semibold capitalize"
                          style={{
                            background: blog.status === "published" ? "rgba(34, 197, 94, 0.18)" : "rgba(234, 179, 8, 0.18)",
                            color: blog.status === "published" ? "#4ade80" : "#fbbf24",
                          }}
                        >
                          {blog.status}
                        </span>
                        {blog.category && <span className="text-xs text-gray-400">{blog.category}</span>}
                        <span className="text-xs text-gray-500">Updated {formatDate(blog.updatedAt)}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">{blog.excerpt}</p>
                      <p className="text-xs text-gray-500 mt-3">
                        /blog/{blog.slug} {blog.status === "published" ? `- Published ${formatDate(blog.publishedAt)}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {blog.status === "published" && (
                        <Link
                          href={`/blog/${blog.slug}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                          }}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => startEditing(blog)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #ff6e40 0%, #ff8c69 100%)" }}
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleStatus(blog)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                        style={{
                          background: "rgba(255, 255, 255, 0.1)",
                          border: "1px solid rgba(255, 255, 255, 0.2)",
                        }}
                      >
                        {blog.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBlog(blog)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-200 transition-all duration-300 hover:scale-105"
                        style={{
                          background: "rgba(239, 68, 68, 0.12)",
                          border: "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
