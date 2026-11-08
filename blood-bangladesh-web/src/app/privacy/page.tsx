"use client";

import { useLang } from "@/lib/i18n";

const CONTACT = "tanvirtamim0011@gmail.com";

const content = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: November 2026",
    sections: [
      [
        "1. What we collect",
        "We collect your name, email, mobile number, blood group, area (division, district, upazila), last donation date, donation history, and the requests and messages you send. Your password is stored only as a one-way hash. If you use Google login, we receive your name, email and profile picture from Google.",
      ],
      [
        "2. Why we collect it",
        "To connect blood donors with patients, to show search results, to send you notifications about responses and messages, and to prevent misuse of the platform.",
      ],
      [
        "3. Who can see your information",
        "Anyone can see a donor's name, blood group, area, availability, last donation date and donation count. Phone numbers are partly hidden for visitors who are not logged in, and fully visible to logged-in users. If you turn the Interest switch off, your profile is hidden from all searches. When you respond to a request or send a message, your name and phone number are shared with that person. Phone numbers on blood requests follow the same rule.",
      ],
      [
        "4. Sharing",
        "We do not sell your data. A few services process limited data to run the platform, such as Google (for login) and our email provider (to deliver emails).",
      ],
      [
        "5. Cookies and local storage",
        "We store a login token in your browser, a secure refresh cookie that keeps you logged in, and your language and theme choice. We do not use advertising cookies.",
      ],
      [
        "6. Security",
        "Passwords are hashed, admin tools are restricted, and login attempts are rate limited. No system is perfectly secure, so please use a strong, unique password.",
      ],
      [
        "7. Your choices",
        "You can edit your profile, turn the Interest switch off, and delete your donation records at any time. To delete your account and data, contact us at the email below.",
      ],
      [
        "8. Age",
        "Blood Bangladesh is for people aged 18 and over.",
      ],
      [
        "9. Changes",
        "We may update this policy. The date at the top shows the latest version.",
      ],
      ["10. Contact", `Questions or requests: ${CONTACT}`],
    ],
  },
  bn: {
    title: "গোপনীয়তা নীতি",
    updated: "সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬",
    sections: [
      [
        "১. আমরা কী তথ্য নিই",
        "আমরা আপনার নাম, ইমেইল, মোবাইল নম্বর, রক্তের গ্রুপ, এলাকা (বিভাগ, জেলা, উপজেলা), শেষ রক্তদানের তারিখ, রক্তদানের ইতিহাস এবং আপনার পাঠানো অনুরোধ ও বার্তা সংরক্ষণ করি। পাসওয়ার্ড শুধু একমুখী হ্যাশ আকারে থাকে। Google দিয়ে লগইন করলে Google থেকে আপনার নাম, ইমেইল ও প্রোফাইল ছবি পাই।",
      ],
      [
        "২. কেন নিই",
        "রক্তদাতা ও রোগীকে যুক্ত করতে, সার্চ ফলাফল দেখাতে, সাড়া ও বার্তার নোটিফিকেশন পাঠাতে এবং প্ল্যাটফর্মের অপব্যবহার ঠেকাতে।",
      ],
      [
        "৩. কে আপনার তথ্য দেখতে পায়",
        "দাতার নাম, রক্তের গ্রুপ, এলাকা, প্রস্তুত থাকার অবস্থা, শেষ রক্তদানের তারিখ ও দানের সংখ্যা যে কেউ দেখতে পারেন। লগইন ছাড়া দর্শকের কাছে ফোন নম্বর আংশিক লুকানো থাকে, লগইন করা ব্যবহারকারী পূর্ণ নম্বর দেখেন। Interest সুইচ বন্ধ করলে আপনার প্রোফাইল সব সার্চ থেকে লুকানো থাকে। কোনো অনুরোধে সাড়া দিলে বা বার্তা পাঠালে সেই ব্যক্তির কাছে আপনার নাম ও ফোন নম্বর যায়। রক্তের অনুরোধের ফোন নম্বরেও একই নিয়ম।",
      ],
      [
        "৪. তথ্য ভাগাভাগি",
        "আমরা আপনার তথ্য বিক্রি করি না। প্ল্যাটফর্ম চালাতে কয়েকটি সেবা সীমিত তথ্য প্রক্রিয়া করে, যেমন Google (লগইনের জন্য) ও ইমেইল সেবাদাতা (ইমেইল পৌঁছাতে)।",
      ],
      [
        "৫. কুকি ও লোকাল স্টোরেজ",
        "আমরা ব্রাউজারে লগইন টোকেন, লগইন ধরে রাখার জন্য নিরাপদ refresh কুকি এবং আপনার ভাষা ও থিমের পছন্দ রাখি। বিজ্ঞাপনের কুকি ব্যবহার করি না।",
      ],
      [
        "৬. নিরাপত্তা",
        "পাসওয়ার্ড হ্যাশ করা থাকে, অ্যাডমিন সুবিধা সীমিত এবং লগইন চেষ্টায় সীমা আছে। কোনো ব্যবস্থাই শতভাগ নিরাপদ নয়, তাই শক্ত ও আলাদা পাসওয়ার্ড ব্যবহার করুন।",
      ],
      [
        "৭. আপনার পছন্দ",
        "আপনি যেকোনো সময় প্রোফাইল বদলাতে, Interest সুইচ বন্ধ করতে এবং রক্তদানের রেকর্ড মুছতে পারেন। অ্যাকাউন্ট ও তথ্য মুছতে নিচের ইমেইলে যোগাযোগ করুন।",
      ],
      ["৮. বয়স", "ব্লাড বাংলাদেশ ১৮ বছর বা তার বেশি বয়সীদের জন্য।"],
      [
        "৯. পরিবর্তন",
        "আমরা এই নীতি হালনাগাদ করতে পারি। উপরের তারিখ সর্বশেষ সংস্করণ নির্দেশ করে।",
      ],
      ["১০. যোগাযোগ", `প্রশ্ন বা অনুরোধ: ${CONTACT}`],
    ],
  },
};

export default function PrivacyPage() {
  const { lang } = useLang();
  const c = content[lang];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{c.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{c.updated}</p>
      </div>
      {c.sections.map(([h, p]) => (
        <section key={h}>
          <h2 className="text-lg font-semibold text-red-600">{h}</h2>
          <p className="mt-1 leading-relaxed text-gray-700 dark:text-gray-300">{p}</p>
        </section>
      ))}
    </div>
  );
}