"use client";

import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
      {t("footer")}
    </footer>
  );
}