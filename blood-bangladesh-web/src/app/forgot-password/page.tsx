"use client";

import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const text = {
  en: {
    title: "Forgot password",
    hint: "Enter your account email. We will send you a link to reset your password.",
    email: "Email",
    send: "Send reset link",
    sending: "Please wait...",
    done: "If an account exists for this email, a reset link has been sent. It is valid for 30 minutes.",
    many: "Too many requests. Please try again later.",
    fail: "Something went wrong. Please try again.",
    back: "← Back to login",
  },
  bn: {
    title: "পাসওয়ার্ড ভুলে গেছেন",
    hint: "আপনার অ্যাকাউন্টের ইমেইল দিন। পাসওয়ার্ড রিসেটের লিংক পাঠানো হবে।",
    email: "ইমেইল",
    send: "রিসেট লিংক পাঠান",
    sending: "অপেক্ষা করুন...",
    done: "এই ইমেইলে অ্যাকাউন্ট থাকলে রিসেটের লিংক পাঠানো হয়েছে। লিংক ৩০ মিনিট বৈধ।",
    many: "অনেকবার অনুরোধ হয়েছে। একটু পরে আবার চেষ্টা করুন।",
    fail: "কিছু ভুল হয়েছে। আবার চেষ্টা করুন।",
    back: "← লগইনে ফিরুন",
  },
};

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function ForgotPasswordPage() {
  const { lang } = useLang();
  const tr = text[lang];
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.status === 429) setErr(tr.many);
      else if (!res.ok) setErr(tr.fail);
      else setMsg(tr.done);
    } catch {
      setErr(tr.fail);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 dark:border-red-950"
    >
      <h1 className="text-2xl font-bold">{tr.title}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{tr.hint}</p>
      <label className="block text-sm">
        {tr.email}
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {msg && <p className="text-sm text-green-700 dark:text-green-400">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? tr.sending : tr.send}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="text-red-600 underline">
          {tr.back}
        </Link>
      </p>
    </form>
  );
}