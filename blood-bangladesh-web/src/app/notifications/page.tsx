"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatTime } from "@/components/RequestFeed";

type Item = {
  id: string;
  type: string;
  responderName: string | null;
  responderPhone: string | null;
  patientName: string | null;
  bloodGroup: string | null;
  hospitalName: string | null;
  read: boolean;
  createdAt: string;
};

const text = {
  en: {
    title: "🔔 Notifications",
    empty: "No notifications yet.",
    markAll: "Mark all as read",
    wants: "{name} can donate blood for your request",
    patient: "Patient",
    hospital: "Hospital",
    call: "Call",
    error: "Could not load notifications. Please check that the server is running.",
    loading: "Loading...",
  },
  bn: {
    title: "🔔 নোটিফিকেশন",
    empty: "এখনো কোনো নোটিফিকেশন নেই।",
    markAll: "সব পড়া হয়েছে",
    wants: "{name} আপনার অনুরোধে রক্ত দিতে চান",
    patient: "রোগী",
    hospital: "হাসপাতাল",
    call: "কল করুন",
    error: "নোটিফিকেশন লোড করা যায়নি। সার্ভার চালু আছে কিনা দেখুন।",
    loading: "লোড হচ্ছে...",
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { lang } = useLang();
  const tr = text[lang];
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<Item[]>("/api/v1/notifications"));
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
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load, router]);

  async function markRead(n: Item) {
    if (n.read) return;
    setItems((list) => list?.map((x) => (x.id === n.id ? { ...x, read: true } : x)) ?? null);
    try {
      await api<{ ok: boolean }>(`/api/v1/notifications/${n.id}/read`, { method: "PATCH" });
      window.dispatchEvent(new Event("bb-notif"));
    } catch {}
  }

  async function markAll() {
    setItems((list) => list?.map((x) => ({ ...x, read: true })) ?? null);
    try {
      await api<{ ok: boolean }>("/api/v1/notifications/read-all", { method: "POST" });
      window.dispatchEvent(new Event("bb-notif"));
    } catch {}
  }

  if (error) return <p className="text-red-600">{tr.error}</p>;
  if (!items) return <p>{tr.loading}</p>;

  const hasUnread = items.some((n) => !n.read);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{tr.title}</h1>
        {hasUnread && (
          <button
            onClick={markAll}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
          >
            {tr.markAll}
          </button>
        )}
      </div>

      {items.length === 0 && <p className="text-gray-600 dark:text-gray-400">{tr.empty}</p>}

      {items.map((n) => (
        <div
          key={n.id}
          onClick={() => markRead(n)}
          className={`cursor-pointer rounded-2xl border p-4 ${
            n.read
              ? "border-gray-200 dark:border-gray-800"
              : "border-red-300 bg-red-50/60 dark:border-red-900 dark:bg-red-950/20"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 text-sm">
              <div className="text-base font-semibold">
                🩸 {tr.wants.replace("{name}", n.responderName ?? "—")}
              </div>
              {n.patientName && (
                <div>
                  {tr.patient}: {n.patientName}
                  {n.bloodGroup && ` (${groupLabel(n.bloodGroup)})`}
                </div>
              )}
              {n.hospitalName && (
                <div className="text-gray-600 dark:text-gray-400">
                  🏥 {tr.hospital}: {n.hospitalName}
                </div>
              )}
              <div className="text-xs text-gray-500">{formatTime(n.createdAt, lang)}</div>
            </div>
            {!n.read && <span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-red-600" />}
          </div>
          {n.responderPhone && (
            <a
              href={`tel:${n.responderPhone}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-3 inline-block rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              📞 {tr.call}: {n.responderPhone}
            </a>
          )}
        </div>
      ))}
    </div>
  );
}