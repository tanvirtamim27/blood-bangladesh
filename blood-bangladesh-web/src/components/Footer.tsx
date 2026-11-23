"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRole } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { lang, t } = useLang();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const read = () => setIsAdmin(getRole() === "ROLE_ADMIN");
    read();
    window.addEventListener("bb-auth", read);
    return () => window.removeEventListener("bb-auth", read);
  }, []);

  const link = "hover:text-red-600 hover:underline";
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <div className="mb-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        <Link href="/blog" className={link}>
          {lang === "bn" ? "রক্তদান ব্লগ" : "Blog"}
        </Link>
        <Link href="/search" className={link}>
          {t("navFind")}
        </Link>
        <Link href="/requests" className={link}>
          {t("navRequests")}
        </Link>
        <Link href="/privacy" className={link}>
          {lang === "bn" ? "গোপনীয়তা নীতি" : "Privacy Policy"}
        </Link>
        <Link href="/terms" className={link}>
          {lang === "bn" ? "শর্তাবলী" : "Terms"}
        </Link>
        {isAdmin && (
          <Link href="/admin/blog" className={link}>
            🛡️ {lang === "bn" ? "ব্লগ ম্যানেজ" : "Manage blog"}
          </Link>
        )}
      </div>
      <div>© 2026 Blood Bangladesh. All Rights Reserved.</div>
    </footer>
  );
}
