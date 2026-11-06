"use client";

import Link from "next/link";
import { GROUPS } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import RequestFeed from "@/components/RequestFeed";

const copy = {
  en: {
    heroTitle: "One drop of blood, one life",
    heroText:
      "Find blood donors in your area in seconds, or join as a donor and help save someone's life.",
    find: "Find Donors",
    join: "Become a Donor",
    requests: "Blood Requests",
    live: "Urgent Blood Requests",
    all: "View all requests →",
    byGroup: "Search by blood group",
    howTitle: "How it works",
    steps: [
      ["1", "👤", "Create an account", "Register with email or Google and add your blood group and area."],
      ["2", "🔍", "Search or request", "Find donors near you, or post an urgent request for a patient."],
      ["3", "❤️", "Save a life", "Donors respond with one tap and you get notified instantly."],
    ],
    features: [
      ["✅", "90-day rule", "Recent donors automatically show as unavailable."],
      ["🔒", "Privacy first", "Phone numbers stay hidden unless you are logged in."],
      ["🏅", "Earn badges", "Log donations and unlock Regular Hero and Life Saver."],
    ],
    ctaTitle: "Ready to save a life?",
    ctaText: "It takes less than a minute to become a donor.",
  },
  bn: {
    heroTitle: "একটি ফোঁটা রক্ত, একটি জীবন",
    heroText:
      "আপনার এলাকার রক্তদাতা মুহূর্তে খুঁজুন, অথবা নিজে রক্তদাতা হিসেবে যুক্ত হয়ে কারো জীবন বাঁচান।",
    find: "রক্তদাতা খুঁজুন",
    join: "রক্তদাতা হোন",
    requests: "রক্তের অনুরোধ",
    live: "জরুরি রক্তের অনুরোধ",
    all: "সব অনুরোধ দেখুন →",
    byGroup: "রক্তের গ্রুপ অনুযায়ী খুঁজুন",
    howTitle: "কীভাবে কাজ করে",
    steps: [
      ["১", "👤", "অ্যাকাউন্ট খুলুন", "ইমেইল বা Google দিয়ে রেজিস্টার করে রক্তের গ্রুপ ও এলাকা দিন।"],
      ["২", "🔍", "খুঁজুন বা অনুরোধ করুন", "কাছের দাতা খুঁজুন, অথবা রোগীর জন্য জরুরি অনুরোধ পাঠান।"],
      ["৩", "❤️", "জীবন বাঁচান", "দাতা এক ক্লিকে সাড়া দেন, আপনি সঙ্গে সঙ্গে জানতে পারেন।"],
    ],
    features: [
      ["✅", "৯০ দিনের নিয়ম", "সম্প্রতি রক্ত দেওয়া দাতা নিজে থেকেই \"অনুপলব্ধ\" দেখায়।"],
      ["🔒", "গোপনীয়তা", "লগইন ছাড়া ফোন নম্বর আংশিক লুকানো থাকে।"],
      ["🏅", "ব্যাজ জিতুন", "রক্তদান লগ করে নিয়মিত হিরো ও জীবন রক্ষাকারী ব্যাজ পান।"],
    ],
    ctaTitle: "জীবন বাঁচাতে প্রস্তুত?",
    ctaText: "রক্তদাতা হতে এক মিনিটও লাগে না।",
  },
};

export default function Home() {
  const { lang } = useLang();
  const c = copy[lang];

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-700 via-red-600 to-rose-500 px-6 py-14 text-white shadow-xl sm:px-12 lg:py-20">
        <div className="animate-pulse-soft absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="animate-pulse-soft absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-rose-300/30 blur-3xl" />
        <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <h1 className="animate-fade-up text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              {c.heroTitle}
            </h1>
            <p className="animate-fade-up delay-1 mt-4 max-w-2xl text-lg text-red-50">{c.heroText}</p>
            <div className="animate-fade-up delay-2 mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="rounded-full bg-white px-7 py-3 font-semibold text-red-600 shadow-lg hover:scale-105"
              >
                🔍 {c.find}
              </Link>
              <Link
                href="/register"
                className="rounded-full border-2 border-white/80 px-7 py-3 font-semibold hover:bg-white/15"
              >
                {c.join}
              </Link>
              <Link
                href="/requests"
                className="rounded-full border-2 border-white/80 px-7 py-3 font-semibold hover:bg-white/15"
              >
                🩸 {c.requests}
              </Link>
            </div>
          </div>
          <div className="animate-float hidden text-[9rem] drop-shadow-2xl lg:block">🩸</div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-bold">🚨 {c.live}</h2>
          <Link href="/requests" className="text-sm font-semibold text-red-600 hover:underline">
            {c.all}
          </Link>
        </div>
        <RequestFeed limit={6} />
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-bold">{c.byGroup}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {GROUPS.map((g) => (
            <Link
              key={g.value}
              href={`/search?bg=${g.value}`}
              className="rounded-2xl border border-red-100 bg-red-50 py-5 text-center text-2xl font-extrabold text-red-600 hover:-translate-y-1 hover:bg-red-600 hover:text-white hover:shadow-lg dark:border-red-900 dark:bg-red-950/40 dark:hover:bg-red-600"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-center text-2xl font-bold">{c.howTitle}</h2>
        <div className="grid gap-5 md:grid-cols-3">
          {c.steps.map(([n, icon, title, text]) => (
            <div
              key={n}
              className="relative rounded-3xl border border-gray-200 p-6 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800"
            >
              <span className="absolute right-5 top-4 text-5xl font-black text-red-100 dark:text-red-950">
                {n}
              </span>
              <div className="text-4xl">{icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {c.features.map(([icon, title, text]) => (
          <div
            key={title}
            className="rounded-3xl bg-gradient-to-br from-red-50 to-white p-6 dark:from-red-950/30 dark:to-transparent"
          >
            <div className="text-3xl">{icon}</div>
            <h3 className="mt-2 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-500 p-10 text-center text-white shadow-lg">
        <h2 className="text-3xl font-bold">{c.ctaTitle}</h2>
        <p className="mt-2 text-red-50">{c.ctaText}</p>
        <Link
          href="/register"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-red-600 hover:scale-105"
        >
          {c.join}
        </Link>
      </section>
    </div>
  );
}