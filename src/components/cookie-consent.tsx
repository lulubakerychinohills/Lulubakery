"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_STORAGE_KEY = "lulu-cookie-consent";
const CONSENT_COOKIE_NAME = "lulu_cookie_consent";
const CONSENT_MAX_AGE_DAYS = 365;

type ConsentLanguage = "zh" | "en" | "es";

const copy: Record<
  ConsentLanguage,
  { title: string; body: string; privacy: string; accept: string }
> = {
  zh: {
    title: "Cookie 与隐私提示",
    body: "我们使用 Cookie 及类似技术，用于维持必要功能、改善体验，并在你下单时处理订单相关信息。继续使用本网站即表示你同意我们按隐私政策使用这些信息。",
    privacy: "隐私政策",
    accept: "我同意",
  },
  en: {
    title: "Cookies & Privacy",
    body: "We use cookies and similar technologies for essential site features, to improve your experience, and to process order details when you place an order. By continuing, you agree to our use of this information as described in the Privacy Policy.",
    privacy: "Privacy Policy",
    accept: "Accept",
  },
  es: {
    title: "Cookies y Privacidad",
    body: "Usamos cookies y tecnologias similares para funciones esenciales, mejorar tu experiencia y procesar los datos del pedido cuando ordenas. Al continuar, aceptas el uso de esta informacion segun la Politica de Privacidad.",
    privacy: "Politica de Privacidad",
    accept: "Aceptar",
  },
};

function detectLanguage(): ConsentLanguage {
  if (typeof navigator === "undefined") return "en";
  const lang = (navigator.language || "en").toLowerCase();
  if (lang.startsWith("zh")) return "zh";
  if (lang.startsWith("es")) return "es";
  return "en";
}

function writeConsentCookie() {
  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE_NAME}=1; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [language, setLanguage] = useState<ConsentLanguage>("en");

  useEffect(() => {
    setLanguage(detectLanguage());
    try {
      const stored = window.localStorage.getItem(CONSENT_STORAGE_KEY);
      if (stored === "1") {
        writeConsentCookie();
        return;
      }
    } catch {
      // ignore storage errors
    }
    setVisible(true);
  }, []);

  const onAccept = () => {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    writeConsentCookie();
    setVisible(false);
  };

  if (!visible) return null;

  const t = copy[language];

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-[#D8D2C9] bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#4C403A]">{t.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">
            {t.body}{" "}
            <Link href="/privacy" className="font-semibold text-[#5C4B43] underline underline-offset-2 hover:text-[#4D3F38]">
              {t.privacy}
            </Link>
          </p>
        </div>
        <button
          type="button"
          onClick={onAccept}
          className="shrink-0 rounded-lg bg-[#5C4B43] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4D3F38]"
        >
          {t.accept}
        </button>
      </div>
    </div>
  );
}
