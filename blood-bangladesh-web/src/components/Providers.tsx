"use client";

import { ThemeProvider } from "next-themes";
import { LangProvider } from "@/lib/i18n";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}