"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Donation = {
  id: string;
  donationDate: string;
  hospitalName: string | null;
  notes: string | null;
};
type Badge = {
  code: string;
  nameEn: string;
  nameBn: string;
  minDonations: number;
  icon: string | null;
  earned: boolean;
};
type Overview = { hasProfile: boolean; total: number; items: Donation[]; badges: Badge[] };

const text = {
  en: {
    title: "🩸 My Donations & Badges",
    loading: "Loading...",
    error: "Could not load. Please check that the server is running.",
    badges: "Badges",
    total: "Total donations",
    nextOk: "You can donate again from {d}.",
    nowOk: "You are eligible to donate now.",
    addTitle: "Log a donation",
    date: "Donation date",
    hospital: "Hospital (optional)",
    notes: "Notes (optional)",
    add: "Add donation",
    adding: "Saving...",
    history: "History",
    empty: "No donations logged yet.",
    del: "Delete",
    confirmDel: "Delete this donation record?",
    needProfile: "Create your donor profile first.",
    goProfile: "Go to My Profile →",
    dup: "Another donation is already logged within 90 days of this date.",
    future: "The date cannot be in the future.",
    bad: "Could not save. Please check your details.",
    saved: "Donation added.",
    note: "Donations are self-reported for now.",
  },
  bn: {
    title: "🩸 আমার রক্তদান ও ব্যাজ",
    loading: "লোড হচ্ছে...",
    error: "লোড করা যায়নি। সার্ভার চালু আছে কিনা দেখুন।",
    badges: "ব্যাজ",
    total: "মোট রক্তদান",
    nextOk: "আপনি {d} থেকে আবার রক্ত দিতে পারবেন।",
    nowOk: "আপনি এখন রক্ত দিতে পারবেন।",
    addTitle: "রক্তদান যোগ করুন",
    date: "রক্তদানের তারিখ",
    hospital: "হাসপাতাল (ঐচ্ছিক)",
    notes: "মন্তব্য (ঐচ্ছিক)",
    add: "যোগ করুন",
    adding: "সেভ হচ্ছে...",
    history: "ইতিহাস",
    empty: "এখনো কোনো রক্তদান যোগ করা হয়নি।",
    del: "মুছুন",
    confirmDel: "এই রক্তদানের রেকর্ড মুছবেন?",
    needProfile: "আগে আপনার রক্তদাতা প্রোফাইল তৈরি করুন।",
    goProfile: "আমার প্রোফাইলে যান →",
    dup: "এই তারিখের ৯০ দিনের মধ্যে আরেকটি রক্তদান আগেই যোগ করা আছে।",
    future: "তারিখ ভবিষ্যতের হতে পারে না।",
    bad: "সেভ করা যায়নি। তথ্য ঠিক আছে কিনা দেখুন।",
    saved: "রক্তদান যোগ হয়েছে।",
    note: "এখন রক্তদানের তথ্য দাতা নিজে দেন।",
  },
};

