"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, GROUPS } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type Loc = { id: number; nameEn: string; nameBn: string };
type Profile = {
  bloodGroup: string;
  divisionId: number | null;
  districtId: number | null;
  upazilaId: number | null;
  addressDetail: string | null;
  interested: boolean;
  verifiedByAdmin: boolean;
  lastDonationDate: string | null;
  totalDonations: number;
  eligible: boolean;
};
type Me = {
  fullName: string;
  email: string | null;
  phone: string | null;
  donorProfile: Profile | null;
};

const field =
  "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

export default function ProfilePage() {
  const router = useRouter();
  const { lang, t } = useLang();

  const [me, setMe] = useState<Me | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [bg, setBg] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");
  const [address, setAddress] = useState("");
  const [lastDate, setLastDate] = useState("");

  const [divisions, setDivisions] = useState<Loc[]>([]);
  const [districts, setDistricts] = useState<Loc[]>([]);
  const [upazilas, setUpazilas] = useState<Loc[]>([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const locName = (l: Loc) => (lang === "bn" ? l.nameBn : l.nameEn);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const [m, divs] = await Promise.all([
          api<Me>("/api/v1/users/me"),
          api<Loc[]>("/api/v1/locations/divisions"),
        ]);
        setMe(m);
        setDivisions(divs);
        const p = m.donorProfile;
        if (p) {
          setProfile(p);
          setBg(p.bloodGroup);
          setAddress(p.addressDetail ?? "");
          setLastDate(p.lastDonationDate ?? "");
          if (p.divisionId) {
            setDivisionId(String(p.divisionId));
            setDistricts(await api<Loc[]>(`/api/v1/locations/divisions/${p.divisionId}/districts`));
          }
          if (p.districtId) {
            setDistrictId(String(p.districtId));
            setUpazilas(await api<Loc[]>(`/api/v1/locations/districts/${p.districtId}/upazilas`));
          }
          if (p.upazilaId) setUpazilaId(String(p.upazilaId));
        }
      } catch {
        if (!getToken()) router.replace("/login");
        else setLoadError(true);
      } finally {
        setLoading(false);
      }
    })();
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

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (lastDate && lastDate > today) {
      setError(t("futureDate"));
      return;
    }
    setSaving(true);
    try {
      const body = {
        bloodGroup: bg,
        divisionId: divisionId ? Number(divisionId) : null,
        districtId: districtId ? Number(districtId) : null,
        upazilaId: upazilaId ? Number(upazilaId) : null,
        addressDetail: address.trim() || null,
        lastDonationDate: lastDate || null,
      };
      const p = await api<Profile>("/api/v1/users/me/donor-profile", {
        method: "PUT",
        body: JSON.stringify(body),
      });
      setProfile(p);
      setMessage(t("saved"));
    } catch {
      setError(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleInterest() {
    if (!profile) return;
    setMessage("");
    setError("");
    try {
      const p = await api<Profile>("/api/v1/users/me/interest", {
        method: "PATCH",
        body: JSON.stringify({ interested: !profile.interested }),
      });
      setProfile(p);
    } catch {
      setError(t("saveError"));
    }
  }

  if (loading) return <p>{t("profLoading")}</p>;
  if (loadError) return <p className="text-red-600">{t("profLoadError")}</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{t("profTitle")}</h1>

      <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
        <div className="text-lg font-semibold">{me?.fullName}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{me?.email}</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">{me?.phone}</div>
      </div>

      {!profile && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {t("profCreateHint")}
        </p>
      )}

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 p-4 dark:border-red-950">
        <div>
          <div className="font-semibold">{t("interestLabel")}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {!profile
              ? t("interestNeedProfile")
              : profile.interested
                ? t("interestOn")
                : t("interestOff")}
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={profile?.interested ?? false}
          disabled={!profile}
          onClick={toggleInterest}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40 ${
            profile?.interested ? "bg-red-600" : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-all ${
              profile?.interested ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {profile && (
        <div className="grid gap-3 rounded-2xl border border-gray-200 p-4 text-sm sm:grid-cols-3 dark:border-gray-800">
          <div>
            <div className="text-gray-500">{t("totalDonations")}</div>
            <div className="text-lg font-semibold">{profile.totalDonations}</div>
          </div>
          <div>
            <div className="text-gray-500">{t("adminVerified")}</div>
            <div className="font-semibold">
              {profile.verifiedByAdmin ? "✅" : t("notVerified")}
            </div>
          </div>
          <div className="sm:col-span-3">
            {profile.eligible ? (
              <span className="text-green-700 dark:text-green-400">✅ {t("eligibleYes")}</span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400">⏳ {t("eligibleNo")}</span>
            )}
          </div>
        </div>
      )}

      <form
        onSubmit={save}
        className="grid gap-3 rounded-2xl border border-red-100 p-4 sm:grid-cols-2 dark:border-red-950"
      >
        <label className="text-sm sm:col-span-2">
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
          {t("lastDonationOpt")}
          <input
            className={field}
            type="date"
            max={today}
            value={lastDate}
            onChange={(e) => setLastDate(e.target.value)}
          />
        </label>
        <label className="text-sm sm:col-span-2">
          {t("addressDetail")}
          <input className={field} value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>

        {message && <p className="text-sm text-green-700 sm:col-span-2 dark:text-green-400">{message}</p>}
        {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}

        <button
          disabled={saving}
          className="rounded-xl bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60 sm:col-span-2"
        >
          {saving ? t("saving") : t("save")}
        </button>
      </form>
    </div>
  );
}