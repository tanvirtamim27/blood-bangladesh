"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, getRole, getToken, groupLabel } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { formatTime } from "@/components/RequestFeed";

type Stats = {
  users: number;
  donors: number;
  verifiedDonors: number;
  openRequests: number;
  fulfilledRequests: number;
  totalRequests: number;
  byGroup: { group: string; count: number }[];
};
type AUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: string;
  enabled: boolean;
  hasProfile: boolean;
  verified: boolean;
  createdAt: string;
};
type AReq = {
  id: string;
  patientName: string;
  bloodGroup: string;
  hospitalName: string;
  districtName: string | null;
  status: string;
  urgent: boolean;
  requesterName: string;
  requesterEmail: string | null;
  neededAt: string;
  createdAt: string;
};

const text = {
  en: {
    title: "🛡️ Admin Panel",
    tabStats: "Overview",
    tabUsers: "Users",
    tabReqs: "Requests",
    blog: "📝 Manage blog",
    noAccess: "You do not have access to this page. Please log in with an admin account.",
    loading: "Loading...",
    error: "Something went wrong. Please check that the server is running.",
    users: "Users",
    donors: "Donors",
    verified: "Verified donors",
    open: "Open requests",
    fulfilled: "Fulfilled requests",
    total: "Total requests",
    byGroup: "Donors by blood group",
    search: "Search name, email or phone",
    go: "Search",
    ban: "Ban",
    unban: "Unban",
    banned: "Banned",
    verify: "Verify donor",
    unverify: "Remove verification",
    admin: "Admin",
    you: "You",
    makeAdmin: "Make admin",
    removeAdmin: "Remove admin",
    confirmMake: "Give this user full admin access?",
    confirmRemove: "Remove admin access from this user?",
    lastAdmin: "You cannot remove the last admin.",
    selfAdmin: "You cannot remove your own admin role.",
    bannedAdmin: "A banned user cannot be made admin. Unban first.",
    banAdminFirst: "Remove the admin role before banning this user.",
    remove: "Remove request",
    confirmRemoveReq: "Remove this request from the public feed?",
    confirmBan: "Change this account's status?",
    by: "By",
    none: "Nothing found.",
  },
  bn: {
    title: "🛡️ অ্যাডমিন প্যানেল",
    tabStats: "সারসংক্ষেপ",
    tabUsers: "ইউজার",
    tabReqs: "অনুরোধ",
    blog: "📝 ব্লগ ম্যানেজ",
    noAccess: "এই পেজে আপনার প্রবেশাধিকার নেই। অ্যাডমিন অ্যাকাউন্টে লগইন করুন।",
    loading: "লোড হচ্ছে...",
    error: "কিছু ভুল হয়েছে। সার্ভার চালু আছে কিনা দেখুন।",
    users: "ইউজার",
    donors: "রক্তদাতা",
    verified: "ভেরিফাইড দাতা",
    open: "খোলা অনুরোধ",
    fulfilled: "সম্পন্ন অনুরোধ",
    total: "মোট অনুরোধ",
    byGroup: "রক্তের গ্রুপ অনুযায়ী দাতা",
    search: "নাম, ইমেইল বা ফোন দিয়ে খুঁজুন",
    go: "খুঁজুন",
    ban: "ব্যান করুন",
    unban: "আনব্যান",
    banned: "ব্যান করা",
    verify: "দাতা ভেরিফাই করুন",
    unverify: "ভেরিফিকেশন তুলুন",
    admin: "অ্যাডমিন",
    you: "আপনি",
    makeAdmin: "অ্যাডমিন বানান",
    removeAdmin: "অ্যাডমিন সরান",
    confirmMake: "এই ইউজারকে পূর্ণ অ্যাডমিন ক্ষমতা দেবেন?",
    confirmRemove: "এই ইউজারের অ্যাডমিন ক্ষমতা সরাবেন?",
    lastAdmin: "শেষ অ্যাডমিনকে সরানো যাবে না।",
    selfAdmin: "নিজের অ্যাডমিন ক্ষমতা নিজে সরানো যাবে না।",
    bannedAdmin: "ব্যান করা ইউজারকে অ্যাডমিন বানানো যাবে না। আগে আনব্যান করুন।",
    banAdminFirst: "ব্যান করার আগে এই ইউজারের অ্যাডমিন ক্ষমতা সরান।",
    remove: "অনুরোধ সরান",
    confirmRemoveReq: "এই অনুরোধ পাবলিক ফিড থেকে সরাবেন?",
    confirmBan: "এই অ্যাকাউন্টের অবস্থা বদলাবেন?",
    by: "অনুরোধকারী",
    none: "কিছু পাওয়া যায়নি।",
  },
};

