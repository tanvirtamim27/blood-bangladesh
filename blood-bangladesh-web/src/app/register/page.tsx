"use client";

import { useLang } from "@/lib/i18n";
import GoogleButton from "@/components/GoogleButton";

const text = {
  en: {
    title: "Sign in",
    sub: "Continue with your Google account. New here? An account is created automatically.",
    note: "After signing in you will add your name, phone number and address in your profile.",
  },
  bn: {
    title: "সাইন ইন",
    sub: "আপনার Google অ্যাকাউন্ট দিয়ে এগিয়ে যান। নতুন হলে অ্যাকাউন্ট নিজে তৈরি হবে।",
    note: "সাইন ইনের পর প্রোফাইলে নাম, ফোন নম্বর ও ঠিকানা যোগ করবেন।",
  },
};

export default function LoginPage() {
  const { lang } = useLang();
  const tr = text[lang];

  return (
    <div className="mx-auto max-w-md space-y-5 rounded-2xl border border-red-100 p-8 text-center dark:border-red-950">
      <div className="text-5xl">🩸</div>
      <h1 className="text-2xl font-bold">{tr.title}</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">{tr.sub}</p>
      <GoogleButton />
      <p className="text-xs text-gray-500">{tr.note}</p>
    </div>
  );
}