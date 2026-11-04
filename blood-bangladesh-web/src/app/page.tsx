"use client";

import Link from "next/link";
import { GROUPS } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Home() {
  const { t } = useLang();
  const features = [
    ["🔍", t("f1t"), t("f1d")],
    ["✅", t("f2t"), t("f2d")],
    ["🔒", t("f3t"), t("f3d")],
  ];

  return (
    <div className="space-y-10">
      <section className="rounded-3xl bg-gradient-to-br from-red-600 to-rose-500 p-8 text-white shadow-lg sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{t("heroTitle")}</h1>
        <p className="mt-3 max-w-xl text-red-50">{t("heroText")}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/search"
            className="rounded-xl bg-white px-5 py-2.5 font-semibold text-red-600 hover:bg-red-50"
          >
            {t("heroFind")}
          </Link>
          <Link
            href="/register"
            className="rounded-xl border border-white/70 px-5 py-2.5 font-semibold hover:bg-white/10"
          >
            {t("heroJoin")}
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{t("byGroup")}</h2>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {GROUPS.map((g) => (
            <Link
              key={g.value}
              href={`/search?bg=${g.value}`}
              className="rounded-2xl border border-red-100 bg-red-50 py-4 text-center text-xl font-bold text-red-600 transition hover:scale-105 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:hover:bg-red-950"
            >
              {g.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map(([icon, title, text]) => (
          <div key={title} className="rounded-2xl border border-gray-200 p-5 dark:border-gray-800">
            <div className="text-2xl">{icon}</div>
            <h3 className="mt-2 font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}