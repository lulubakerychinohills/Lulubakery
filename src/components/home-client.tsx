"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type TabKey = "showcase" | "order";
type Language = "zh" | "en" | "es";
type CakeCategory = "men" | "women" | "kids" | "other";
type CategoryFilter = "all" | CakeCategory;
type SizeOption = "4" | "6" | "8" | "10" | "double" | "other";
type FillingOption = "strawberry" | "mango" | "oreo" | "other";

type I18nText = Record<Language, string>;

type OrderForm = {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  referenceImageUrl: string;
  productCategory: string;
  productName: string;
  productImageUrl: string;
  size: SizeOption;
  customSize: string;
  filling: FillingOption;
  customFilling: string;
  notes: string;
};

const initialForm: OrderForm = {
  name: "",
  email: "",
  phone: "",
  pickupDate: "",
  pickupTime: "",
  referenceImageUrl: "",
  productCategory: "",
  productName: "",
  productImageUrl: "",
  size: "6",
  customSize: "",
  filling: "strawberry",
  customFilling: "",
  notes: "",
};

export type CakeItem = {
  id: string;
  title: string;
  category: CakeCategory;
  imageUrl?: string;
  titleI18n: I18nText;
  descriptionI18n: I18nText;
};

const categories: CategoryFilter[] = ["all", "men", "women", "kids", "other"];
const sizeOptions: SizeOption[] = ["4", "6", "8", "10", "double", "other"];
const fillingOptions: FillingOption[] = ["strawberry", "mango", "oreo", "other"];

const languageLabels: Record<Language, string> = {
  zh: "中文",
  en: "English",
  es: "Espanol",
};

const categoryLabels: Record<Language, Record<CategoryFilter, string>> = {
  zh: { all: "全部", men: "男士", women: "女士", kids: "儿童", other: "其他" },
  en: { all: "All", men: "Men", women: "Women", kids: "Kids", other: "Other" },
  es: { all: "Todo", men: "Hombres", women: "Mujeres", kids: "Ninos", other: "Otro" },
};

const sizeLabels: Record<Language, Record<SizeOption, string>> = {
  zh: { "4": "4寸", "6": "6寸", "8": "8寸", "10": "10寸", double: "双层（6+8）", other: "其他" },
  en: {
    "4": "4 inch",
    "6": "6 inch",
    "8": "8 inch",
    "10": "10 inch",
    double: "Double Layer (6+8)",
    other: "Other",
  },
  es: {
    "4": "4 pulgadas",
    "6": "6 pulgadas",
    "8": "8 pulgadas",
    "10": "10 pulgadas",
    double: "Doble Capa (6+8)",
    other: "Otro",
  },
};

const fillingLabels: Record<Language, Record<FillingOption, string>> = {
  zh: {
    strawberry: "草莓",
    mango: "芒果",
    oreo: "奥利奥奶油",
    other: "其他",
  },
  en: {
    strawberry: "Strawberry",
    mango: "Mango",
    oreo: "Oreo Cream",
    other: "Other",
  },
  es: {
    strawberry: "Fresa",
    mango: "Mango",
    oreo: "Crema de Oreo",
    other: "Otro",
  },
};

