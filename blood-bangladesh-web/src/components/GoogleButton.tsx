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
  en: {
    fail: "Sign in failed. Please try again.",
    wake: "The server was waking up. Please wait a few seconds and try again.",
    off: "Google sign in is not set up on the server.",
  },
  bn: {
    fail: "সাইন ইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    wake: "সার্ভার জেগে উঠছিল। কয়েক সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।",
    off: "সার্ভারে Google সাইন ইন চালু করা হয়নি।",
  },
};

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

    async function post(idToken: string): Promise<Response> {
      let res = await fetch("/api/v1/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      for (let i = 0; i < 3 && (res.status === 502 || res.status === 503 || res.status === 504); i++) {
        await new Promise((r) => setTimeout(r, 8000));
        res = await fetch("/api/v1/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
      }
      return res;
    }

    function init() {
      const g = (window as unknown as GoogleWindow).google;
      if (!g || !ref.current) return;
      g.accounts.id.initialize({
        client_id: CLIENT_ID as string,
        callback: async (resp) => {
          setError("");
          setBusy(true);
          try {
            const res = await post(resp.credential);
            if (res.status === 503) {
              setError(tr.off);
              return;
            }
            if (res.status === 502 || res.status === 504) {
              setError(tr.wake);
              return;
            }
            if (!res.ok) {
              setError(tr.fail);
              return;
            }
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
        },
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
      {busy && (
        <p className="text-center text-sm text-gray-500">
          {lang === "bn" ? "সাইন ইন হচ্ছে, একটু অপেক্ষা করুন..." : "Signing in, please wait..."}
        </p>
      )}
      {error && <p className="text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
