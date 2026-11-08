"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Post = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string | null;
  summaryEn: string | null;
  summaryBn: string | null;
  createdAt: string;
};

const text = {
  en: {
    title: "🩸 Blood Donation Blog",
    sub: "Rules, benefits and guidelines about blood donation.",
    empty: "No articles yet.",
    error: "Could not load articles. Please check that the server is running.",
    loading: "Loading...",
    read: "Read more →",
  },
  bn: {
    title: "🩸 রক্তদান ব্লগ",
    sub: "রক্তদানের নিয়ম, উপকারিতা ও নির্দেশনা।",
    empty: "এখনো কোনো লেখা নেই।",
    error: "লেখা লোড করা যায়নি। সার্ভার চালু আছে কিনা দেখুন।",
    loading: "লোড হচ্ছে...",
    read: "আরও পড়ুন →",
  },
};

export default function BlogPage() {
  const { lang } = useLang();
  const tr = text[lang];
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api<Post[]>("/api/v1/blog")
      .then(setPosts)
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-red-600">{tr.error}</p>;
  if (!posts) return <p>{tr.loading}</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{tr.title}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{tr.sub}</p>
      </div>
      {posts.length === 0 && <p>{tr.empty}</p>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="flex flex-col rounded-3xl border border-gray-200 p-6 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800"
          >
            <h2 className="text-xl font-semibold">
              {lang === "bn" ? (p.titleBn ?? p.titleEn) : p.titleEn}
            </h2>
            <p className="mt-2 flex-1 text-sm text-gray-600 dark:text-gray-400">
              {lang === "bn" ? (p.summaryBn ?? p.summaryEn) : p.summaryEn}
            </p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
                  dateStyle: "medium",
                })}
              </span>
              <span className="font-semibold text-red-600">{tr.read}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}