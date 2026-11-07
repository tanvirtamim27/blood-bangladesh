"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const text = {
  en: {
    title: "Set a new password",
    password: "New password (at least 8 characters)",
    confirm: "Confirm new password",
    save: "Change password",
    saving: "Please wait...",
    mismatch: "Passwords do not match.",
    noToken: "This reset link is incomplete. Please request a new one.",
    invalid: "This link is invalid or has expired. Please request a new one.",
    fail: "Something went wrong. Please try again.",
    done: "Your password has been changed. You can log in now.",
    login: "Go to login →",
    again: "Request a new link →",
  },
  bn: {
    title: "নতুন পাসওয়ার্ড দিন",
    password: "নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)",
    confirm: "নতুন পাসওয়ার্ড আবার লিখুন",
    save: "পাসওয়ার্ড বদলান",
    saving: "অপেক্ষা করুন...",
    mismatch: "দুই পাসওয়ার্ড মিলছে না।",
    noToken: "রিসেট লিংকটি অসম্পূর্ণ। নতুন লিংক চান।",
    invalid: "লিংকটি ভুল বা মেয়াদ শেষ। নতুন লিংক চান।",
    fail: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    done: "আপনার পাসওয়ার্ড বদলানো হয়েছে। এখন লগইন করতে পারবেন।",
    login: "লগইনে যান →",
    again: "নতুন লিংক চান →",
  },
};

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function ResetPasswordPage() {
  const { lang } = useLang();
  const tr = text[lang];
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [badLink, setBadLink] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") ?? "");
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password !== confirm) {
      setErr(tr.mismatch);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) setDone(true);
      else if (res.status === 400) {
        setBadLink(true);
        setErr(tr.invalid);
      } else setErr(tr.fail);
    } catch {
      setErr(tr.fail);
    } finally {
      setLoading(false);
    }
  }

  if (token === null) return null;

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 dark:border-red-950">
      <h1 className="text-2xl font-bold">{tr.title}</h1>

      {!token && (
        <>
          <p className="text-sm text-red-600">{tr.noToken}</p>
          <Link href="/forgot-password" className="text-sm text-red-600 underline">
            {tr.again}
          </Link>
        </>
      )}

      {token && done && (
        <>
          <p className="text-sm text-green-700 dark:text-green-400">✅ {tr.done}</p>
          <Link href="/login" className="text-sm font-semibold text-red-600 underline">
            {tr.login}
          </Link>
        </>
      )}

      {token && !done && (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">
            {tr.password}
            <input
              className={field}
              type="password"
              minLength={8}
              maxLength={72}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            {tr.confirm}
            <input
              className={field}
              type="password"
              minLength={8}
              maxLength={72}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          {badLink && (
            <Link href="/forgot-password" className="block text-sm text-red-600 underline">
              {tr.again}
            </Link>
          )}
          <button
            disabled={loading}
            className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? tr.saving : tr.save}
          </button>
        </form>
      )}
    </div>
  );
}