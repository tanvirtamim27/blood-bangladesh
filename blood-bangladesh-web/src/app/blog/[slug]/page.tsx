"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import RichText from "@/components/RichText";

type Post = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string | null;
  contentEn: string;
  contentBn: string | null;
  createdAt: string;
};

const text = {
  en: {
    back: "← All articles",
    loading: "Loading...",
    notFound: "This article was not found.",
    error: "Could not load the article. Please check that the server is running.",
    note: "This is general information, not medical advice. The doctor at the blood center makes the final decision.",
  },
  bn: {
    back: "← সব লেখা",
    loading: "লোড হচ্ছে...",
    notFound: "লেখাটি পাওয়া যায়নি।",
    error: "লেখা লোড করা যায়নি। সার্ভার চালু আছে কিনা দেখুন।",
    note: "এটি সাধারণ তথ্য, চিকিৎসা পরামর্শ নয়। চূড়ান্ত সিদ্ধান্ত ব্লাড সেন্টারের ডাক্তারের।",
  },
};

export default function BlogPostPage() {
  const { lang } = useLang();
  const tr = text[lang];
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [post, setPost] = useState<Post | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "missing" | "error">("loading");

  useEffect(() => {
    if (!slug) return;
    api<Post>(`/api/v1/blog/${encodeURIComponent(slug)}`)
      .then((p) => {
        setPost(p);
        setState("ok");
      })
      .catch((e) => setState((e as { status?: number }).status === 404 ? "missing" : "error"));
  }, [slug]);

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link href="/blog" className="text-sm font-semibold text-red-600 hover:underline">
        {tr.back}
      </Link>
      {state === "loading" && <p>{tr.loading}</p>}
      {state === "missing" && <p>{tr.notFound}</p>}
      {state === "error" && <p className="text-red-600">{tr.error}</p>}
      {state === "ok" && post && (
        <>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {lang === "bn" ? (post.titleBn ?? post.titleEn) : post.titleEn}
          </h1>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
              dateStyle: "long",
            })}
          </div>
          <RichText text={lang === "bn" ? (post.contentBn ?? post.contentEn) : post.contentEn} />
          <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
            {tr.note}
          </p>
        </>
      )}
    </article>
  );
}