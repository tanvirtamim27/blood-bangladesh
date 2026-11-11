"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n";

const text = {
  en: {
    working: "Verifying your email...",
    ok: "✅ Your email is verified. You can log in now.",
    bad: "This link is invalid or has expired. Log in and request a new verification email.",
    noToken: "This verification link is incomplete.",
    login: "Go to login →",
  },
  bn: {
    working: "ইমেইল ভেরিফাই করা হচ্ছে...",
    ok: "✅ আপনার ইমেইল ভেরিফাইড হয়েছে। এখন লগইন করতে পারবেন।",
    bad: "লিংকটি ভুল বা মেয়াদ শেষ। লগইন পেজ থেকে নতুন ভেরিফিকেশন ইমেইল চান।",
    noToken: "ভেরিফিকেশন লিংকটি অসম্পূর্ণ।",
    login: "লগইনে যান →",
  },
};

export default function VerifyEmailPage() {
  const { lang } = useLang();
  const tr = text[lang];
  const [state, setState] = useState<"working" | "ok" | "bad" | "none">("working");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("none");
      return;
    }
    fetch("/api/v1/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => setState(r.ok ? "ok" : "bad"))
      .catch(() => setState("bad"));
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 text-center dark:border-red-950">
      {state === "working" && <p>{tr.working}</p>}
      {state === "ok" && <p className="text-green-700 dark:text-green-400">{tr.ok}</p>}
      {state === "bad" && <p className="text-red-600">{tr.bad}</p>}
      {state === "none" && <p className="text-red-600">{tr.noToken}</p>}
      <Link href="/login" className="inline-block font-semibold text-red-600 underline">
        {tr.login}
      </Link>
    </div>
  );
}