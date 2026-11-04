"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAuth } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.status === 409) setError(t("exists"));
      else if (!res.ok) setError(t("regBad"));
      else {
        const data = await res.json();
        saveAuth(data.accessToken, data.fullName);
        router.push("/");
      }
    } catch {
      setError(t("noServer"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-red-100 p-6 dark:border-red-950"
    >
      <h1 className="text-2xl font-bold">{t("regTitle")}</h1>
      <label className="block text-sm">
        {t("fullName")}
        <input className={field} required value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("email")}
        <input className={field} type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("phone")}
        <input className={field} placeholder="01XXXXXXXXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </label>
      <label className="block text-sm">
        {t("passwordHint")}
        <input className={field} type="password" minLength={8} required value={form.password} onChange={(e) => set("password", e.target.value)} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? t("wait") : t("registerBtn")}
      </button>
      <p className="text-center text-sm">
        {t("haveAccount")}{" "}
        <Link href="/login" className="text-red-600 underline">
          {t("loginLink")}
        </Link>
      </p>
    </form>
  );
}