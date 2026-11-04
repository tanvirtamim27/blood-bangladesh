"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, GROUPS } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Loc = { id: number; nameEn: string; nameBn: string };

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function NewRequestPage() {
  const router = useRouter();
  const { lang, t } = useLang();

  const [patientName, setPatientName] = useState("");
  const [bg, setBg] = useState("");
  const [units, setUnits] = useState("1");
  const [hospital, setHospital] = useState("");
  const [contact, setContact] = useState("");
  const [neededAt, setNeededAt] = useState("");
  const [note, setNote] = useState("");
  const [urgent, setUrgent] = useState(true);

  const [divisions, setDivisions] = useState<Loc[]>([]);
  const [districts, setDistricts] = useState<Loc[]>([]);
  const [upazilas, setUpazilas] = useState<Loc[]>([]);
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const locName = (l: Loc) => (lang === "bn" ? l.nameBn : l.nameEn);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    api<Loc[]>("/api/v1/locations/divisions").then(setDivisions).catch(() => {});
  }, [router]);

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

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api<{ id: string }>("/api/v1/requests", {
        method: "POST",
        body: JSON.stringify({
          patientName,
          bloodGroup: bg,
          unitsNeeded: Number(units),
          hospitalName: hospital,
          districtId: districtId ? Number(districtId) : null,
          upazilaId: upazilaId ? Number(upazilaId) : null,
          contactNumber: contact,
          neededAt,
          note: note.trim() || null,
          urgent,
        }),
      });
      router.push("/requests");
    } catch (err) {
      const s = (err as { status?: number }).status;
      if (s === 401) router.push("/login");
      else setError(t("reqBad"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mx-auto grid max-w-2xl gap-3 rounded-2xl border border-red-100 p-6 sm:grid-cols-2 dark:border-red-950"
    >
      <h1 className="text-2xl font-bold sm:col-span-2">{t("reqNewTitle")}</h1>

      <label className="text-sm">
        {t("patientName")}
        <input className={field} required value={patientName} onChange={(e) => setPatientName(e.target.value)} />
      </label>
      <label className="text-sm">
        {t("group")}
        <select className={field} required value={bg} onChange={(e) => setBg(e.target.value)}>
          <option value="">{t("choose")}</option>
          {GROUPS.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        {t("units")}
        <input className={field} type="number" min={1} max={10} required value={units} onChange={(e) => setUnits(e.target.value)} />
      </label>
      <label className="text-sm">
        {t("hospitalName")}
        <input className={field} required value={hospital} onChange={(e) => setHospital(e.target.value)} />
      </label>
      <label className="text-sm">
        {t("division")}
        <select className={field} value={divisionId} onChange={(e) => onDivision(e.target.value)}>
          <option value="">{t("choose")}</option>
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
          required
          value={districtId}
          disabled={!districts.length}
          onChange={(e) => onDistrict(e.target.value)}
        >
          <option value="">{t("choose")}</option>
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
          <option value="">{t("choose")}</option>
          {upazilas.map((d) => (
            <option key={d.id} value={d.id}>
              {locName(d)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm">
        {t("contactNumber")}
        <input className={field} required placeholder="01XXXXXXXXX" value={contact} onChange={(e) => setContact(e.target.value)} />
      </label>
      <label className="text-sm sm:col-span-2">
        {t("neededWhen")}
        <input className={field} type="datetime-local" required value={neededAt} onChange={(e) => setNeededAt(e.target.value)} />
      </label>
      <label className="text-sm sm:col-span-2">
        {t("note")}
        <input className={field} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
        {t("urgentCheck")}
      </label>

      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

      <button
        disabled={saving}
        className="rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:col-span-2"
      >
        {saving ? t("wait") : t("submitReq")}
      </button>
    </form>
  );
}