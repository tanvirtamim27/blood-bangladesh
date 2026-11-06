"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export type RequestItem = {
  id: string;
  patientName: string;
  bloodGroup: string;
  unitsNeeded: number;
  hospitalName: string;
  districtName: string | null;
  districtNameBn: string | null;
  upazilaName: string | null;
  upazilaNameBn: string | null;
  contactNumber: string | null;
  neededAt: string;
  note: string | null;
  urgent: boolean;
  status: string;
  createdAt: string;
};

export function formatTime(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "bn" ? "bn-BD" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
  });
}

export function placeOf(r: RequestItem, lang: string) {
  const up = lang === "bn" ? r.upazilaNameBn : r.upazilaName;
  const di = lang === "bn" ? r.districtNameBn : r.districtName;
  return [up, di].filter(Boolean).join(", ");
}

export default function RequestFeed({
  limit = 20,
  bloodGroup = "",
}: {
  limit?: number;
  bloodGroup?: string;
}) {
  const { lang, t } = useLang();
  const router = useRouter();
  const [items, setItems] = useState<RequestItem[] | null>(null);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    const p = new URLSearchParams({ limit: String(limit) });
    if (bloodGroup) p.set("bloodGroup", bloodGroup);
    try {
      setItems(await api<RequestItem[]>(`/api/v1/requests?${p}`));
      setError(false);
    } catch {
      setError(true);
    }
  }, [limit, bloodGroup]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    if (!getToken()) return;
    api<string[]>("/api/v1/users/me/responded-requests")
      .then((ids) => setDone(Object.fromEntries(ids.map((id) => [id, true]))))
      .catch(() => {});
  }, []);

  async function respond(id: string) {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    let msg = "";
    try {
      await api<{ ok: boolean }>(`/api/v1/requests/${id}/respond`, { method: "POST" });
      msg = t("respondOk");
      setDone((d) => ({ ...d, [id]: true }));
    } catch (e) {
      const s = (e as { status?: number }).status;
      if (s === 401) {
        router.push("/login");
        return;
      }
      if (s === 409) {
        msg = t("respondDup");
        setDone((d) => ({ ...d, [id]: true }));
      } else if (s === 400) {
        msg = t("respondNeedProfile") + " / " + t("respondOwn");
      } else {
        msg = t("saveError");
      }
    }
    setNotice((n) => ({ ...n, [id]: msg }));
  }

  if (error && !items) return <p className="text-red-600">{t("reqLoadError")}</p>;
  if (!items) return <p>{t("profLoading")}</p>;
  if (items.length === 0) return <p className="text-gray-600 dark:text-gray-400">{t("reqNone")}</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {items.map((r) => (
        <div
          key={r.id}
          className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-lg ${
            r.urgent
              ? "border-red-300 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
              : "border-gray-200 dark:border-gray-800"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600 dark:bg-red-950">
                {groupLabel(r.bloodGroup)}
              </div>
              <div className="space-y-0.5 text-sm">
                <div className="text-base font-semibold">
                  {r.patientName}{" "}
                  {r.urgent && (
                    <span className="ml-1 rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                      {t("urgent")}
                    </span>
                  )}
                </div>
                <div>
                  🏥 {r.hospitalName}
                  {placeOf(r, lang) && ` · ${placeOf(r, lang)}`}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  🕒 {t("neededAt")}: {formatTime(r.neededAt, lang)} · {t("bags", { n: r.unitsNeeded })}
                </div>
                {r.note && <div className="text-gray-600 dark:text-gray-400">📝 {r.note}</div>}
              </div>
            </div>
            <div className="shrink-0 text-right text-sm">
              <div className="text-gray-500">{t("contact")}</div>
              <div className="font-semibold">{r.contactNumber ?? "—"}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-green-700 dark:text-green-400">{notice[r.id]}</span>
            <button
              onClick={() => respond(r.id)}
              disabled={done[r.id]}
              className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${
                done[r.id]
                  ? "cursor-default bg-green-600"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {done[r.id] ? "✅" : "🩸"} {t("canDonate")}
            </button>
          </div>
        </div>
      ))}
      <p className="text-center text-xs text-gray-500 lg:col-span-2">{t("reqLive")}</p>
    </div>
  );
}