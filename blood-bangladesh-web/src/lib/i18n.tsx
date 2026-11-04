"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Lang = "bn" | "en";

const en = {
  brand: "Blood Bangladesh",
  navFind: "Find Donors",
  navLogin: "Login",
  navRegister: "Register",
  navLogout: "Logout",
  theme: "Toggle theme",
  footer: "© Blood Bangladesh",

  heroTitle: "One drop of blood, one life 🩸",
  heroText:
    "Find blood donors in your area, or join as a donor and help save someone's life.",
  heroFind: "Find Donors",
  heroJoin: "Become a Donor",
  byGroup: "Search by blood group",
  f1t: "Easy search",
  f1d: "Find donors instantly by blood group and area.",
  f2t: "90-day rule",
  f2d: 'Donors who gave blood recently are automatically shown as "Unavailable".',
  f3t: "Privacy",
  f3d: "Phone numbers are partly hidden unless you are logged in.",

  searchTitle: "🔍 Find Blood Donors",
  group: "Blood group",
  division: "Division",
  district: "District",
  upazila: "Upazila",
  all: "All",
  searchBtn: "Search",
  searching: "Searching...",
  found: "{n} donor(s) found",
  none: "No donors found.",
  noArea: "Area not provided",
  lastDonation: "Last donation",
  never: "Never yet",
  timesTotal: "{n} time(s) in total",
  ready: "Available",
  unavailable: "Unavailable",
  verified: "Verified",
  loginHint: "Log in to see full phone numbers.",
  prev: "← Previous",
  next: "Next →",
  searchError: "Search failed. Please check that the server is running.",

  loginTitle: "Login",
  email: "Email",
  password: "Password",
  loginBtn: "Login",
  wait: "Please wait...",
  badLogin: "Incorrect email or password.",
  badData: "Invalid details, please try again.",
  noServer: "Cannot connect to the server.",
  noAccount: "Don't have an account?",
  registerLink: "Register",

  regTitle: "Create Account",
  fullName: "Full name",
  phone: "Mobile number",
  passwordHint: "Password (at least 8 characters)",
  registerBtn: "Register",
  exists: "This email or phone number is already registered.",
  regBad:
    "Invalid details. Phone must be 11 digits starting with 01, password at least 8 characters.",
  haveAccount: "Already have an account?",
  loginLink: "Login",
};

type Key = keyof typeof en;

const bn: Record<Key, string> = {
  brand: "ব্লাড বাংলাদেশ",
  navFind: "রক্তদাতা খুঁজুন",
  navLogin: "লগইন",
  navRegister: "রেজিস্টার",
  navLogout: "লগআউট",
  theme: "থিম বদলান",
  footer: "© ব্লাড বাংলাদেশ",

  heroTitle: "একটি ফোঁটা রক্ত, একটি জীবন 🩸",
  heroText:
    "আপনার এলাকার রক্তদাতা খুঁজুন, অথবা নিজে রক্তদাতা হিসেবে যুক্ত হয়ে কারো জীবন বাঁচাতে সাহায্য করুন।",
  heroFind: "রক্তদাতা খুঁজুন",
  heroJoin: "রক্তদাতা হোন",
  byGroup: "রক্তের গ্রুপ অনুযায়ী খুঁজুন",
  f1t: "সহজ সার্চ",
  f1d: "রক্তের গ্রুপ ও এলাকা দিয়ে মুহূর্তে দাতা খুঁজুন।",
  f2t: "৯০ দিনের নিয়ম",
  f2d: 'সম্প্রতি রক্ত দেওয়া দাতা স্বয়ংক্রিয়ভাবে "অনুপলব্ধ" দেখায়।',
  f3t: "গোপনীয়তা",
  f3d: "লগইন ছাড়া ফোন নম্বর আংশিক লুকানো থাকে।",

  searchTitle: "🔍 রক্তদাতা খুঁজুন",
  group: "রক্তের গ্রুপ",
  division: "বিভাগ",
  district: "জেলা",
  upazila: "উপজেলা",
  all: "সব",
  searchBtn: "খুঁজুন",
  searching: "খোঁজা হচ্ছে...",
  found: "মোট {n} জন পাওয়া গেছে",
  none: "কোনো রক্তদাতা পাওয়া যায়নি।",
  noArea: "এলাকা দেওয়া নেই",
  lastDonation: "শেষ রক্তদান",
  never: "এখনো দেননি",
  timesTotal: "মোট {n} বার",
  ready: "প্রস্তুত",
  unavailable: "অনুপলব্ধ",
  verified: "ভেরিফাইড",
  loginHint: "পূর্ণ ফোন নম্বর দেখতে লগইন করুন।",
  prev: "← আগের",
  next: "পরের →",
  searchError: "সার্চ করা যায়নি। সার্ভার চালু আছে কিনা দেখুন।",

  loginTitle: "লগইন",
  email: "ইমেইল",
  password: "পাসওয়ার্ড",
  loginBtn: "লগইন",
  wait: "অপেক্ষা করুন...",
  badLogin: "ইমেইল বা পাসওয়ার্ড ভুল।",
  badData: "তথ্য সঠিক নয়, আবার চেষ্টা করুন।",
  noServer: "সার্ভারে সংযোগ করা যাচ্ছে না।",
  noAccount: "অ্যাকাউন্ট নেই?",
  registerLink: "রেজিস্টার করুন",

  regTitle: "নতুন অ্যাকাউন্ট",
  fullName: "পূর্ণ নাম",
  phone: "মোবাইল নম্বর",
  passwordHint: "পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)",
  registerBtn: "রেজিস্টার",
  exists: "এই ইমেইল বা ফোন নম্বর আগেই নিবন্ধিত।",
  regBad:
    "তথ্য সঠিক নয়। ফোন নম্বর 01 দিয়ে শুরু ১১ অঙ্কের হতে হবে, পাসওয়ার্ড কমপক্ষে ৮ অক্ষর।",
  haveAccount: "আগেই অ্যাকাউন্ট আছে?",
  loginLink: "লগইন করুন",
};

const dict = { en, bn };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: Key, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("bn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bb_lang");
      if (saved === "en" || saved === "bn") setLangState(saved);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try {
      localStorage.setItem("bb_lang", l);
    } catch {}
  }

  function t(key: Key, vars?: Record<string, string | number>) {
    let s = dict[lang][key];
    if (vars) {
      for (const k of Object.keys(vars)) s = s.replace(`{${k}}`, String(vars[k]));
    }
    return s;
  }

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}