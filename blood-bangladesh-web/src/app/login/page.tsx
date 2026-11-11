"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAuth } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import GoogleButton from "@/components/GoogleButton";

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

const extra = {
  en: {
    unverified: "Your email is not verified yet. Please click the link we sent to your inbox.",
    resend: "Resend verification email",
    resent: "If this account needs verification, a new link has been sent.",
  },
  bn: {
    unverified: "আপনার ইমেইল এখনো ভেরিফাই হয়নি। ইনবক্সে পাঠানো লিংকে ক্লিক করুন।",
    resend: "ভেরিফিকেশন ইমেইল আবার পাঠান",
    resent: "ভেরিফিকেশন লাগলে নতুন লিংক পাঠানো হয়েছে।",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const ex = extra[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [needVerify, setNeedVerify] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");
    setNeedVerify(false);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 429) setError(t("tooMany"));
      else if (res.status === 401) setError(t("badLogin"));
      else if (res.status === 403) {
        setError(ex.unverified);
        setNeedVerify(true);
      } else if (!res.ok) setError(t("badData"));
      else {
        const data = await res.json();
        saveAuth(data.accessToken, data.fullName);
        router.push("/");
      }
    } catch {
      setError(t("noServer"));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setInfo("");
    try {
      await fetch("/api/v1/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setInfo(ex.resent);
    } catch {
      setError(t("noServer"));
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 dark:border-red-950"
    >
      <h1 className="text-2xl font-bold">{t("loginTitle")}</h1>
      <label className="block text-sm">
        {t("email")}
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("password")}
        <input className={field} type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      <div className="text-right text-sm">
        <Link href="/forgot-password" className="text-red-600 hover:underline">
          {lang === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}
        </Link>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {needVerify && (
        <button type="button" onClick={resend} className="text-sm font-semibold text-red-600 underline">
          {ex.resend}
        </button>
      )}
      {info && <p className="text-sm text-green-700 dark:text-green-400">{info}</p>}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? t("wait") : t("loginBtn")}
      </button>
      <GoogleButton />
      <p className="text-center text-sm">
        {t("noAccount")}{" "}
        <Link href="/register" className="text-red-600 underline">
          {t("registerLink")}
        </Link>
      </p>
    </form>
  );
}