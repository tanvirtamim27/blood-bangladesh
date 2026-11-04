"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { api, clearAuth, getRole } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMounted(true);
    const read = () => {
      setName(localStorage.getItem("bb_name"));
      setIsAdmin(getRole() === "ROLE_ADMIN");
    };
    read();
    window.addEventListener("bb-auth", read);
    return () => window.removeEventListener("bb-auth", read);
  }, []);

  useEffect(() => {
    if (!name) {
      setUnread(0);
      return;
    }
    const load = () =>
      api<{ count: number }>("/api/v1/notifications/unread-count")
        .then((r) => setUnread(r.count))
        .catch(() => {});
    load();
    const id = setInterval(load, 30000);
    window.addEventListener("bb-notif", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("bb-notif", load);
    };
  }, [name]);

  return (
    <header className="sticky top-0 z-10 border-b border-red-100 bg-white/90 backdrop-blur dark:border-red-950 dark:bg-[#0f0f12]/90">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-red-600">
          <span>🩸</span> {t("brand")}
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/search" className="hover:text-red-600">
            {t("navFind")}
          </Link>
          <Link href="/requests" className="hover:text-red-600">
            {t("navRequests")}
          </Link>
          {name ? (
            <>
              <Link href="/profile" className="hover:text-red-600">
                {t("navProfile")}
              </Link>
              {isAdmin && (
                <Link href="/admin" className="font-semibold text-red-600 hover:underline">
                  🛡️ Admin
                </Link>
              )}
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative rounded-lg border border-gray-200 px-2 py-1.5 dark:border-gray-700"
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -right-2 -top-2 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <span className="hidden text-gray-600 md:inline dark:text-gray-300">{name}</span>
              <button
                onClick={clearAuth}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
              >
                {t("navLogout")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-red-600">
                {t("navLogin")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
              >
                {t("navRegister")}
              </Link>
            </>
          )}
          <button
            aria-label="Language"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className="rounded-lg border border-gray-200 px-2.5 py-1.5 font-semibold dark:border-gray-700"
          >
            {lang === "bn" ? "EN" : "বাংলা"}
          </button>
          <button
            aria-label={t("theme")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-lg border border-gray-200 px-2 py-1.5 dark:border-gray-700"
          >
            {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌙"}
          </button>
        </div>
      </nav>
    </header>
  );
}