const copy = {
  zh: {
    brand: "Lulu Bakery",
    location: "Chino Hills",
    title: "手作蛋糕与甜点展示",
    intro: "欢迎下单订制蛋糕与甜点。支持选择尺寸、夹馅，并可在线提交订单。",
    tabShowcase: "展示",
    tabOrder: "订购",
    aboutLink: "关于我们",
    showcaseTitle: "蛋糕展示",
    showcaseHint: "先选择分类，再点击具体款式查看订购细节。",
    showcaseCustomHint: "没有看到想要的款式？你可以上传参考图片，我们会按你的想法沟通定制。",
    detail: "查看订购细节",
    orderThis: "订购这款蛋糕",
    selected: "已选择",
    availableSize: "可选尺寸",
    availableFilling: "可选夹馅",
    deliverySupport: "配送：支持送货和自取",
    orderTitle: "在线下单",
    orderHint: "请填写具体需求，提交后我会通过邮箱收到订单内容。",
    needPick: "你还没有选择具体蛋糕。请先切换到“展示”Tab 选择款式，再回来提交订单。",
    currentCake: "当前订购款式",
    name: "姓名",
    category: "分类",
    cakeName: "蛋糕款式",
    size: "尺寸",
    otherSize: "其他尺寸",
    filling: "夹馅",
    otherFilling: "其他夹馅",
    delivery: "是否需要送货",
    address: "配送地址",
    email: "邮箱",
    phone: "手机号（可选）",
    pickupDate: "取货日期",
    pickupTime: "取货时间",
    referenceImage: "参考图片（可选）",
    uploadReferenceImage: "上传参考图片",
    uploadingReferenceImage: "上传中...",
    notes: "备注",
    submit: "提交订单",
    submitting: "提交中...",
    contactRequired: "请填写邮箱，方便联系。",
    otherSizeRequired: "你选择了其他尺寸，请填写具体尺寸。",
    otherFillingRequired: "你选择了其他夹馅，请填写具体口味。",
    pickupRequired: "请填写取货日期和时间。",
    needAddress: "你选择了送货，请填写配送地址。",
    pickFirst: "请先在展示页选择具体蛋糕，再填写订购信息。",
    success: "订单提交成功！我已经收到你的下单信息，会尽快联系你。",
    successDialogTitle: "下单成功",
    successDialogBody: "我们已收到你的订单，会尽快联系你。",
    closeDialog: "我知道了",
    yes: "是",
    no: "否",
    placeholderName: "例如：王小姐",
    placeholderAddress: "请填写详细地址",
    placeholderEmail: "you@example.com",
    placeholderPhone: "13800000000",
    placeholderPickupTime: "例如：14:30",
    placeholderOtherSize: "例如：7寸 / 6+10 / 3层",
    placeholderReferenceImageUrl: "也可以粘贴图片链接（可选）",
    placeholderNotes: "例如：希望周六上午送达，写生日祝福语等",
    placeholderOtherFilling: "例如：榴莲 / 红豆 / 奶酪",
    selectFromShowcase: "请先在展示页选择",
  },
  en: {
    brand: "Lulu Bakery",
    location: "Chino Hills",
    title: "Custom Cakes & Desserts",
    intro:
      "Welcome to order custom cakes and desserts. Choose size and filling, then submit online.",
    tabShowcase: "Showcase",
    tabOrder: "Order",
    aboutLink: "About Us",
    showcaseTitle: "Cake Showcase",
    showcaseHint: "Choose a category first, then open a cake for ordering details.",
    showcaseCustomHint: "If you cannot find the style you want, upload a reference photo for custom discussion.",
    detail: "View Order Details",
    orderThis: "Order This Cake",
    selected: "Selected",
    availableSize: "Available Sizes",
    availableFilling: "Available Fillings",
    availableSugar: "Available Sweetness",
    deliverySupport: "Delivery: shipping and pickup supported",
    orderTitle: "Place Order",
    orderHint: "Fill in your requirements. I will receive this order by email.",
    needPick: "No cake selected yet. Please pick one in the Showcase tab first.",
    currentCake: "Current Cake",
    name: "Name",
    category: "Category",
    cakeName: "Cake Style",
    size: "Size",
    otherSize: "Other Size",
    filling: "Filling",
    otherFilling: "Other Filling",
    delivery: "Need Delivery",
    address: "Delivery Address",
    email: "Email",
    phone: "Phone (Optional)",
    pickupDate: "Pickup Date",
    pickupTime: "Pickup Time",
    referenceImage: "Reference Image (Optional)",
    uploadReferenceImage: "Upload Reference Image",
    uploadingReferenceImage: "Uploading...",
    notes: "Notes",
    submit: "Submit Order",
    submitting: "Submitting...",
    contactRequired: "Please provide your email.",
    otherSizeRequired: "Please enter your custom size.",
    otherFillingRequired: "Please enter your custom filling.",
    pickupRequired: "Please provide pickup date and time.",
    needAddress: "You selected delivery. Please enter the address.",
    pickFirst: "Please select a cake from Showcase before ordering.",
    success: "Order submitted successfully. I will contact you soon.",
    successDialogTitle: "Order Submitted",
    successDialogBody: "We received your order and will contact you soon.",
    closeDialog: "OK",
    yes: "Yes",
    no: "No",
    placeholderName: "e.g. Olivia",
    placeholderAddress: "Please enter full address",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+1 555 123 4567",
    placeholderPickupTime: "e.g. 2:30 PM",
    placeholderOtherSize: "e.g. 7 inch / 6+10 / 3 tiers",
    placeholderReferenceImageUrl: "You can also paste an image URL (optional)",
    placeholderNotes: "e.g. Please deliver Saturday morning",
    placeholderOtherFilling: "e.g. Durian / Red Bean / Cream Cheese",
    selectFromShowcase: "Please select in Showcase",
  },
  es: {
    brand: "Lulu Bakery",
    location: "Chino Hills",
    title: "Pasteles y Postres Personalizados",
    intro:
      "Bienvenido a pedir pasteles y postres personalizados. Elige tamano y relleno, y envia tu pedido.",
    tabShowcase: "Galeria",
    tabOrder: "Pedido",
    aboutLink: "Sobre Nosotros",
    showcaseTitle: "Galeria de Pasteles",
    showcaseHint: "Primero elige una categoria y luego abre un pastel para ver detalles.",
    showcaseCustomHint: "Si no encuentras el estilo que quieres, sube una foto de referencia para personalizar.",
    detail: "Ver Detalles de Pedido",
    orderThis: "Pedir Este Pastel",
    selected: "Seleccionado",
    availableSize: "Tamanos Disponibles",
    availableFilling: "Rellenos Disponibles",
    availableSugar: "Nivel de Dulzor",
    deliverySupport: "Entrega: envio y recogida disponibles",
    orderTitle: "Hacer Pedido",
    orderHint: "Completa tus requisitos. Recibire este pedido por correo.",
    needPick: "Aun no has elegido un pastel. Selecciona uno en la Galeria.",
    currentCake: "Pastel Actual",
    name: "Nombre",
    category: "Categoria",
    cakeName: "Estilo de Pastel",
    size: "Tamano",
    otherSize: "Otro tamano",
    filling: "Relleno",
    otherFilling: "Otro relleno",
    delivery: "Necesita Entrega",
    address: "Direccion de Entrega",
    email: "Correo",
    phone: "Telefono (Opcional)",
    pickupDate: "Fecha de recogida",
    pickupTime: "Hora de recogida",
    referenceImage: "Imagen de referencia (Opcional)",
    uploadReferenceImage: "Subir imagen de referencia",
    uploadingReferenceImage: "Subiendo...",
    notes: "Notas",
    submit: "Enviar Pedido",
    submitting: "Enviando...",
    contactRequired: "Por favor completa tu correo.",
    otherSizeRequired: "Elegiste otro tamano. Completa el tamano personalizado.",
    otherFillingRequired: "Elegiste otro relleno. Completa el relleno personalizado.",
    pickupRequired: "Completa fecha y hora de recogida.",
    needAddress: "Elegiste entrega. Ingresa la direccion.",
    pickFirst: "Selecciona primero un pastel en la Galeria.",
    success: "Pedido enviado correctamente. Te contactare pronto.",
    successDialogTitle: "Pedido enviado",
    successDialogBody: "Recibimos tu pedido y te contactaremos pronto.",
    closeDialog: "Entendido",
    yes: "Si",
    no: "No",
    placeholderName: "ej. Sofia",
    placeholderAddress: "Ingresa direccion completa",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+34 600 000 000",
    placeholderPickupTime: "ej. 14:30",
    placeholderOtherSize: "ej. 7 pulgadas / 6+10 / 3 pisos",
    placeholderReferenceImageUrl: "Tambien puedes pegar un enlace de imagen (opcional)",
    placeholderNotes: "ej. Entrega el sabado por la manana",
    placeholderOtherFilling: "ej. Durian / Frijol rojo / Queso crema",
    selectFromShowcase: "Selecciona primero en Galeria",
  },
} as const;

