"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { api, clearAuth, getRole } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function logout() {
    clearAuth();
    setOpen(false);
    router.push("/");
  }

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
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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

  const links = [
    ...(name
      ? [
          { href: "/donations", label: lang === "bn" ? "রক্তদান" : "Donations" },
          { href: "/profile", label: t("navProfile") },
        ]
      : []),
    ...(isAdmin ? [{ href: "/admin", label: "🛡️ Admin" }] : []),
  ];

  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const linkCls = (href: string) =>
    `rounded-full px-3 py-1.5 text-sm font-medium ${
      active(href)
        ? "bg-red-600 text-white shadow"
        : "text-gray-700 hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-950/40"
    }`;

  const iconBtn =
    "rounded-full border border-gray-200 px-3 py-1.5 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900";

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur ${
        scrolled
          ? "border-red-100 bg-white/95 shadow-md dark:border-red-950 dark:bg-[#0f0f12]/95"
          : "border-transparent bg-white/70 dark:bg-[#0f0f12]/70"
      }`}
    >
      <nav className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-red-600 sm:text-xl">
          <span className="animate-float inline-block">🩸</span>
          <span>{t("brand")}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={linkCls(l.href)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {name ? (
            <>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className={`relative ${iconBtn}`}
              >
                🔔
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-red-600 px-1 text-center text-xs font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
              <span
                title={name}
                className="hidden h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-rose-500 text-sm font-bold text-white sm:flex"
              >
                {name.charAt(0).toUpperCase()}
              </span>
              <button
                onClick={logout}
                className="hidden rounded-full border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 sm:block dark:border-red-900 dark:hover:bg-red-950"
              >
                {t("navLogout")}
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className={linkCls("/login")}>
                {t("navLogin")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-red-700"
              >
                {t("navRegister")}
              </Link>
            </div>
          )}
          <button
            aria-label="Language"
            onClick={() => setLang(lang === "bn" ? "en" : "bn")}
            className={iconBtn}
          >
            {lang === "bn" ? "EN" : "বাংলা"}
          </button>
          <button
            aria-label={t("theme")}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={iconBtn}
          >
            {mounted ? (theme === "dark" ? "☀️" : "🌙") : "🌙"}
          </button>
          <button
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className={`md:hidden ${iconBtn}`}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {open && (
        <div className="animate-fade-up border-t border-red-100 bg-white px-4 pb-4 pt-2 md:hidden dark:border-red-950 dark:bg-[#0f0f12]">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={`${linkCls(l.href)} py-2.5`}>
                {l.label}
              </Link>
            ))}
            {name ? (
              <button
                onClick={logout}
                className="mt-2 rounded-full border border-red-200 px-3 py-2.5 text-sm text-red-600 dark:border-red-900"
              >
                {t("navLogout")} ({name})
              </button>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="rounded-full border border-gray-300 px-3 py-2.5 text-center text-sm dark:border-gray-700"
                >
                  {t("navLogin")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-red-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  {t("navRegister")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}