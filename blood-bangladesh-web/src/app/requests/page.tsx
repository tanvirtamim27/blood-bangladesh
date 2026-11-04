"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GROUPS, getToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import RequestFeed from "@/components/RequestFeed";

const field =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function RequestsPage() {
  const { t } = useLang();
  const [bg, setBg] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const read = () => setLoggedIn(!!getToken());
    read();
    window.addEventListener("bb-auth", read);
    return () => window.removeEventListener("bb-auth", read);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t("reqPageTitle")}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select className={field} value={bg} onChange={(e) => setBg(e.target.value)}>
            <option value="">{t("all")}</option>
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
          {loggedIn && (
            <Link
              href="/requests/mine"
              className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
            >
              {t("myRequests")}
            </Link>
          )}
          <Link
            href="/requests/new"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            {t("postRequest")}
          </Link>
        </div>
      </div>
      <RequestFeed limit={30} bloodGroup={bg} />
    </div>
  );
}