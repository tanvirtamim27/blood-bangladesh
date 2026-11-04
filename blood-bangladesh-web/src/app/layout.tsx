import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "ব্লাড বাংলাদেশ | Blood Bangladesh",
  description: "Find blood donors and post urgent blood requests in Bangladesh.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="min-h-screen">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}