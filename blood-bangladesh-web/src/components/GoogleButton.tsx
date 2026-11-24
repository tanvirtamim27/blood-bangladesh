"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveAuth } from "@/lib/api";
import { useLang } from "@/lib/i18n";

type GoogleId = {
  initialize: (c: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
type GoogleWindow = { google?: { accounts: { id: GoogleId } } };

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const text = {
  en: {
    fail: "Sign in failed. Please try again.",
    wake: "The server was waking up. Please wait a few seconds and try again.",
    off: "Google sign in is not set up on the server.",
    busy: "Signing in, please wait...",
    inapp: "If the page stays blank, open this site in Chrome and try again.",
  },
  bn: {
    fail: "সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    wake: "সার্ভার জেগে উঠছিল। কয়েক সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।",
    off: "সার্ভারে Google সাইন ইন চালু করা হয়নি।",
    busy: "সাইন ইন হচ্ছে, একটু অপেক্ষা করুন...",
    inapp: "পেজ সাদা থাকলে সাইটটি Chrome-এ খুলে আবার চেষ্টা করুন।",
  },
};

async function postToken(idToken: string): Promise<Response> {
  const call = () =>
    fetch("/api/v1/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
  let res = await call();
  for (let i = 0; i < 3 && (res.status === 502 || res.status === 504); i++) {
    await new Promise((r) => setTimeout(r, 8000));
    res = await call();
  }
  return res;
}

export default function GoogleButton() {
  const holder = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { lang } = useLang();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    const tr = text[lang];

    async function finish(idToken: string) {
      setError("");
      setBusy(true);
      try {
        const res = await postToken(idToken);
        if (res.status === 503) return setError(tr.off);
        if (res.status === 502 || res.status === 504) return setError(tr.wake);
        if (!res.ok) return setError(tr.fail);
        const data = await res.json();
        saveAuth(data.accessToken, data.fullName);
        let needPhone = false;
        try {
          const me = await fetch("/api/v1/users/me", {
            headers: { Authorization: `Bearer ${data.accessToken}` },
          });
          if (me.ok) needPhone = !(await me.json()).phone;
        } catch {}
        router.push(needPhone ? "/profile?setup=1" : "/");
      } catch {
        setError(tr.fail);
      } finally {
        setBusy(false);
      }
    }

    function init() {
      const g = (window as unknown as GoogleWindow).google;
      if (!g || !ref.current) return;
      g.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (resp: { credential: string }) => finish(resp.credential),
        use_fedcm_for_prompt: true,
      });
      const w = Math.max(200, Math.min(320, Math.floor(holder.current?.clientWidth ?? 280)));
      g.accounts.id.renderButton(ref.current, {
        theme: "outline",
        size: "large",
        width: w,
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
    <div ref={holder} className="w-full space-y-3">
      <div ref={ref} className="flex justify-center overflow-hidden" />
      {busy && <p className="text-center text-sm text-gray-500">{text[lang].busy}</p>}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
      <p className="text-center text-xs text-gray-400">{text[lang].inapp}</p>
    </div>
  );
}