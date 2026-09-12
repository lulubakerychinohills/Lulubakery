"use client";

import Link from "next/link";
import { useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import SiteFooter from "@/components/site-footer";
import SiteHeader, { type SiteLanguage } from "@/components/site-header";

type Language = SiteLanguage;

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
    wechatLabel: "微信",
    wechatBody: "Lulucake818",
    cta: "返回首页下单",
    privacyCta: "查看隐私政策",
    menuCta: "甜品价目表",
    homeCrumb: "首页",
    aboutCrumb: "关于我们",
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
    wechatLabel: "WeChat",
    wechatBody: "Lulucake818",
    cta: "Back to Home & Order",
    privacyCta: "View Privacy Policy",
    menuCta: "Dessert Menu & Prices",
    homeCrumb: "Home",
    aboutCrumb: "About",
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
    wechatLabel: "WeChat",
    wechatBody: "Lulucake818",
    cta: "Volver al Inicio",
    privacyCta: "Ver Politica de Privacidad",
    menuCta: "Carta de Postres",
    homeCrumb: "Inicio",
    aboutCrumb: "Sobre Nosotros",
  },
} as const;

export default function AboutPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] py-6 text-zinc-800 outline-none sm:py-10"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SiteHeader language={language} onLanguageChange={setLanguage} />
        <Breadcrumbs items={[{ href: "/", label: t.homeCrumb }, { label: t.aboutCrumb }]} />
        <section className="rounded-2xl bg-linear-to-r from-[#E7E3DE] via-[#E3DED8] to-[#DED8D0] p-8 shadow-sm">
          <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm font-semibold text-[#5E524B]">{t.subtitle}</p>
          <p className="mt-4 max-w-3xl text-zinc-700">{t.intro}</p>
        </section>

        <section className="mt-8 grid gap-4">
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.licensedTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.licensedBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.ingredientsTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.ingredientsBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.occasionsTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.occasionsBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.pickupTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.pickupBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
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
            <p className="mt-1 text-sm text-zinc-700">
              <span className="font-semibold">{t.wechatLabel}:</span> {t.wechatBody}
            </p>
          </article>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="ui-button inline-flex rounded-full bg-[#5C4B43] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38] focus-ring"
          >
            {t.cta}
          </Link>
          <Link
            href="/privacy"
            className="ui-button inline-flex rounded-full border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] focus-ring"
          >
            {t.privacyCta}
          </Link>
          <Link
            href="/sweet"
            className="ui-button inline-flex rounded-full border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] focus-ring"
          >
            {t.menuCta}
          </Link>
        </div>
      </div>
      <SiteFooter language={language} />
    </main>
  );
}
