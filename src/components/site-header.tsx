"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type SiteLanguage = "zh" | "en" | "es";

const languageLabels: Record<SiteLanguage, string> = {
  zh: "中文",
  en: "English",
  es: "Espanol",
};

const navCopy: Record<
  SiteLanguage,
  { home: string; about: string; desserts: string; order: string; privacy: string; brand: string; location: string }
> = {
  zh: {
    home: "首页",
    about: "关于我们",
    desserts: "甜品价目",
    order: "订购",
    privacy: "隐私政策",
    brand: "Lulu Bakery",
    location: "Chino Hills",
  },
  en: {
    home: "Home",
    about: "About Us",
    desserts: "Dessert Menu",
    order: "Order",
    privacy: "Privacy Policy",
    brand: "Lulu Bakery",
    location: "Chino Hills",
  },
  es: {
    home: "Inicio",
    about: "Sobre Nosotros",
    desserts: "Carta de Postres",
    order: "Pedido",
    privacy: "Privacidad",
    brand: "Lulu Bakery",
    location: "Chino Hills",
  },
};

type Props = {
  language: SiteLanguage;
  onLanguageChange: (language: SiteLanguage) => void;
  /** Compact hero strip vs full brand block */
  variant?: "bar" | "hero";
  title?: string;
  intro?: string;
  children?: React.ReactNode;
};

export default function SiteHeader({
  language,
  onLanguageChange,
  variant = "bar",
  title,
  intro,
  children,
}: Props) {
  const pathname = usePathname();
  const t = navCopy[language];
  const links = [
    { href: "/about", label: t.about },
    { href: "/order", label: t.order },
    { href: "/privacy", label: t.privacy },
  ] as const;

  return (
    <div className="mb-6">
      <header className="site-header sticky top-0 z-40 -mx-6 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-6 py-3 backdrop-blur-md print:static print:border-0 print:bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3 rounded-lg focus-ring">
            <span className="relative h-11 w-11 overflow-hidden rounded-full border border-[var(--color-border)] bg-white/90">
              <Image
                src="/brand/avatar.webp"
                alt=""
                fill
                className="object-cover"
                sizes="44px"
                priority
              />
            </span>
            <span>
              <span className="block text-sm font-semibold text-[var(--color-ink)]">{t.brand}</span>
              <span className="block text-xs text-[var(--color-muted)]">{t.location}</span>
            </span>
            <span className="sr-only">{t.brand} home</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="Primary" className="site-nav">
              <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
                {links.map((link) => {
                  const active =
                    link.href === "/"
                      ? pathname === "/"
                      : pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`site-nav-link focus-ring ${active ? "site-nav-link--active" : ""}`}
                        style={active ? { color: "#ffffff" } : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <label className="sr-only" htmlFor="site-language">
              Select language
            </label>
            <select
              id="site-language"
              aria-label="Select language"
              value={language}
              onChange={(event) => onLanguageChange(event.target.value as SiteLanguage)}
              className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-semibold text-[var(--color-ink)] focus-ring"
            >
              {(["en", "zh", "es"] as SiteLanguage[]).map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabels[lang]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {variant === "hero" && (title || intro || children) ? (
        <section className="mt-4 rounded-2xl bg-linear-to-r from-[#E7E3DE] via-[#E3DED8] to-[#DED8D0] p-6 shadow-sm sm:p-8">
          {title ? <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1> : null}
          {intro ? <p className="mt-3 max-w-3xl text-zinc-700">{intro}</p> : null}
          {children}
        </section>
      ) : null}
    </div>
  );
}
