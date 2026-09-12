import Link from "next/link";

type Props = {
  language?: "zh" | "en" | "es";
};

const copy = {
  zh: {
    privacy: "隐私政策",
    about: "关于我们",
    order: "在线下单",
    location: "Chino Hills, CA",
    tagline: "定制蛋糕与甜点 · 仅限取货",
  },
  en: {
    privacy: "Privacy Policy",
    about: "About Us",
    order: "Order Online",
    location: "Chino Hills, CA",
    tagline: "Custom cakes & desserts · Pickup only",
  },
  es: {
    privacy: "Politica de Privacidad",
    about: "Sobre Nosotros",
    order: "Pedir en linea",
    location: "Chino Hills, CA",
    tagline: "Pasteles personalizados · Solo recogida",
  },
} as const;

export default function SiteFooter({ language = "en" }: Props) {
  const t = copy[language];
  const year = new Date().getFullYear();

  return (
    <footer
      className="mt-auto border-t border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface-muted)_70%,white)] print:border-0 print:bg-white"
      data-print-hide={undefined}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-ink)]">Lulu Bakery</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{t.location}</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">{t.tagline}</p>
          <p className="mt-3 text-xs text-[var(--color-muted)]">© {year} Lulu Bakery</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/about" className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand-soft)] underline-offset-2 focus-ring rounded-sm">
            {t.about}
          </Link>
          <Link href="/order" className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand-soft)] underline-offset-2 focus-ring rounded-sm">
            {t.order}
          </Link>
          <Link href="/privacy" className="font-semibold text-[var(--color-brand)] underline decoration-[var(--color-brand-soft)] underline-offset-2 focus-ring rounded-sm">
            {t.privacy}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
