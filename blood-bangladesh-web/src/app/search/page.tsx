"use client";

import { useEffect, useState } from "react";
import { api, GROUPS, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Loc = { id: number; nameEn: string; nameBn: string };
type Donor = {
  id: string;
  fullName: string;
  phone: string | null;
  bloodGroup: string;
  districtName: string | null;
  upazilaName: string | null;
  lastDonationDate: string | null;
  totalDonations: number;
  verified: boolean;
  available: boolean;
};
type Result = { items: Donor[]; page: number; total: number; totalPages: number };

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function SearchPage() {
  const { lang, t } = useLang();
  const [bg, setBg] = useState("O_POS");
  const [divisions, setDivisions] = useState<Loc[]>([]);
  const [districts, setDistricts] = useState<Loc[]>([]);
  const [upazilas, setUpazilas] = useState<Loc[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const locName = (l: Loc) => (lang === "bn" ? l.nameBn : l.nameEn);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("bg");
    if (q && GROUPS.some((g) => g.value === q)) setBg(q);
    api<Loc[]>("/api/v1/locations/divisions").then(setDivisions).catch(() => {});
  }, []);

  async function onDivision(id: string) {
    setDivisionId(id);
    setDistrictId("");
    setUpazilaId("");
    setDistricts([]);
    setUpazilas([]);
    if (id) setDistricts(await api<Loc[]>(`/api/v1/locations/divisions/${id}/districts`));
  }

  async function onDistrict(id: string) {
    setDistrictId(id);
    setUpazilaId("");
    setUpazilas([]);
    if (id) setUpazilas(await api<Loc[]>(`/api/v1/locations/districts/${id}/upazilas`));
  }

  async function search(page = 0) {
    setLoading(true);
    setError("");
    const p = new URLSearchParams({ bloodGroup: bg, page: String(page), size: "10" });
    if (districtId) p.set("districtId", districtId);
    if (upazilaId) p.set("upazilaId", upazilaId);
    try {
      setResult(await api<Result>(`/api/v1/donors/search?${p}`));
    } catch {
      setError(t("searchError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("searchTitle")}</h1>

      <div className="grid gap-3 rounded-2xl border border-red-100 p-4 sm:grid-cols-4 dark:border-red-950">
        <label className="text-sm">
          {t("group")}
          <select className={field} value={bg} onChange={(e) => setBg(e.target.value)}>
            {GROUPS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("division")}
          <select className={field} value={divisionId} onChange={(e) => onDivision(e.target.value)}>
            <option value="">{t("all")}</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {locName(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("district")}
          <select
            className={field}
            value={districtId}
            disabled={!districts.length}
            onChange={(e) => onDistrict(e.target.value)}
          >
            <option value="">{t("all")}</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {locName(d)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          {t("upazila")}
          <select
            className={field}
            value={upazilaId}
            disabled={!upazilas.length}
            onChange={(e) => setUpazilaId(e.target.value)}
          >
            <option value="">{t("all")}</option>
            {upazilas.map((d) => (
              <option key={d.id} value={d.id}>
                {locName(d)}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={() => search(0)}
          className="rounded-xl bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700 sm:col-span-4"
        >
          {loading ? t("searching") : t("searchBtn")}
        </button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {result && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">{t("found", { n: result.total })}</p>
          {result.items.length === 0 && <p>{t("none")}</p>}
          {result.items.map((d) => (
            <div
              key={d.id}
              className={`flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4 dark:border-gray-800 ${
                d.available ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600 dark:bg-red-950">
                  {groupLabel(d.bloodGroup)}
                </div>
                <div>
                  <div className="font-semibold">
                    {d.fullName} {d.verified && <span title={t("verified")}>✅</span>}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {[d.upazilaName, d.districtName].filter(Boolean).join(", ") || t("noArea")}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t("lastDonation")}: {d.lastDonationDate ?? t("never")} ·{" "}
                    {t("timesTotal", { n: d.totalDonations })}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    d.available
                      ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                      : "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {d.available ? t("ready") : t("unavailable")}
                </span>
                <div className="mt-2 text-sm font-medium">{d.phone ?? "—"}</div>
              </div>
            </div>
          ))}

          {result.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                disabled={result.page === 0}
                onClick={() => search(result.page - 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
              >
                {t("prev")}
              </button>
              <span className="text-sm">
                {result.page + 1} / {result.totalPages}
              </span>
              <button
                disabled={result.page + 1 >= result.totalPages}
                onClick={() => search(result.page + 1)}
                className="rounded-lg border px-3 py-1.5 disabled:opacity-40 dark:border-gray-700"
              >
                {t("next")}
              </button>
            </div>
          )}
          <p className="text-center text-xs text-gray-500">{t("loginHint")}</p>
        </div>
      )}
    </div>
  );
}