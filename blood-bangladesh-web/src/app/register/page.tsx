"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import GoogleButton from "@/components/GoogleButton";

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

const extra = {
  en: {
    sentTitle: "Check your email 📧",
    sentText: "We sent a verification link to {email}. Click it to activate your account (valid for 30 minutes). Check the spam folder too.",
    toLogin: "Go to login →",
  },
  bn: {
    sentTitle: "আপনার ইমেইল দেখুন 📧",
    sentText: "{email} ঠিকানায় একটি ভেরিফিকেশন লিংক পাঠানো হয়েছে। অ্যাকাউন্ট চালু করতে লিংকে ক্লিক করুন (৩০ মিনিট বৈধ)। স্প্যাম ফোল্ডারও দেখুন।",
    toLogin: "লগইনে যান →",
  },
};

export default function RegisterPage() {
  const { lang, t } = useLang();
  const ex = extra[lang];
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) setError(t("exists"));
      else if (!res.ok) setError(t("regBad"));
      else {
        const data = await res.json();
        setSentTo(data.email ?? form.email);
      }
    } catch {
      setError(t("noServer"));
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 text-center dark:border-red-950">
        <h1 className="text-2xl font-bold">{ex.sentTitle}</h1>
        <p className="text-gray-700 dark:text-gray-300">{ex.sentText.replace("{email}", sentTo)}</p>
        <Link href="/login" className="inline-block font-semibold text-red-600 underline">
          {ex.toLogin}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 dark:border-red-950"
    >
      <h1 className="text-2xl font-bold">{t("regTitle")}</h1>
      <label className="block text-sm">
        {t("fullName")}
        <input className={field} required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("email")}
        <input className={field} type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("phone")}
        <input className={field} placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("passwordHint")}
        <input className={field} type="password" minLength={8} required value={form.password} onChange={(e) => set("password", e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? t("wait") : t("registerBtn")}
      </button>
      <GoogleButton />
      <p className="text-center text-sm">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-red-600 underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}