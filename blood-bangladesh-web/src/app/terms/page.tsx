"use client";

import { useLang } from "@/lib/i18n";

const CONTACT = "support@example.com";

const content = {
  en: {
    title: "Terms of Use",
    updated: "Last updated: November 2026",
    sections: [
      [
        "1. About the service",
        "Blood Bangladesh helps people find voluntary blood donors and post blood requests. We only connect people. We do not collect, test or supply blood.",
      ],
      [
        "2. Who can use it",
        "You must be at least 18 years old and give accurate information. You are responsible for your account and password.",
      ],
      [
        "3. Voluntary donation, no payment",
        "Blood donation through this platform must be voluntary. Do not ask for or offer money for blood. Accounts doing so will be banned.",
      ],
      [
        "4. Medical disclaimer",
        "Donor details such as blood group and last donation date are provided by users and are not medically verified. Always confirm the blood group and eligibility at a hospital or licensed blood center. Content on this site is general information, not medical advice.",
      ],
      [
        "5. What is not allowed",
        "Fake or misleading blood requests, spam, harassment, using donors' contact details for anything other than blood donation, collecting data in bulk, and trying to break or misuse the platform.",
      ],
      [
        "6. Moderation",
        "Administrators may remove requests, hide content or ban accounts that break these terms.",
      ],
      [
        "7. Limitation of responsibility",
        "The service is provided as is. We cannot guarantee that a donor will be available or that a request will be fulfilled, and we are not responsible for the actions of users.",
      ],
      [
        "8. Changes",
        "We may update these terms. Continuing to use the service means you accept the latest version.",
      ],
      ["9. Contact", `Questions: ${CONTACT}`],
    ],
  },
  bn: {
    title: "ব্যবহারের শর্তাবলী",
    updated: "সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬",
    sections: [
      [
        "১. সেবা সম্পর্কে",
        "ব্লাড বাংলাদেশ স্বেচ্ছায় রক্তদাতা খুঁজে পেতে এবং রক্তের অনুরোধ জানাতে সাহায্য করে। আমরা শুধু মানুষকে যুক্ত করি। আমরা রক্ত সংগ্রহ, পরীক্ষা বা সরবরাহ করি না।",
      ],
      [
        "২. কারা ব্যবহার করতে পারেন",
        "আপনার বয়স কমপক্ষে ১৮ বছর হতে হবে এবং সঠিক তথ্য দিতে হবে। অ্যাকাউন্ট ও পাসওয়ার্ডের দায়িত্ব আপনার।",
      ],
      [
        "৩. স্বেচ্ছায় দান, অর্থ নয়",
        "এই প্ল্যাটফর্মের মাধ্যমে রক্তদান অবশ্যই স্বেচ্ছায় হতে হবে। রক্তের বিনিময়ে টাকা চাওয়া বা দেওয়া যাবে না। এমন অ্যাকাউন্ট ব্যান করা হবে।",
      ],
      [
        "৪. চিকিৎসা-সংক্রান্ত সতর্কতা",
        "রক্তের গ্রুপ ও শেষ রক্তদানের তারিখের মতো দাতার তথ্য ব্যবহারকারীরা নিজে দেন, এগুলো চিকিৎসকভাবে যাচাই করা নয়। রক্তের গ্রুপ ও যোগ্যতা সবসময় হাসপাতাল বা লাইসেন্সপ্রাপ্ত ব্লাড সেন্টারে নিশ্চিত করুন। এই সাইটের লেখা সাধারণ তথ্য, চিকিৎসা পরামর্শ নয়।",
      ],
      [
        "৫. যা নিষিদ্ধ",
        "ভুয়া বা বিভ্রান্তিকর রক্তের অনুরোধ, স্প্যাম, হয়রানি, রক্তদান ছাড়া অন্য কাজে দাতার যোগাযোগের তথ্য ব্যবহার, একসাথে অনেক তথ্য সংগ্রহ এবং প্ল্যাটফর্ম ভাঙার বা অপব্যবহারের চেষ্টা।",
      ],
      [
        "৬. মডারেশন",
        "শর্ত ভাঙলে অ্যাডমিন অনুরোধ সরাতে, কনটেন্ট লুকাতে বা অ্যাকাউন্ট ব্যান করতে পারেন।",
      ],
      [
        "৭. দায়ের সীমা",
        "সেবা যেমন আছে তেমন দেওয়া হয়। দাতা পাওয়া যাবে বা অনুরোধ পূরণ হবে, এমন নিশ্চয়তা আমরা দিতে পারি না, এবং ব্যবহারকারীদের কাজের দায় আমাদের নয়।",
      ],
      [
        "৮. পরিবর্তন",
        "আমরা এই শর্ত হালনাগাদ করতে পারি। সেবা ব্যবহার চালিয়ে গেলে সর্বশেষ সংস্করণ মেনে নিচ্ছেন বলে ধরা হবে।",
      ],
      ["৯. যোগাযোগ", `প্রশ্ন: ${CONTACT}`],
    ],
  },
};

export default function TermsPage() {
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