type Props = {
  initialProducts: CakeItem[];
};

export default function HomeClient({ initialProducts }: Props) {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<TabKey>("showcase");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [products] = useState<CakeItem[]>(initialProducts);
  const [selectedCake, setSelectedCake] = useState<CakeItem | null>(null);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingReferenceImage, setUploadingReferenceImage] = useState(false);
  const [message, setMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = copy[language];
  const filteredWorks = useMemo(
    () => (activeCategory === "all" ? products : products.filter((work) => work.category === activeCategory)),
    [activeCategory, products],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const goOrder = (cake: CakeItem) => {
    setSelectedCake(cake);
    setForm((prev) => ({
      ...prev,
      productName: cake.title,
      productCategory: cake.category,
      productImageUrl: cake.imageUrl || "",
    }));
    setActiveTab("order");
    setMessage("");
  };

  const onReferenceImageSelected = async (file: File) => {
    setMessage("");
    setUploadingReferenceImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await fetch("/api/orders/upload-reference-image", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { url?: string; message?: string };
      const nextUrl = result.url;
      if (!response.ok || !nextUrl) {
        throw new Error(result.message || "图片上传失败。");
      }
      setForm((prev) => ({ ...prev, referenceImageUrl: nextUrl }));
      setActiveTab("order");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "图片上传失败。");
    } finally {
      setUploadingReferenceImage(false);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if ((!form.productCategory.trim() || !form.productName.trim()) && !form.referenceImageUrl.trim()) {
      setMessage(t.pickFirst);
      return;
    }

    if (!form.email.trim()) {
      setMessage(t.contactRequired);
      return;
    }

    if (form.size === "other" && !form.customSize.trim()) {
      setMessage(t.otherSizeRequired);
      return;
    }

    if (form.filling === "other" && !form.customFilling.trim()) {
      setMessage(t.otherFillingRequired);
      return;
    }

    if (!form.pickupDate.trim() || !form.pickupTime.trim()) {
      setMessage(t.pickupRequired);
      return;
    }

    setSubmitting(true);
    try {
      const submitPayload = {
        ...form,
        size: form.size === "other" ? form.customSize.trim() : form.size,
        filling: form.filling === "other" ? form.customFilling.trim() : form.filling,
      };
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitPayload),
      });

      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "提交失败，请稍后重试。");
      }

      setMessage("");
      setShowSuccessDialog(true);
      setForm((prev) => ({
        ...initialForm,
        productName: prev.productName,
        productCategory: prev.productCategory,
        productImageUrl: prev.productImageUrl,
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "mt-1 w-full rounded-lg border border-rose-200 px-3 py-2 outline-none transition focus:border-rose-400";

  return (
    <main className="min-h-screen bg-linear-to-b from-pink-50 via-rose-50 to-amber-50 py-10 text-zinc-800">
      <div className="mx-auto max-w-6xl px-6">
        <section className="rounded-2xl bg-linear-to-r from-rose-200 via-pink-200 to-amber-200 p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-rose-700">{t.brand}</p>
              <p className="text-xs text-rose-800/80">{t.location}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Select language"
                value={language}
                onChange={(event) => setLanguage(event.target.value as Language)}
                className="rounded-full border border-rose-300 bg-white px-4 py-1.5 text-sm font-semibold text-rose-700 outline-none transition focus:border-rose-500"
              >
                {(["en", "zh", "es"] as Language[]).map((lang) => (
                  <option key={lang} value={lang}>
                    {languageLabels[lang]}
                  </option>
                ))}
              </select>
              <Link
                href="/about"
                className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-zinc-700"
              >
                {t.aboutLink}
              </Link>
            </div>
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t.title}</h1>
          <p className="mt-3 max-w-3xl text-zinc-700">{t.intro}</p>
          <div className="mt-5 overflow-hidden rounded-xl border border-rose-200 bg-white/70">
            <div className="relative h-52 w-full sm:h-64">
              <Image src="/products/cupcake.jpg" alt="Assorted bakery cakes" fill className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("showcase")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${activeTab === "showcase" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
              }`}
          >
            {t.tabShowcase}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("order")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${activeTab === "order" ? "bg-rose-500 text-white" : "bg-rose-100 text-rose-700 hover:bg-rose-200"
              }`}
          >
            {t.tabOrder}
          </button>
        </section>

        {activeTab === "showcase" && (
          <section className="mt-8 rounded-2xl border border-rose-200 bg-white/95 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{t.showcaseTitle}</h2>
            <p className="mt-2 text-sm text-zinc-600">{t.showcaseHint}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {mounted
                ? categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === activeCategory ? "bg-rose-500 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                      }`}
                  >
                    {categoryLabels[language][category]}
                  </button>
                ))
                : null}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {filteredWorks.map((work) => (
                <button
                  key={work.id}
                  type="button"
                  className="rounded-xl border border-rose-100 bg-white p-5 text-left shadow-sm transition hover:border-rose-300 hover:shadow-md"
                  onClick={() => goOrder(work)}
                >
                  {work.imageUrl ? (
                    <div className="relative aspect-square overflow-hidden rounded-lg">
                      <Image
                        src={work.imageUrl}
                        alt={work.titleI18n[language]}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 33vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-linear-to-br from-rose-100 to-orange-100" />
                  )}
                  <h3 className="mt-3 text-lg font-semibold">{work.titleI18n[language]}</h3>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{t.showcaseCustomHint}</p>
              <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-700">
                {uploadingReferenceImage ? t.uploadingReferenceImage : t.uploadReferenceImage}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingReferenceImage}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void onReferenceImageSelected(file);
                    }
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

          </section>
        )}

        {activeTab === "order" && (
          <section className="mt-8 rounded-2xl border border-rose-200 bg-white/95 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{t.orderTitle}</h2>
            <p className="mt-2 text-sm text-zinc-600">{t.orderHint}</p>
            {!selectedCake && !form.referenceImageUrl.trim() && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                {t.needPick}
              </div>
            )}
            {selectedCake && (
              <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-zinc-700">
                {t.currentCake}：<span className="font-semibold">{selectedCake.titleI18n[language]}</span>
                {selectedCake.imageUrl ? (
                  <div className="relative mt-3 aspect-square w-full max-w-sm overflow-hidden rounded-lg border border-rose-200 bg-white">
                    <Image
                      src={selectedCake.imageUrl}
                      alt={selectedCake.titleI18n[language]}
                      fill
                      className="object-cover"
                      sizes="(min-width: 640px) 24rem, 100vw"
                    />
                  </div>
                ) : null}
              </div>
            )}
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
              <label>
                {t.name}
                <input
                  className={inputClassName}
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t.placeholderName}
                  required
                />
              </label>
              <label>
                {t.size}
                <select
                  className={inputClassName}
                  value={form.size}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      size: e.target.value as SizeOption,
                      customSize: e.target.value === "other" ? prev.customSize : "",
                    }))
                  }
                >
                  {sizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {sizeLabels[language][size]}
                    </option>
                  ))}
                </select>
              </label>
              {form.size === "other" && (
                <label>
                  {t.otherSize}
                  <input
                    className={inputClassName}
                    value={form.customSize}
                    onChange={(e) => setForm((prev) => ({ ...prev, customSize: e.target.value }))}
                    placeholder={t.placeholderOtherSize}
                    required
                  />
                </label>
              )}
              <label>
                {t.filling}
                <select
                  className={inputClassName}
                  value={form.filling}
                  onChange={(e) => setForm((prev) => ({ ...prev, filling: e.target.value as FillingOption }))}
                >
                  {fillingOptions.map((filling) => (
                    <option key={filling} value={filling}>
                      {fillingLabels[language][filling]}
                    </option>
                  ))}
                </select>
              </label>
              {form.filling === "other" && (
                <label>
                  {t.otherFilling}
                  <input
                    className={inputClassName}
                    value={form.customFilling}
                    onChange={(e) => setForm((prev) => ({ ...prev, customFilling: e.target.value }))}
                    placeholder={t.placeholderOtherFilling}
                    required
                  />
                </label>
              )}
              <label>
                {t.email}
                <input
                  className={inputClassName}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder={t.placeholderEmail}
                  required
                />
              </label>
              <label>
                {t.phone}
                <input
                  className={inputClassName}
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder={t.placeholderPhone}
                />
              </label>
              <label>
                {t.pickupDate}
                <input
                  className={inputClassName}
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, pickupDate: e.target.value }))}
                  required
                />
              </label>
              <label>
                {t.pickupTime}
                <input
                  className={inputClassName}
                  type="time"
                  value={form.pickupTime}
                  onChange={(e) => setForm((prev) => ({ ...prev, pickupTime: e.target.value }))}
                  placeholder={t.placeholderPickupTime}
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <p>{t.referenceImage}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <label className="inline-flex cursor-pointer rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50">
                    {uploadingReferenceImage ? t.uploadingReferenceImage : t.uploadReferenceImage}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingReferenceImage}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void onReferenceImageSelected(file);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {form.referenceImageUrl ? (
                    <span className="text-xs text-green-700">Uploaded</span>
                  ) : null}
                </div>
                {form.referenceImageUrl ? (
                  <div className="relative mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-lg border border-rose-200 bg-white">
                    <Image src={form.referenceImageUrl} alt="Reference image" fill className="object-cover" sizes="18rem" />
                  </div>
                ) : null}
              </div>
              <label className="sm:col-span-2">
                {t.notes}
                <textarea
                  className={inputClassName}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={t.placeholderNotes}
                  rows={4}
                />
              </label>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-rose-500 px-5 py-2 font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
                >
                  {submitting ? t.submitting : t.submit}
                </button>
                {message && <p className="mt-3 text-sm text-zinc-700">{message}</p>}
              </div>
            </form>
          </section>
        )}
      </div>
      {showSuccessDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowSuccessDialog(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900">{t.successDialogTitle}</h3>
            <p className="mt-3 text-sm text-zinc-700">{t.successDialogBody}</p>
            <button
              type="button"
              className="mt-5 rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600"
              onClick={() => setShowSuccessDialog(false)}
            >
              {t.closeDialog}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
