"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type Language = "zh" | "en" | "es";

const languageLabels: Record<Language, string> = {
  zh: "中文",
  en: "English",
  es: "Espanol",
};

const copy = {
  zh: {
    title: "关于 Lulu Bakery",
    subtitle: "私人订制烘焙工作室",
    intro:
      "Lulu Bakery 是位于 Chino Hills 的持证私人烘焙蛋糕店。我们专注于定制蛋糕与甜点，用手作温度为每一个重要时刻留下美好记忆。",
    licensedTitle: "持证经营",
    licensedBody:
      "我们是合规持证经营的私人烘焙工作室，严格重视食品安全、制作流程与品质标准，让每一次下单都更安心。",
    ingredientsTitle: "精选原料",
    ingredientsBody:
      "奶油使用动物奶油，水果坚持当日新鲜采购与处理。整体甜度偏温和，口感清爽不腻，适合大多数家庭成员。",
    occasionsTitle: "适用场景",
    occasionsBody:
      "适合生日、婚礼、节日庆祝、毕业、乔迁与祝福礼赠等场景。我们支持主题配色、文字祝福与风格细节沟通。",
    pickupTitle: "取货说明",
    pickupBody: "目前仅支持上门取货，暂不提供配送服务。下单后我们会确认取货日期与具体时间安排。",
    locationContactTitle: "地址与联系方式",
    locationLabel: "地址",
    locationBody: "Chino Hills",
    contactLabel: "邮箱",
    contactBody: "lulubakerychinohills@gmail.com",
    cta: "返回首页下单",
    privacyCta: "查看隐私政策",
    menuCta: "甜品价目表",
  },
  en: {
    title: "About Lulu Bakery",
    subtitle: "Private Custom Cake Studio",
    intro:
      "Lulu Bakery is a licensed private bakery based in Chino Hills. We focus on custom cakes and desserts, crafted by hand for your meaningful moments.",
    licensedTitle: "Licensed & Compliant",
    licensedBody:
      "We operate as a licensed private bakery and follow clear standards for food safety, preparation, and quality in every order.",
    ingredientsTitle: "Quality Ingredients",
    ingredientsBody:
      "We use real dairy cream and fresh fruit prepared daily. Our flavor profile is gently sweet, balanced, and clean.",
    occasionsTitle: "Perfect for Celebrations",
    occasionsBody:
      "Our cakes are designed for birthdays, weddings, holidays, graduations, congratulations, and other special occasions.",
    pickupTitle: "Pickup Policy",
    pickupBody: "At this time, we support pickup only. Delivery is not available yet. We will confirm your pickup date and time after ordering.",
    locationContactTitle: "Location & Contact",
    locationLabel: "Location",
    locationBody: "Chino Hills",
    contactLabel: "Email",
    contactBody: "lulubakerychinohills@gmail.com",
    cta: "Back to Home & Order",
    privacyCta: "View Privacy Policy",
    menuCta: "Dessert Menu & Prices",
  },
  es: {
    title: "Sobre Lulu Bakery",
    subtitle: "Estudio Privado de Pasteles Personalizados",
    intro:
      "Lulu Bakery es una pasteleria privada con licencia en Chino Hills. Nos especializamos en pasteles y postres personalizados, elaborados a mano para tus momentos especiales.",
    licensedTitle: "Con Licencia",
    licensedBody:
      "Trabajamos como pasteleria privada con licencia y mantenemos estandares claros de seguridad alimentaria, preparacion y calidad.",
    ingredientsTitle: "Ingredientes de Calidad",
    ingredientsBody:
      "Usamos crema lactea real y fruta fresca del dia. El dulzor es suave, equilibrado y agradable.",
    occasionsTitle: "Para Cada Celebracion",
    occasionsBody:
      "Ideal para cumpleanos, bodas, festividades, graduaciones, felicitaciones y otros eventos importantes.",
    pickupTitle: "Politica de Recogida",
    pickupBody: "Por ahora solo ofrecemos recogida. No hay servicio de entrega por el momento. Confirmamos fecha y hora despues del pedido.",
    locationContactTitle: "Ubicacion y Contacto",
    locationLabel: "Ubicacion",
    locationBody: "Chino Hills",
    contactLabel: "Correo",
    contactBody: "lulubakerychinohills@gmail.com",
    cta: "Volver al Inicio",
    privacyCta: "Ver Politica de Privacidad",
    menuCta: "Carta de Postres",
  },
} as const;

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];

  return (
    <main className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] py-10 text-zinc-800">
      <div className="mx-auto max-w-4xl px-6">
        <section className="rounded-2xl bg-linear-to-r from-[#E7E3DE] via-[#E3DED8] to-[#DED8D0] p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#D8D2C9] bg-white/90">
                <Image src="/brand/avatar.png" alt="Lulu Bakery avatar" fill className="object-cover" sizes="48px" priority />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#4C403A]">Lulu Bakery</p>
                <p className="text-xs text-[#6A5D56]">Chino Hills</p>
              </div>
            </div>
            <select
              aria-label="Select language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
              className="rounded-full border border-[#D8D2C9] bg-white px-4 py-1.5 text-sm font-semibold text-[#4C403A] outline-none transition focus:border-[#8B776A]"
            >
              {(["en", "zh", "es"] as Language[]).map((lang) => (
                <option key={lang} value={lang}>
                  {languageLabels[lang]}
                </option>
              ))}
            </select>
          </div>

          <h1 className="mt-4 text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm font-semibold text-[#5E524B]">{t.subtitle}</p>
          <p className="mt-4 max-w-3xl text-zinc-700">{t.intro}</p>
        </section>

        <section className="mt-8 grid gap-4">
          <article className="rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.licensedTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.licensedBody}</p>
          </article>
          <article className="rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.ingredientsTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.ingredientsBody}</p>
          </article>
          <article className="rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.occasionsTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.occasionsBody}</p>
          </article>
          <article className="rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.pickupTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.pickupBody}</p>
          </article>
          <article className="rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.locationContactTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">
              <span className="font-semibold">{t.locationLabel}:</span> {t.locationBody}
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              <span className="font-semibold">{t.contactLabel}:</span>{" "}
              <a href={`mailto:${t.contactBody}`} className="text-[#5C4B43] underline">
                {t.contactBody}
              </a>
            </p>
          </article>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#5C4B43] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38]"
          >
            {t.cta}
          </Link>
          <Link
            href="/privacy"
            className="inline-flex rounded-full border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]"
          >
            {t.privacyCta}
          </Link>
          <Link
            href="/sweet"
            className="inline-flex rounded-full border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]"
          >
            {t.menuCta}
          </Link>
        </div>
      </div>
    </main>
  );
}