const ICONS: Record<string, string> = { droplet: "🩸", heart: "❤️", shield: "🛡️" };

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function DonationsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const tr = text[lang];

  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState(false);
  const [date, setDate] = useState("");
  const [hospital, setHospital] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>("/api/v1/users/me/donations"));
      setError(false);
    } catch {
      if (!getToken()) router.replace("/login");
      else setError(true);
    }
  }, [router]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    load();
  }, [load, router]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setErr("");
    setSaving(true);
    try {
      await api("/api/v1/users/me/donations", {
        method: "POST",
        body: JSON.stringify({
          donationDate: date,
          hospitalName: hospital.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      setDate("");
      setHospital("");
      setNotes("");
      setMsg(tr.saved);
      load();
    } catch (x) {
      const s = (x as { status?: number }).status;
      if (s === 409) setErr(tr.dup);
      else if (s === 400 && data && !data.hasProfile) setErr(tr.needProfile);
      else if (s === 400 && date > today) setErr(tr.future);
      else setErr(tr.bad);
    } finally {
      setSaving(false);
    }
  }

  async function remove(d: Donation) {
    if (!confirm(tr.confirmDel)) return;
    try {
      await api(`/api/v1/users/me/donations/${d.id}`, { method: "DELETE" });
      load();
    } catch {
      setErr(tr.bad);
    }
  }

  if (error) return <p className="text-red-600">{tr.error}</p>;
  if (!data) return <p>{tr.loading}</p>;

  let eligibility = tr.nowOk;
  if (data.items.length > 0) {
    const next = new Date(data.items[0].donationDate + "T00:00:00");
    next.setDate(next.getDate() + 90);
    if (next > new Date()) {
      eligibility = tr.nextOk.replace(
        "{d}",
        next.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium" }),
      );
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{tr.title}</h1>

      {!data.hasProfile && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {tr.needProfile}{" "}
          <Link href="/profile" className="font-semibold underline">
            {tr.goProfile}
          </Link>
        </div>
      )}

      <section>
        <h2 className="mb-2 font-semibold">{tr.badges}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.badges.map((b) => (
            <div
              key={b.code}
              className={`rounded-2xl border p-4 text-center ${
                b.earned
                  ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
                  : "border-gray-200 opacity-60 dark:border-gray-800"
              }`}
            >
              <div className={`text-4xl ${b.earned ? "" : "grayscale"}`}>
                {ICONS[b.icon ?? ""] ?? "🏅"}
              </div>
              <div className="mt-1 font-semibold">{lang === "bn" ? b.nameBn : b.nameEn}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {b.earned ? "✅" : `${Math.min(data.total, b.minDonations)}/${b.minDonations}`}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-gray-200 p-4 text-sm dark:border-gray-800">
        <div>
          {tr.total}: <span className="text-lg font-bold text-red-600">{data.total}</span>
        </div>
        <div className="mt-1 text-gray-600 dark:text-gray-400">{eligibility}</div>
      </div>

      <form
        onSubmit={add}
        className="grid gap-3 rounded-2xl border border-red-100 p-4 sm:grid-cols-2 dark:border-red-950"
      >
        <h2 className="font-semibold sm:col-span-2">{tr.addTitle}</h2>
        <label className="text-sm">
          {tr.date}
          <input
            className={field}
            type="date"
            required
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <label className="text-sm">
          {tr.hospital}
          <input className={field} value={hospital} onChange={(e) => setHospital(e.target.value)} />
        </label>
        <label className="text-sm sm:col-span-2">
          {tr.notes}
          <input className={field} maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>
        {msg && <p className="text-sm text-green-700 sm:col-span-2 dark:text-green-400">{msg}</p>}
        {err && <p className="text-sm text-red-600 sm:col-span-2">{err}</p>}
        <button
          disabled={saving || !data.hasProfile}
          className="rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:col-span-2"
        >
          {saving ? tr.adding : tr.add}
        </button>
        <p className="text-xs text-gray-500 sm:col-span-2">{tr.note}</p>
      </form>

      <section className="space-y-2">
        <h2 className="font-semibold">{tr.history}</h2>
        {data.items.length === 0 && <p className="text-gray-600 dark:text-gray-400">{tr.empty}</p>}
        {data.items.map((d) => (
          <div
            key={d.id}
            className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 p-3 text-sm dark:border-gray-800"
          >
            <div>
              <div className="font-semibold">
                🩸{" "}
                {new Date(d.donationDate + "T00:00:00").toLocaleDateString(
                  lang === "bn" ? "bn-BD" : "en-GB",
                  { dateStyle: "medium" },
                )}
              </div>
              {d.hospitalName && <div className="text-gray-600 dark:text-gray-400">🏥 {d.hospitalName}</div>}
              {d.notes && <div className="text-gray-600 dark:text-gray-400">📝 {d.notes}</div>}
            </div>
            <button
              onClick={() => remove(d)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              {tr.del}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}