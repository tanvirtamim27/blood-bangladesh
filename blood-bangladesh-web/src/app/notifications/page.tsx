"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatTime } from "@/components/RequestFeed";

type Item = {
  id: string;
  type: string;
  otherName: string | null;
  otherPhone: string | null;
  message: string | null;
  requestId: string | null;
  patientName: string | null;
  bloodGroup: string | null;
  hospitalName: string | null;
  confirmed: boolean;
  read: boolean;
  createdAt: string;
};

const text = {
  en: {
    title: "🔔 Notifications",
    empty: "No notifications yet.",
    markAll: "Mark all as read",
    responded: "{name} can donate blood for your request",
    messaged: "{name} sent you a message",
    confirmedMsg: "🎉 {name} confirmed your donation. Thank you for saving a life!",
    patient: "Patient",
    hospital: "Hospital",
    call: "Call",
    confirm: "Confirm donation",
    confirmedTag: "Donation confirmed",
    confirmHint: "Press this only after the donor has actually donated.",
    confirmOk: "Donation confirmed. The donor has been notified.",
    confirmDup: "Already confirmed, or this donor already has a donation recorded within the last 90 days.",
    confirmErr: "Could not confirm. Please try again.",
    askConfirm: "Confirm that this donor has donated blood for your patient?",
    error: "Could not load notifications. Please check that the server is running.",
    loading: "Loading...",
  },
  bn: {
    title: "🔔 নোটিফিকেশন",
    empty: "এখনো কোনো নোটিফিকেশন নেই।",
    markAll: "সব পড়া হয়েছে",
    responded: "{name} আপনার অনুরোধে রক্ত দিতে চান",
    messaged: "{name} আপনাকে একটি বার্তা পাঠিয়েছেন",
    confirmedMsg: "🎉 {name} আপনার রক্তদান নিশ্চিত করেছেন। জীবন বাঁচানোর জন্য ধন্যবাদ!",
    patient: "রোগী",
    hospital: "হাসপাতাল",
    call: "কল করুন",
    confirm: "রক্তদান নিশ্চিত করুন",
    confirmedTag: "রক্তদান নিশ্চিত হয়েছে",
    confirmHint: "দাতা সত্যিই রক্ত দেওয়ার পরই এটি চাপুন।",
    confirmOk: "রক্তদান নিশ্চিত হয়েছে। দাতাকে জানানো হয়েছে।",
    confirmDup: "আগেই নিশ্চিত করা হয়েছে, অথবা এই দাতার গত ৯০ দিনের মধ্যে আরেকটি রক্তদান আছে।",
    confirmErr: "নিশ্চিত করা যায়নি। আবার চেষ্টা করুন।",
    askConfirm: "এই দাতা আপনার রোগীর জন্য সত্যিই রক্ত দিয়েছেন, নিশ্চিত করবেন?",
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
  const [notice, setNotice] = useState<Record<string, string>>({});

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

  async function confirmDonation(n: Item) {
    if (!confirm(tr.askConfirm)) return;
    try {
      await api<{ ok: boolean }>(`/api/v1/notifications/${n.id}/confirm-donation`, { method: "POST" });
      setNotice((m) => ({ ...m, [n.id]: tr.confirmOk }));
      await load();
    } catch (e) {
      const s = (e as { status?: number }).status;
      setNotice((m) => ({ ...m, [n.id]: s === 409 ? tr.confirmDup : tr.confirmErr }));
    }
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

      {items.map((n) => {
        const name = n.otherName ?? "—";
        const headline =
          n.type === "DIRECT_MESSAGE"
            ? `✉️ ${tr.messaged.replace("{name}", name)}`
            : n.type === "DONATION_CONFIRMED"
              ? tr.confirmedMsg.replace("{name}", name)
              : `🩸 ${tr.responded.replace("{name}", name)}`;

        return (
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
                <div className="text-base font-semibold">{headline}</div>

                {n.type === "DIRECT_MESSAGE" && n.message && (
                  <div className="rounded-xl bg-gray-100 p-3 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                    {n.message}
                  </div>
                )}

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

            <div
              className="mt-3 flex flex-wrap items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {n.otherPhone && n.type !== "DONATION_CONFIRMED" && (
                <a
                  href={`tel:${n.otherPhone}`}
                  className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
                >
                  📞 {tr.call}: {n.otherPhone}
                </a>
              )}
              {n.type === "DONOR_RESPONSE" &&
                (n.confirmed ? (
                  <span className="rounded-xl bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                    ✅ {tr.confirmedTag}
                  </span>
                ) : (
                  <button
                    onClick={() => confirmDonation(n)}
                    className="rounded-xl border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    ✅ {tr.confirm}
                  </button>
                ))}
            </div>
            {n.type === "DONOR_RESPONSE" && !n.confirmed && (
              <p className="mt-2 text-xs text-gray-500">{tr.confirmHint}</p>
            )}
            {notice[n.id] && (
              <p className="mt-2 text-sm text-green-700 dark:text-green-400">{notice[n.id]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}