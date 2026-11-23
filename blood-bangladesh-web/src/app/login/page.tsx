"use client";
import { useLang } from "@/lib/i18n";
import GoogleButton from "@/components/GoogleButton";

const text = {
  en: {
    title: "Welcome to Blood Bangladesh",
    sub: "Sign in with your Google account. New here? Your account is created automatically.",
    points: [
      ["🔍", "Find blood donors near you"],
      ["🚨", "Post urgent blood requests"],
      ["🏅", "Earn badges for every donation"],
    ],
    note: "After signing in, add your name, phone number and address in your profile.",
    safe: "🔒 We never post anything on your Google account.",
  },
  bn: {
    title: "ব্লাড বাংলাদেশে স্বাগতম",
    sub: "আপনার Google অ্যাকাউন্ট দিয়ে সাইন ইন করুন। নতুন হলে অ্যাকাউন্ট নিজে থেকেই তৈরি হবে।",
    points: [
      ["🔍", "আপনার কাছের রক্তদাতা খুঁজুন"],
      ["🚨", "জরুরি রক্তের অনুরোধ জানান"],
      ["🏅", "প্রতিটি রক্তদানে ব্যাজ জিতুন"],
    ],
    note: "সাইন ইনের পর প্রোফাইলে নাম, ফোন নম্বর ও ঠিকানা যোগ করবেন।",
    safe: "🔒 আপনার Google অ্যাকাউন্টে আমরা কিছুই পোস্ট করি না।",
  },
};

export default function LoginPage() {
  const { lang } = useLang();
  const tr = text[lang];
  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl border border-red-100 shadow-xl md:grid-cols-2 dark:border-red-950">
      <div className="relative hidden flex-col justify-center gap-6 bg-gradient-to-br from-red-700 via-red-600 to-rose-500 p-10 text-white md:flex">
        <div className="animate-pulse-soft absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/20 blur-3xl" />
        <div className="animate-float text-7xl">🩸</div>
        <ul className="relative space-y-4">
          {tr.points.map(([icon, label]) => (
            <li key={label} className="flex items-center gap-3 text-lg font-medium">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-xl">
                {icon}
              </span>
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center gap-5 p-8 text-center sm:p-12">
        <div className="text-5xl md:hidden">🩸</div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{tr.title}</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">{tr.sub}</p>
        <div className="mt-2 w-full rounded-2xl border border-gray-200 p-5 shadow-sm transition hover:shadow-md dark:border-gray-800">
          <GoogleButton />
        </div>
        <p className="text-xs text-gray-500">{tr.note}</p>
        <p className="text-xs text-gray-500">{tr.safe}</p>
      </div>
    </div>
  );
}
