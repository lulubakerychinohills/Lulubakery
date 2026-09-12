"use client";

import Link from "next/link";
import { useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import SiteFooter from "@/components/site-footer";
import SiteHeader, { type SiteLanguage } from "@/components/site-header";

type Language = SiteLanguage;

const copy = {
  zh: {
    title: "隐私政策",
    effectiveDate: "生效日期：2026-04-02",
    intro:
      "Lulu Bakery 重视你的隐私。本页面说明我们收集哪些信息、如何使用这些信息，以及你可以如何联系我们删除或修改信息。",
    collectTitle: "我们收集的信息",
    collectBody:
      "当你下单时，我们可能收集姓名、邮箱、电话（可选）、取货日期与时间、订单备注，以及你主动上传的参考图片。",
    useTitle: "信息用途",
    useBody:
      "我们仅将信息用于订单确认、沟通定制细节、安排取货和售后联系，不会将你的信息出售给第三方。",
    cookiesTitle: "Cookie",
    cookiesBody:
      "我们使用 Cookie 记录你的同意选择，并使用必要 Cookie 维持网站功能（例如后台管理员登录会话）。下单时你提交的联系方式与订单信息会用于履约沟通。继续使用本站或点击同意，即表示你知悉并接受上述用途。",
    storageTitle: "存储与安全",
    storageBody:
      "订单数据会保存在受权限控制的系统中。后台登录使用安全 Cookie（HttpOnly、SameSite、Secure in production）来维持管理员会话。",
    retentionTitle: "保存期限",
    retentionBody:
      "我们通常在业务所需范围内保留订单信息，默认不超过 180 天；如法律要求或争议处理需要，可能在必要范围内延长。",
    rightsTitle: "你的权利",
    rightsBody:
      "你可以通过邮箱联系我们，申请查看、修改或删除你的个人信息。我们会在合理时间内处理你的请求。",
    contactTitle: "联系方式",
    contactBody: "lulubakerychinohills@gmail.com",
    backHome: "返回首页",
    aboutLink: "关于我们",
    homeCrumb: "首页",
    privacyCrumb: "隐私政策",
  },
  en: {
    title: "Privacy Policy",
    effectiveDate: "Effective date: 2026-04-02",
    intro:
      "Lulu Bakery respects your privacy. This page explains what we collect, how we use it, and how you can request updates or deletion.",
    collectTitle: "Information We Collect",
    collectBody:
      "When you place an order, we may collect your name, email, phone (optional), pickup date/time, order notes, and any reference image you upload.",
    useTitle: "How We Use Information",
    useBody:
      "We only use your information to confirm orders, discuss customization details, arrange pickup, and provide follow-up support.",
    cookiesTitle: "Cookies",
    cookiesBody:
      "We use cookies to remember your consent choice and for essential site functions (such as secure admin login sessions). Contact and order details you submit are used to fulfill and communicate about your order. By continuing to use this site or accepting the banner, you acknowledge this use.",
    storageTitle: "Storage and Security",
    storageBody:
      "Order data is stored in access-controlled systems. Admin sessions use secure cookies (HttpOnly, SameSite, Secure in production).",
    retentionTitle: "Retention",
    retentionBody:
      "We keep order information only as long as needed for business purposes, typically up to 180 days, unless a longer period is legally required.",
    rightsTitle: "Your Rights",
    rightsBody:
      "You may contact us to request access, correction, or deletion of your personal information. We will respond within a reasonable timeframe.",
    contactTitle: "Contact",
    contactBody: "lulubakerychinohills@gmail.com",
    backHome: "Back to Home",
    aboutLink: "About Us",
    homeCrumb: "Home",
    privacyCrumb: "Privacy",
  },
  es: {
    title: "Politica de Privacidad",
    effectiveDate: "Fecha de vigencia: 2026-04-02",
    intro:
      "Lulu Bakery respeta tu privacidad. Esta pagina explica que datos recopilamos, como los usamos y como puedes solicitar cambios o eliminacion.",
    collectTitle: "Informacion que Recopilamos",
    collectBody:
      "Cuando haces un pedido, podemos recopilar nombre, correo, telefono (opcional), fecha/hora de recogida, notas y fotos de referencia que subas.",
    useTitle: "Como Usamos la Informacion",
    useBody:
      "Usamos la informacion solo para confirmar pedidos, hablar detalles de personalizacion, organizar la recogida y dar seguimiento.",
    cookiesTitle: "Cookies",
    cookiesBody:
      "Usamos cookies para recordar tu consentimiento y para funciones esenciales del sitio (como la sesion segura de administracion). Los datos de contacto y pedido que envias se usan para cumplir y comunicar tu pedido. Al continuar en el sitio o aceptar el aviso, reconoces este uso.",
    storageTitle: "Almacenamiento y Seguridad",
    storageBody:
      "Los datos del pedido se guardan en sistemas con control de acceso. La sesion admin usa cookies seguras (HttpOnly, SameSite, Secure en produccion).",
    retentionTitle: "Periodo de Conservacion",
    retentionBody:
      "Conservamos la informacion solo el tiempo necesario para el negocio, normalmente hasta 180 dias, salvo obligacion legal.",
    rightsTitle: "Tus Derechos",
    rightsBody:
      "Puedes escribirnos para solicitar acceso, correccion o eliminacion de tus datos personales. Responderemos en un plazo razonable.",
    contactTitle: "Contacto",
    contactBody: "lulubakerychinohills@gmail.com",
    backHome: "Volver al Inicio",
    aboutLink: "Sobre Nosotros",
    homeCrumb: "Inicio",
    privacyCrumb: "Privacidad",
  },
} as const;

export default function PrivacyPage() {
  const [language, setLanguage] = useState<Language>("en");
  const t = copy[language];
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] pb-6 text-zinc-800 outline-none sm:pb-10"
    >
      <SiteHeader language={language} onLanguageChange={setLanguage} />
      <div className="mx-auto max-w-6xl px-6">
        <Breadcrumbs items={[{ href: "/", label: t.homeCrumb }, { label: t.privacyCrumb }]} />
        <section className="rounded-2xl bg-linear-to-r from-[#E7E3DE] via-[#E3DED8] to-[#DED8D0] p-8 shadow-sm">
          <h1 className="text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-2 text-sm font-semibold text-[#5E524B]">{t.effectiveDate}</p>
          <p className="mt-4 max-w-3xl text-zinc-700">{t.intro}</p>
        </section>

        <section className="mt-8 grid gap-4">
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.collectTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.collectBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.useTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.useBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.cookiesTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.cookiesBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.storageTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.storageBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.retentionTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.retentionBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.rightsTitle}</h2>
            <p className="mt-2 text-sm text-zinc-700">{t.rightsBody}</p>
          </article>
          <article className="ui-card rounded-xl border border-[#D8D2C9] bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t.contactTitle}</h2>
            <a href={`mailto:${t.contactBody}`} className="mt-2 inline-block text-sm text-[#5C4B43] underline">
              {t.contactBody}
            </a>
          </article>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="ui-button inline-flex rounded-full bg-[#5C4B43] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38] focus-ring"
          >
            {t.backHome}
          </Link>
          <Link
            href="/about"
            className="ui-button inline-flex rounded-full border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] focus-ring"
          >
            {t.aboutLink}
          </Link>
        </div>
      </div>
      <SiteFooter language={language} />
    </main>
  );
}
