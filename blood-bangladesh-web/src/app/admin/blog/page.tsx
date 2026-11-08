"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getRole, getToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Post = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string | null;
  summaryEn: string | null;
  summaryBn: string | null;
  contentEn: string;
  contentBn: string | null;
  published: boolean;
  createdAt: string;
};

type Form = {
  titleEn: string;
  titleBn: string;
  summaryEn: string;
  summaryBn: string;
  contentEn: string;
  contentBn: string;
  slug: string;
  published: boolean;
};

const empty: Form = {
  titleEn: "",
  titleBn: "",
  summaryEn: "",
  summaryBn: "",
  contentEn: "",
  contentBn: "",
  slug: "",
  published: true,
};

const text = {
  en: {
    title: "📝 Manage Blog",
    back: "← Admin panel",
    noAccess: "You do not have access to this page. Please log in with an admin account.",
    loading: "Loading...",
    error: "Something went wrong. Please check the details and the server.",
    newPost: "New article",
    editPost: "Edit article",
    titleEn: "Title (English) *",
    titleBn: "Title (Bangla)",
    summaryEn: "Short summary (English)",
    summaryBn: "Short summary (Bangla)",
    contentEn: "Content (English) *",
    contentBn: "Content (Bangla)",
    format: "Format: one paragraph per line. Start a line with \"- \" for a bullet. A line ending with \":\" becomes a heading.",
    slug: "URL name (optional, letters/numbers/hyphen)",
    published: "Published (visible to everyone)",
    save: "Save article",
    saving: "Saving...",
    cancel: "Cancel edit",
    list: "All articles",
    edit: "Edit",
    del: "Delete",
    confirmDel: "Delete this article permanently?",
    draft: "Draft",
    live: "Published",
    view: "View",
    slugUsed: "This URL name is already used.",
    none: "No articles yet.",
  },
  bn: {
    title: "📝 ব্লগ ম্যানেজ",
    back: "← অ্যাডমিন প্যানেল",
    noAccess: "এই পেজে আপনার প্রবেশাধিকার নেই। অ্যাডমিন অ্যাকাউন্টে লগইন করুন।",
    loading: "লোড হচ্ছে...",
    error: "কিছু ভুল হয়েছে। তথ্য ও সার্ভার ঠিক আছে কিনা দেখুন।",
    newPost: "নতুন লেখা",
    editPost: "লেখা সম্পাদনা",
    titleEn: "শিরোনাম (ইংরেজি) *",
    titleBn: "শিরোনাম (বাংলা)",
    summaryEn: "ছোট সারাংশ (ইংরেজি)",
    summaryBn: "ছোট সারাংশ (বাংলা)",
    contentEn: "লেখা (ইংরেজি) *",
    contentBn: "লেখা (বাংলা)",
    format: "নিয়ম: প্রতি লাইনে একটি অনুচ্ছেদ। \"- \" দিয়ে শুরু করলে তালিকা। \":\" দিয়ে শেষ হলে শিরোনাম।",
    slug: "URL নাম (ঐচ্ছিক, ইংরেজি অক্ষর/সংখ্যা/হাইফেন)",
    published: "প্রকাশিত (সবাই দেখবে)",
    save: "লেখা সেভ করুন",
    saving: "সেভ হচ্ছে...",
    cancel: "সম্পাদনা বাতিল",
    list: "সব লেখা",
    edit: "সম্পাদনা",
    del: "মুছুন",
    confirmDel: "লেখাটি চিরতরে মুছবেন?",
    draft: "খসড়া",
    live: "প্রকাশিত",
    view: "দেখুন",
    slugUsed: "এই URL নাম আগেই ব্যবহার হয়েছে।",
    none: "এখনো কোনো লেখা নেই।",
  },
};

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function AdminBlogPage() {
  const router = useRouter();
  const { lang } = useLang();
  const tr = text[lang];

  const [role, setRole] = useState<string | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setRole(getRole());
  }, [router]);

  const load = useCallback(async () => {
    try {
      setPosts(await api<Post[]>("/api/v1/admin/blog"));
    } catch {
      setErr(tr.error);
    }
  }, [tr.error]);

  useEffect(() => {
    if (role === "ROLE_ADMIN") load();
  }, [role, load]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  function startEdit(p: Post) {
    setEditingId(p.id);
    setForm({
      titleEn: p.titleEn,
      titleBn: p.titleBn ?? "",
      summaryEn: p.summaryEn ?? "",
      summaryBn: p.summaryBn ?? "",
      contentEn: p.contentEn,
      contentBn: p.contentBn ?? "",
      slug: p.slug,
      published: p.published,
    });
    setErr("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function reset() {
    setEditingId(null);
    setForm(empty);
    setErr("");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    try {
      const path = editingId ? `/api/v1/admin/blog/${editingId}` : "/api/v1/admin/blog";
      await api(path, { method: editingId ? "PUT" : "POST", body: JSON.stringify(form) });
      reset();
      await load();
    } catch (x) {
      setErr((x as { status?: number }).status === 409 ? tr.slugUsed : tr.error);
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Post) {
    if (!confirm(tr.confirmDel)) return;
    try {
      await api(`/api/v1/admin/blog/${p.id}`, { method: "DELETE" });
      if (editingId === p.id) reset();
      await load();
    } catch {
      setErr(tr.error);
    }
  }

  if (role === undefined) return <p>{tr.loading}</p>;
  if (role !== "ROLE_ADMIN") return <p className="text-red-600">{tr.noAccess}</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{tr.title}</h1>
        <Link href="/admin" className="text-sm font-semibold text-red-600 hover:underline">
          {tr.back}
        </Link>
      </div>

      <form
        onSubmit={save}
        className="grid gap-3 rounded-2xl border border-red-100 p-5 sm:grid-cols-2 dark:border-red-950"
      >
        <h2 className="font-semibold sm:col-span-2">{editingId ? tr.editPost : tr.newPost}</h2>
        <label className="text-sm">
          {tr.titleEn}
          <input className={field} required maxLength={200} value={form.titleEn} onChange={(e) => set("titleEn", e.target.value)} />
        </label>
        <label className="text-sm">
          {tr.titleBn}
          <input className={field} maxLength={200} value={form.titleBn} onChange={(e) => set("titleBn", e.target.value)} />
        </label>
        <label className="text-sm">
          {tr.summaryEn}
          <input className={field} maxLength={300} value={form.summaryEn} onChange={(e) => set("summaryEn", e.target.value)} />
        </label>
        <label className="text-sm">
          {tr.summaryBn}
          <input className={field} maxLength={300} value={form.summaryBn} onChange={(e) => set("summaryBn", e.target.value)} />
        </label>
        <label className="text-sm">
          {tr.contentEn}
          <textarea className={field} required rows={10} value={form.contentEn} onChange={(e) => set("contentEn", e.target.value)} />
        </label>
        <label className="text-sm">
          {tr.contentBn}
          <textarea className={field} rows={10} value={form.contentBn} onChange={(e) => set("contentBn", e.target.value)} />
        </label>
        <p className="text-xs text-gray-500 sm:col-span-2">{tr.format}</p>
        <label className="text-sm">
          {tr.slug}
          <input className={field} maxLength={160} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
        </label>
        <label className="flex items-center gap-2 text-sm sm:self-end sm:pb-2">
          <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
          {tr.published}
        </label>
        {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
        <div className="flex gap-2 sm:col-span-2">
          <button
            disabled={saving}
            className="flex-1 rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? tr.saving : tr.save}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-xl border border-gray-300 px-4 py-2.5 dark:border-gray-700"
            >
              {tr.cancel}
            </button>
          )}
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="font-semibold">{tr.list}</h2>
        {!posts && !err && <p>{tr.loading}</p>}
        {posts?.length === 0 && <p>{tr.none}</p>}
        {posts?.map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-800"
          >
            <div className="text-sm">
              <div className="text-base font-semibold">
                {lang === "bn" ? (p.titleBn ?? p.titleEn) : p.titleEn}{" "}
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                    p.published
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {p.published ? tr.live : tr.draft}
                </span>
              </div>
              <div className="text-xs text-gray-500">/blog/{p.slug}</div>
            </div>
            <div className="flex gap-2">
              {p.published && (
                <Link
                  href={`/blog/${p.slug}`}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
                >
                  {tr.view}
                </Link>
              )}
              <button
                onClick={() => startEdit(p)}
                className="rounded-lg border border-green-300 px-3 py-1.5 text-sm text-green-700 dark:border-green-800 dark:text-green-400"
              >
                {tr.edit}
              </button>
              <button
                onClick={() => remove(p)}
                className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 dark:border-red-900"
              >
                {tr.del}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}