const field =
  "rounded-xl border border-gray-300 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900";

function myId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload)).sub ?? null;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const { lang } = useLang();
  const tr = text[lang];

  const [role, setRole] = useState<string | null | undefined>(undefined);
  const [me, setMe] = useState<string | null>(null);
  const [tab, setTab] = useState<"stats" | "users" | "reqs">("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AUser[] | null>(null);
  const [reqs, setReqs] = useState<AReq[] | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setRole(getRole());
    setMe(myId());
  }, [router]);

  const loadUsers = useCallback(async (query: string) => {
    try {
      const p = query.trim() ? `?q=${encodeURIComponent(query.trim())}` : "";
      setUsers(await api<AUser[]>(`/api/v1/admin/users${p}`));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  const loadReqs = useCallback(async () => {
    try {
      setReqs(await api<AReq[]>("/api/v1/admin/requests"));
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    if (role !== "ROLE_ADMIN") return;
    if (tab === "stats") {
      api<Stats>("/api/v1/admin/stats")
        .then((s) => {
          setStats(s);
          setError(false);
        })
        .catch(() => setError(true));
    }
    if (tab === "users") loadUsers("");
    if (tab === "reqs") loadReqs();
  }, [tab, role, loadUsers, loadReqs]);

  async function toggleBan(u: AUser) {
    if (!confirm(tr.confirmBan)) return;
    setMsg("");
    try {
      await api(`/api/v1/admin/users/${u.id}/enabled`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !u.enabled }),
      });
      loadUsers(q);
    } catch (e) {
      if ((e as { status?: number }).status === 400) setMsg(tr.banAdminFirst);
      else setError(true);
    }
  }

  async function toggleAdmin(u: AUser) {
    const makeAdmin = u.role !== "ROLE_ADMIN";
    if (!confirm(makeAdmin ? tr.confirmMake : tr.confirmRemove)) return;
    setMsg("");
    try {
      await api(`/api/v1/admin/users/${u.id}/admin`, {
        method: "PATCH",
        body: JSON.stringify({ admin: makeAdmin }),
      });
      loadUsers(q);
    } catch (e) {
      const s = (e as { status?: number }).status;
      if (s === 409) setMsg(tr.lastAdmin);
      else if (s === 400) setMsg(makeAdmin ? tr.bannedAdmin : tr.selfAdmin);
      else setError(true);
    }
  }

  async function toggleVerify(u: AUser) {
    try {
      await api(`/api/v1/admin/donors/${u.id}/verified`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !u.verified }),
      });
      loadUsers(q);
    } catch {
      setError(true);
    }
  }

  async function removeReq(r: AReq) {
    if (!confirm(tr.confirmRemoveReq)) return;
    try {
      await api(`/api/v1/admin/requests/${r.id}`, { method: "DELETE" });
      loadReqs();
    } catch {
      setError(true);
    }
  }

  if (role === undefined) return <p>{tr.loading}</p>;
  if (role !== "ROLE_ADMIN") return <p className="text-red-600">{tr.noAccess}</p>;

  const tabBtn = (id: "stats" | "users" | "reqs", label: string) => (
    <button
      onClick={() => setTab(id)}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
        tab === id
          ? "bg-red-600 text-white"
          : "border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{tr.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        {tabBtn("stats", tr.tabStats)}
        {tabBtn("users", tr.tabUsers)}
        {tabBtn("reqs", tr.tabReqs)}
        <Link
          href="/admin/blog"
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          {tr.blog}
        </Link>
      </div>

      {error && <p className="text-red-600">{tr.error}</p>}
      {msg && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">{msg}</p>}

      {tab === "stats" &&
        (stats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                [tr.users, stats.users],
                [tr.donors, stats.donors],
                [tr.verified, stats.verifiedDonors],
                [tr.open, stats.openRequests],
                [tr.fulfilled, stats.fulfilledRequests],
                [tr.total, stats.totalRequests],
              ].map(([label, n]) => (
                <div key={label} className="rounded-2xl border border-red-100 p-4 dark:border-red-950">
                  <div className="text-3xl font-bold text-red-600">{n}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
                </div>
              ))}
            </div>
            <div>
              <h2 className="mb-2 font-semibold">{tr.byGroup}</h2>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                {stats.byGroup.map((g) => (
                  <div
                    key={g.group}
                    className="rounded-2xl border border-gray-200 p-3 text-center dark:border-gray-800"
                  >
                    <div className="font-bold text-red-600">{groupLabel(g.group)}</div>
                    <div className="text-lg">{g.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          !error && <p>{tr.loading}</p>
        ))}

      {tab === "users" && (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMsg("");
              loadUsers(q);
            }}
            className="flex gap-2"
          >
            <input
              className={`${field} flex-1`}
              placeholder={tr.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700">
              {tr.go}
            </button>
          </form>
          {!users && !error && <p>{tr.loading}</p>}
          {users?.length === 0 && <p>{tr.none}</p>}
          {users?.map((u) => {
            const isAdmin = u.role === "ROLE_ADMIN";
            const isMe = u.id === me;
            return (
              <div
                key={u.id}
                className={`rounded-2xl border p-4 ${
                  u.enabled
                    ? "border-gray-200 dark:border-gray-800"
                    : "border-gray-300 bg-gray-100 opacity-70 dark:border-gray-700 dark:bg-gray-900"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5 text-sm">
                    <div className="text-base font-semibold">
                      {u.fullName} {u.verified && <span title="Verified">✅</span>}{" "}
                      {isAdmin && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                          {tr.admin}
                        </span>
                      )}{" "}
                      {isMe && (
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">
                          {tr.you}
                        </span>
                      )}{" "}
                      {!u.enabled && (
                        <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-bold text-white">
                          {tr.banned}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {u.email} · {u.phone ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500">{formatTime(u.createdAt, lang)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!isMe && (u.enabled || isAdmin) && (
                      <button
                        onClick={() => toggleAdmin(u)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                          isAdmin
                            ? "border border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
                            : "border border-blue-400 text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                        }`}
                      >
                        🛡️ {isAdmin ? tr.removeAdmin : tr.makeAdmin}
                      </button>
                    )}
                    {!isAdmin && u.hasProfile && (
                      <button
                        onClick={() => toggleVerify(u)}
                        className="rounded-lg border border-green-300 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950"
                      >
                        {u.verified ? tr.unverify : tr.verify}
                      </button>
                    )}
                    {!isAdmin && (
                      <button
                        onClick={() => toggleBan(u)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
                          u.enabled
                            ? "border border-red-300 text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {u.enabled ? tr.ban : tr.unban}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "reqs" && (
        <div className="space-y-3">
          {!reqs && !error && <p>{tr.loading}</p>}
          {reqs?.length === 0 && <p>{tr.none}</p>}
          {reqs?.map((r) => (
            <div key={r.id} className="rounded-2xl border border-gray-200 p-4 dark:border-gray-800">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600 dark:bg-red-950">
                    {groupLabel(r.bloodGroup)}
                  </div>
                  <div className="space-y-0.5 text-sm">
                    <div className="text-base font-semibold">
                      {r.patientName}{" "}
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs dark:bg-gray-800">
                        {r.status}
                      </span>
                    </div>
                    <div>
                      🏥 {r.hospitalName}
                      {r.districtName && ` · ${r.districtName}`}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {tr.by}: {r.requesterName} ({r.requesterEmail})
                    </div>
                    <div className="text-xs text-gray-500">{formatTime(r.createdAt, lang)}</div>
                  </div>
                </div>
                {r.status !== "REMOVED_BY_ADMIN" && (
                  <button
                    onClick={() => removeReq(r)}
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    🗑️ {tr.remove}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}