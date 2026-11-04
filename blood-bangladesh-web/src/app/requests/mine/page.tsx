"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatTime, placeOf, type RequestItem } from "@/components/RequestFeed";

export default function MyRequestsPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const [items, setItems] = useState<RequestItem[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await api<RequestItem[]>("/api/v1/users/me/requests"));
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

  async function setStatus(id: string, status: "FULFILLED" | "CANCELLED") {
    try {
      await api<{ ok: boolean }>(`/api/v1/requests/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch {
      setError(true);
    }
  }

  if (error) return <p className="text-red-600">{t("reqLoadError")}</p>;
  if (!items) return <p>{t("profLoading")}</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">{t("reqMineTitle")}</h1>
      {items.length === 0 && <p>{t("reqMineEmpty")}</p>}
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-950">
                {groupLabel(r.bloodGroup)}
              </div>
              <div className="text-sm">
                <div className="text-base font-semibold">{r.patientName}</div>
                <div>
                  🏥 {r.hospitalName}
                  {placeOf(r, lang) && ` · ${placeOf(r, lang)}`}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  🕒 {formatTime(r.neededAt, lang)} · {t("bags", { n: r.unitsNeeded })}
                </div>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                r.status === "OPEN"
                  ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                  : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {t(`st${r.status}` as "stOPEN" | "stFULFILLED" | "stCANCELLED" | "stEXPIRED")}
            </span>
          </div>
          {r.status === "OPEN" && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setStatus(r.id, "FULFILLED")}
                className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                ✅ {t("markFulfilled")}
              </button>
              <button
                onClick={() => setStatus(r.id, "CANCELLED")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-700"
              >
                {t("cancelReq")}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}