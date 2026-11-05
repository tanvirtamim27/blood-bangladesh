"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type GoogleId = {
  initialize: (c: { client_id: string; callback: (r: { credential: string }) => void }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
type GoogleWindow = { google?: { accounts: { id: GoogleId } } };

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const text = {
  en: { or: "or", fail: "Google login failed. Please try again.", off: "Google login is not set up on the server." },
  bn: { or: "অথবা", fail: "Google লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।", off: "সার্ভারে Google লগইন চালু করা হয়নি।" },
};

export default function GoogleButton() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang } = useLang();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!CLIENT_ID) return;
    const tr = text[lang];

    function init() {
      const g = (window as unknown as GoogleWindow).google;
      if (!g || !ref.current) return;
      g.accounts.id.initialize({
        client_id: CLIENT_ID as string,
        callback: async (resp) => {
          setError("");
          try {
            const res = await fetch("/api/v1/auth/google", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: resp.credential }),
            });
            if (res.status === 503) setError(tr.off);
            else if (!res.ok) setError(tr.fail);
            else {
              const data = await res.json();
              saveAuth(data.accessToken, data.fullName);
              router.push("/");
            }
          } catch {
            setError(tr.fail);
          }
        },
      });
      g.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    }

    if ((window as unknown as GoogleWindow).google) {
      init();
      return;
    }
    let script = document.querySelector<HTMLScriptElement>("script[data-gsi]");
    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.setAttribute("data-gsi", "1");
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script?.removeEventListener("load", init);
  }, [lang, router]);

  if (!CLIENT_ID) return null;

  return (
    <div className="space-y-3">
      <div className="text-center text-xs text-gray-500">— {text[lang].or} —</div>
      <div ref={ref} className="flex justify-center" />
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}