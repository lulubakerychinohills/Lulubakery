"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import Breadcrumbs from "@/components/breadcrumbs";
import SiteFooter from "@/components/site-footer";
import SiteHeader, { type SiteLanguage } from "@/components/site-header";
import {
  DESSERT_MENU_PIXEL_HEIGHT,
  DESSERT_MENU_PIXEL_WIDTH,
  DESSERT_MENU_PUBLIC_PATH,
} from "@/lib/menu-image";
import { filterProducts } from "@/lib/product-search";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/lib/upload-image";
import PayPalCheckout from "@/components/paypal-checkout";

type Language = SiteLanguage;
type CakeCategory = "men" | "women" | "kids" | "sweet" | "other";
type CategoryFilter = "all" | CakeCategory;
type SizeOption = "4" | "6" | "8" | "10" | "double" | "other";
type FillingOption = "strawberry" | "mango" | "durian" | "oreo" | "other";

type I18nText = Record<Language, string>;

type OrderForm = {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  referenceImageUrl: string;
  productCategory: string;
  productId: string;
  productImageUrl: string;
  size: SizeOption;
  customSize: string;
  filling: FillingOption;
  customFilling: string;
  notes: string;
  acceptedPolicy: boolean;
  depositAmount: string;
};

const defaultDepositAmount = (process.env.NEXT_PUBLIC_ORDER_DEPOSIT_USD || "50.00").trim() || "50.00";

const initialForm: OrderForm = {
  name: "",
  email: "",
  phone: "",
  pickupDate: "",
  pickupTime: "",
  referenceImageUrl: "",
  productCategory: "",
  productId: "",
  productImageUrl: "",
  size: "6",
  customSize: "",
  filling: "strawberry",
  customFilling: "",
  notes: "",
  acceptedPolicy: false,
  depositAmount: defaultDepositAmount,
};

export type CakeItem = {
  id: string;
  category: CakeCategory;
  imageUrl?: string;
  descriptionI18n: I18nText;
  sortOrder: number;
};

const categories: CategoryFilter[] = ["all", "men", "women", "kids", "sweet", "other"];
const categoryRouteMap: Record<CategoryFilter, string> = {
  all: "/",
  men: "/cakeformen",
  women: "/cakeforwomen",
  kids: "/cakeforkids",
  sweet: "/sweet",
  other: "/cakeforother",
};
const routeCategoryMap: Record<string, CategoryFilter> = {
  "/": "all",
  "/cakeformen": "men",
  "/cakeforwomen": "women",
  "/cakeforkids": "kids",
  "/sweet": "sweet",
  "/cakeforother": "other",
};
const sizeOptions: SizeOption[] = ["4", "6", "8", "10", "double", "other"];
const fillingOptions: FillingOption[] = ["strawberry", "mango", "durian", "oreo", "other"];

const ORDER_PRODUCT_STORAGE_KEY = "lulu-order-product-id";
const ORDER_REFERENCE_STORAGE_KEY = "lulu-order-reference-image";

const categoryLabels: Record<Language, Record<CategoryFilter, string>> = {
  zh: { all: "全部", men: "男士", women: "女士", kids: "儿童", sweet: "甜品", other: "其他" },
  en: { all: "All", men: "Men", women: "Women", kids: "Kids", sweet: "Desserts", other: "Other" },
  es: { all: "Todo", men: "Hombres", women: "Mujeres", kids: "Ninos", sweet: "Postres", other: "Otro" },
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
    durian: "榴莲",
    oreo: "奥利奥奶油",
    other: "其他",
  },
  en: {
    strawberry: "Strawberry",
    mango: "Mango",
    durian: "Durian",
    oreo: "Oreo Cream",
    other: "Other",
  },
  es: {
    strawberry: "Fresa",
    mango: "Mango",
    durian: "Durian",
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
    backToGallery: "继续浏览蛋糕",
    tabShowcase: "展示",
    tabOrder: "订购",
    aboutLink: "关于我们",
    privacyLink: "隐私政策",
    wechatQrAlt: "微信二维码：扫码添加 Lulucake818",
    sweetStylesHeading: "甜品作品图",
    sweetMenuHeading: "价目与菜单",
    sweetMenuIntro: "以下为甜品价目与说明；实拍款式请进入作品图页面浏览。",
    sweetPhotosHint: "以下为甜品款式实拍，点击图片可下单。",
    viewDessertPhotosLink: "查看甜品作品图",
    backToDessertMenuLink: "返回甜品价目菜单",
    sweetEmpty: "暂无作品图，可先返回价目菜单参考。",
    showcaseTitle: "蛋糕展示",
    showcaseHint: "先选择分类，再点击具体款式查看订购细节。",
    searchLabel: "搜索款式",
    searchPlaceholder: "按描述或分类搜索…",
    searchEmpty: "没有匹配的款式，请换个关键词或分类。",
    showcaseCustomHint: "没有看到想要的款式？你可以上传参考图片，我们会按你的想法沟通定制。",
    orderTitle: "在线下单",
    orderHint: "请填写具体需求，并通过 PayPal 支付订金完成下单。",
    orderStep1: "1. 选择款式或上传参考图",
    orderStep2: "2. 选择尺寸与夹馅",
    orderStep3: "3. 填写联系方式与取货时间",
    orderStep4: "4. PayPal 支付订金",
    needPick: "你还没有选择具体蛋糕。请先切换到“展示”Tab 选择款式，再回来提交订单。",
    currentCake: "当前订购款式",
    name: "姓名",
    size: "尺寸",
    otherSize: "其他尺寸",
    filling: "夹馅",
    otherFilling: "其他夹馅",
    email: "邮箱",
    phone: "手机号（可选）",
    pickupDate: "取货日期",
    pickupTime: "取货时间",
    referenceImage: "参考图片（可选）",
    uploadReferenceImage: "上传参考图片",
    uploadingReferenceImage: "上传中...",
    imageUploadHint: "图片文件须小于或等于 10MB。",
    imageTooLarge: "图片超过 10MB，请压缩后再上传。",
    notes: "备注",
    submit: "仅提交意向（不付款）",
    submitting: "提交中...",
    payDeposit: "订金金额（USD）",
    payHint: "请填写本次订金金额，定制蛋糕先付订金锁定档期，尾款取货时结清。",
    paying: "正在处理支付…",
    depositRequired: "请填写订金金额。",
    depositInvalid: "请填写有效订金金额（至少 1 USD）。",
    placeholderDeposit: "例如：50.00",
    successDialogTitle: "下单成功",
    successDialogBody: "我们已收到你的订单，会尽快联系你。",
    successPaidBody: "订金支付成功，我们已收到订单，会尽快联系你确认细节。",
    closeDialog: "我知道了",
    policyConsent: "提交订单即表示你同意我们的《隐私政策》。",
    policyRequired: "请先勾选同意隐私政策。",
    placeholderName: "例如：王小姐",
    placeholderEmail: "you@example.com",
    placeholderPhone: "13800000000",
    placeholderPickupTime: "例如：14:30",
    placeholderOtherSize: "例如：7寸 / 6+10 / 3层",
    placeholderNotes: "例如：希望周六上午送达，写生日祝福语等",
    placeholderOtherFilling: "例如：榴莲 / 红豆 / 奶酪",
    contactRequired: "请填写邮箱，方便联系。",
    nameRequired: "请填写姓名。",
    otherSizeRequired: "你选择了其他尺寸，请填写具体尺寸。",
    otherFillingRequired: "你选择了其他夹馅，请填写具体口味。",
    pickupRequired: "请填写取货日期和时间。",
    pickFirst: "请先在展示页选择具体蛋糕，或上传参考图片。",
  },
  en: {
    brand: "Lulu Bakery",
    location: "Chino Hills",
    title: "Custom Cakes & Desserts",
    intro:
      "Welcome to order custom cakes and desserts. Choose size and filling, then submit online.",
    backToGallery: "Keep browsing cakes",
    tabShowcase: "Showcase",
    tabOrder: "Order",
    aboutLink: "About Us",
    privacyLink: "Privacy Policy",
    wechatQrAlt: "WeChat QR code: scan to add Lulucake818",
    sweetStylesHeading: "Dessert photos",
    sweetMenuHeading: "Menu & prices",
    sweetMenuIntro: "Dessert menu and prices below. Use the link for photos of our work.",
    sweetPhotosHint: "Photos of dessert styles below. Tap an image to order.",
    viewDessertPhotosLink: "View dessert photos",
    backToDessertMenuLink: "Back to menu & prices",
    sweetEmpty: "No photos yet. Go back to the menu for options and pricing.",
    showcaseTitle: "Cake Showcase",
    showcaseHint: "Choose a category first, then open a cake for ordering details.",
    searchLabel: "Search styles",
    searchPlaceholder: "Search by description or category…",
    searchEmpty: "No matching styles. Try another keyword or category.",
    showcaseCustomHint: "If you cannot find the style you want, upload a reference photo for custom discussion.",
    orderTitle: "Place Order",
    orderHint: "Fill in your requirements, then pay a deposit with PayPal to place the order.",
    orderStep1: "1. Pick style or upload reference",
    orderStep2: "2. Choose size and filling",
    orderStep3: "3. Leave contact and pickup details",
    orderStep4: "4. Pay deposit with PayPal",
    needPick: "No cake selected yet. Please pick one in the Showcase tab first.",
    currentCake: "Current Cake",
    name: "Name",
    size: "Size",
    otherSize: "Other Size",
    filling: "Filling",
    otherFilling: "Other Filling",
    email: "Email",
    phone: "Phone (Optional)",
    pickupDate: "Pickup Date",
    pickupTime: "Pickup Time",
    referenceImage: "Reference Image (Optional)",
    uploadReferenceImage: "Upload Reference Image",
    uploadingReferenceImage: "Uploading...",
    imageUploadHint: "Image files must be 10 MB or smaller.",
    imageTooLarge: "This image is over 10 MB. Please compress it and try again.",
    notes: "Notes",
    submit: "Submit without payment",
    submitting: "Submitting...",
    payDeposit: "Deposit amount (USD)",
    payHint: "Enter your deposit amount to reserve the date. Remaining balance is due at pickup.",
    paying: "Processing payment…",
    depositRequired: "Please enter a deposit amount.",
    depositInvalid: "Please enter a valid deposit (at least $1 USD).",
    placeholderDeposit: "e.g. 50.00",
    contactRequired: "Please provide your email.",
    nameRequired: "Please provide your name.",
    otherSizeRequired: "Please enter your custom size.",
    otherFillingRequired: "Please enter your custom filling.",
    pickupRequired: "Please provide pickup date and time.",
    pickFirst: "Please select a cake from Showcase, or upload a reference photo.",
    successDialogTitle: "Order Submitted",
    successDialogBody: "We received your order and will contact you soon.",
    successPaidBody: "Deposit paid. We received your order and will contact you soon.",
    closeDialog: "OK",
    policyConsent: "By submitting, you agree to our Privacy Policy.",
    policyRequired: "Please agree to the Privacy Policy before submitting.",
    placeholderName: "e.g. Olivia",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+1 555 123 4567",
    placeholderPickupTime: "e.g. 2:30 PM",
    placeholderOtherSize: "e.g. 7 inch / 6+10 / 3 tiers",
    placeholderNotes: "e.g. Please deliver Saturday morning",
    placeholderOtherFilling: "e.g. Durian / Red Bean / Cream Cheese",
  },
  es: {
    brand: "Lulu Bakery",
    location: "Chino Hills",
    title: "Pasteles y Postres Personalizados",
    intro:
      "Bienvenido a pedir pasteles y postres personalizados. Elige tamano y relleno, y envia tu pedido.",
    backToGallery: "Seguir viendo pasteles",
    tabShowcase: "Galeria",
    tabOrder: "Pedido",
    aboutLink: "Sobre Nosotros",
    privacyLink: "Politica de Privacidad",
    wechatQrAlt: "Codigo QR de WeChat: escanear para agregar Lulucake818",
    sweetStylesHeading: "Fotos de postres",
    sweetMenuHeading: "Carta y precios",
    sweetMenuIntro: "Menu y precios abajo. El enlace lleva a las fotos.",
    sweetPhotosHint: "Fotos de estilos a continuacion. Toca una imagen para pedir.",
    viewDessertPhotosLink: "Ver fotos de postres",
    backToDessertMenuLink: "Volver al menu y precios",
    sweetEmpty: "Aun no hay fotos. Vuelve al menu.",
    showcaseTitle: "Galeria de Pasteles",
    showcaseHint: "Primero elige una categoria y luego abre un pastel para ver detalles.",
    searchLabel: "Buscar estilos",
    searchPlaceholder: "Busca por descripcion o categoria…",
    searchEmpty: "Sin coincidencias. Prueba otra palabra o categoria.",
    showcaseCustomHint: "Si no encuentras el estilo que quieres, sube una foto de referencia para personalizar.",
    orderTitle: "Hacer Pedido",
    orderHint: "Completa tus requisitos y paga el deposito con PayPal para confirmar.",
    orderStep1: "1. Elige estilo o sube referencia",
    orderStep2: "2. Elige tamano y relleno",
    orderStep3: "3. Deja contacto y hora de recogida",
    orderStep4: "4. Paga deposito con PayPal",
    needPick: "Aun no has elegido un pastel. Selecciona uno en la Galeria.",
    currentCake: "Pastel Actual",
    name: "Nombre",
    size: "Tamano",
    otherSize: "Otro tamano",
    filling: "Relleno",
    otherFilling: "Otro relleno",
    email: "Correo",
    phone: "Telefono (Opcional)",
    pickupDate: "Fecha de recogida",
    pickupTime: "Hora de recogida",
    referenceImage: "Imagen de referencia (Opcional)",
    uploadReferenceImage: "Subir imagen de referencia",
    uploadingReferenceImage: "Subiendo...",
    imageUploadHint: "La imagen debe pesar como maximo 10 MB.",
    imageTooLarge: "La imagen supera 10 MB. Comprimela y vuelve a intentarlo.",
    notes: "Notas",
    submit: "Enviar sin pago",
    submitting: "Enviando...",
    payDeposit: "Monto del deposito (USD)",
    payHint: "Ingresa el deposito para reservar la fecha. El resto se paga al recoger.",
    paying: "Procesando pago…",
    depositRequired: "Ingresa el monto del deposito.",
    depositInvalid: "Ingresa un deposito valido (minimo 1 USD).",
    placeholderDeposit: "ej. 50.00",
    contactRequired: "Por favor completa tu correo.",
    nameRequired: "Por favor completa tu nombre.",
    otherSizeRequired: "Elegiste otro tamano. Completa el tamano personalizado.",
    otherFillingRequired: "Elegiste otro relleno. Completa el relleno personalizado.",
    pickupRequired: "Completa fecha y hora de recogida.",
    pickFirst: "Selecciona un pastel en la Galeria, o sube una foto de referencia.",
    successDialogTitle: "Pedido enviado",
    successDialogBody: "Recibimos tu pedido y te contactaremos pronto.",
    successPaidBody: "Deposito pagado. Recibimos tu pedido y te contactaremos pronto.",
    closeDialog: "Entendido",
    policyConsent: "Al enviar, aceptas nuestra Politica de Privacidad.",
    policyRequired: "Debes aceptar la Politica de Privacidad antes de enviar.",
    placeholderName: "ej. Sofia",
    placeholderEmail: "you@example.com",
    placeholderPhone: "+34 600 000 000",
    placeholderPickupTime: "ej. 14:30",
    placeholderOtherSize: "ej. 7 pulgadas / 6+10 / 3 pisos",
    placeholderNotes: "ej. Entrega el sabado por la manana",
    placeholderOtherFilling: "ej. Durian / Frijol rojo / Queso crema",
  },
} as const;

function WorkShowcaseCard({
  work,
  language,
  onSelect,
}: {
  work: CakeItem;
  language: Language;
  onSelect: (cake: CakeItem) => void;
}) {
  const title =
    work.descriptionI18n[language]?.trim() ||
    work.descriptionI18n.en?.trim() ||
    `${categoryLabels[language][work.category as CakeCategory] ?? work.category} cake`;
  const categoryLabel = categoryLabels[language][work.category as CakeCategory] ?? work.category;
  const imageAlt =
    language === "zh"
      ? `${categoryLabel}蛋糕照片：${title}（${work.id.slice(0, 8)}）`
      : language === "es"
        ? `Foto de pastel ${categoryLabel}: ${title} (${work.id.slice(0, 8)})`
        : `${categoryLabel} cake photo: ${title} (${work.id.slice(0, 8)})`;

  return (
    <button
      type="button"
      className="rounded-xl border border-[#DDD6CE] bg-white p-4 text-left shadow-sm transition hover:border-[#CDBFAF] hover:shadow-md focus-ring"
      onClick={() => onSelect(work)}
      aria-label={
        language === "zh" ? `订购：${title}` : language === "es" ? `Pedir: ${title}` : `Order: ${title}`
      }
    >
      {work.imageUrl ? (
        <div className="relative aspect-square overflow-hidden rounded-lg">
          <Image
            src={work.imageUrl}
            alt={imageAlt}
            fill
            unoptimized={work.category === "sweet"}
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            className="object-cover brightness-95 contrast-105"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 100vw"
          />
        </div>
      ) : (
        <div className="aspect-square rounded-lg bg-linear-to-br from-[#EEEAE4] to-[#E8E2D9]" aria-hidden="true" />
      )}
      <p className="mt-3 line-clamp-2 text-sm font-semibold text-[#4C403A]">{title}</p>
      <p className="mt-1 text-xs text-[#6A5D56]">{categoryLabel}</p>
    </button>
  );
}

type Props = {
  initialProducts: CakeItem[];
  initialCategory?: CategoryFilter;
  initialTab?: "showcase" | "order";
};

export default function HomeClient({ initialProducts, initialCategory = "all" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchInputId = useId();
  const dialogTitleId = useId();
  const dialogDescId = useId();
  const closeDialogRef = useRef<HTMLButtonElement>(null);
  const isOrderPage = pathname === "/order";
  const [language, setLanguage] = useState<Language>("en");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(initialCategory);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCake, setSelectedCake] = useState<CakeItem | null>(null);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [uploadingReferenceImage, setUploadingReferenceImage] = useState(false);
  const [orderMessage, setOrderMessageState] = useState("");
  const [fieldErrorId, setFieldErrorId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successPaid, setSuccessPaid] = useState(false);
  const t = copy[language];
  const depositCurrency = (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD").trim().toUpperCase() || "USD";
  const normalizedDeposit = (() => {
    const cleaned = form.depositAmount.replace(/[$,\s]/g, "");
    const n = Number.parseFloat(cleaned);
    return Number.isFinite(n) && n > 0 ? n.toFixed(2) : "";
  })();
  // PayPal Smart Buttons UI is always English; keep the amount line English too.
  const depositLabel = normalizedDeposit
    ? `Deposit due: $${normalizedDeposit} ${depositCurrency}`
    : "Deposit amount (USD)";
  const inputClassName =
    "mt-1 w-full rounded-lg border border-[#D8D2C9] px-3 py-2 outline-none transition focus:border-[#8B776A]";
  const fieldClass = (fieldId: string) =>
    `${inputClassName}${fieldErrorId === fieldId ? " border-rose-500 ring-2 ring-rose-300" : ""}`;
  const depositInputClass = `min-w-0 flex-1 rounded-lg border border-[#D8D2C9] px-3 py-2 outline-none transition focus:border-[#8B776A]${
    fieldErrorId === "order-deposit" ? " border-rose-500 ring-2 ring-rose-300" : ""
  }`;
  const messageText = typeof orderMessage === "string" ? orderMessage : "";

  const setOrderMessage = (value: unknown) => {
    if (typeof value === "string") {
      setOrderMessageState(value);
      return;
    }
    if (value && typeof value === "object" && "message" in value) {
      const nested = (value as { message: unknown }).message;
      setOrderMessageState(typeof nested === "string" ? nested : "");
      return;
    }
    setOrderMessageState(value == null || value === false ? "" : String(value));
  };

  const filteredWorks = useMemo(
    () => filterProducts(initialProducts, activeCategory, debouncedSearch),
    [activeCategory, debouncedSearch, initialProducts],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const focusOrderField = (fieldId: string) => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => {
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        el instanceof HTMLButtonElement
      ) {
        el.focus({ preventScroll: true });
      }
    }, 250);
  };

  const validateOrderForm = (): { message: string; fieldId: string } | null => {
    if (!form.productId.trim() && !form.referenceImageUrl.trim()) {
      return { message: t.pickFirst, fieldId: "order-style" };
    }
    if (!form.name.trim()) {
      return { message: t.nameRequired, fieldId: "order-name" };
    }
    if (!form.email.trim()) {
      return { message: t.contactRequired, fieldId: "order-email" };
    }
    if (form.size === "other" && !form.customSize.trim()) {
      return { message: t.otherSizeRequired, fieldId: "order-custom-size" };
    }
    if (form.filling === "other" && !form.customFilling.trim()) {
      return { message: t.otherFillingRequired, fieldId: "order-custom-filling" };
    }
    if (!form.pickupDate.trim()) {
      return { message: t.pickupRequired, fieldId: "order-pickup-date" };
    }
    if (!form.pickupTime.trim()) {
      return { message: t.pickupRequired, fieldId: "order-pickup-time" };
    }
    if (!form.acceptedPolicy) {
      return { message: t.policyRequired, fieldId: "order-policy" };
    }
    return null;
  };

  const validateDepositField = (): { message: string; fieldId: string } | null => {
    const depositRaw = form.depositAmount.trim();
    if (!depositRaw) {
      return { message: t.depositRequired, fieldId: "order-deposit" };
    }
    const depositNum = Number.parseFloat(depositRaw.replace(/[$,\s]/g, ""));
    if (!Number.isFinite(depositNum) || depositNum < 1) {
      return { message: t.depositInvalid, fieldId: "order-deposit" };
    }
    return null;
  };

  /** 校验表单；失败时写提示并定位字段。返回 true 表示通过。 */
  const runValidation = (requireDeposit = false): boolean => {
    const result = validateOrderForm() || (requireDeposit ? validateDepositField() : null);
    if (!result) {
      setFieldErrorId(null);
      return true;
    }
    setOrderMessage(result.message);
    setFieldErrorId(result.fieldId);
    focusOrderField(result.fieldId);
    return false;
  };

  useEffect(() => {
    if (pathname === "/order") {
      const params = new URLSearchParams(window.location.search);
      const productId =
        params.get("product")?.trim() ||
        (typeof window !== "undefined" ? sessionStorage.getItem(ORDER_PRODUCT_STORAGE_KEY)?.trim() || "" : "");

      if (productId) {
        const cake = initialProducts.find((item) => item.id === productId);
        if (cake) {
          setSelectedCake(cake);
          setForm((prev) => ({
            ...prev,
            productId: cake.id,
            productCategory: cake.category,
            productImageUrl: cake.imageUrl || "",
          }));
          sessionStorage.setItem(ORDER_PRODUCT_STORAGE_KEY, cake.id);
        }
      }

      const referenceImageUrl = sessionStorage.getItem(ORDER_REFERENCE_STORAGE_KEY)?.trim() || "";
      if (referenceImageUrl) {
        setForm((prev) => ({ ...prev, referenceImageUrl }));
        sessionStorage.removeItem(ORDER_REFERENCE_STORAGE_KEY);
      }
      return;
    }

    if (pathname === "/sweet/photos") {
      setActiveCategory("sweet");
      return;
    }
    const category = routeCategoryMap[pathname];
    if (category) {
      setActiveCategory(category);
    }
  }, [pathname, initialProducts]);

  useEffect(() => {
    if (!showSuccessDialog) return;
    closeDialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowSuccessDialog(false);
    };
    window.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [showSuccessDialog]);

  const backToGallery = () => {
    const targetRoute = categoryRouteMap[activeCategory] || "/";
    router.push(targetRoute, { scroll: false });
  };

  const goOrder = (cake: CakeItem) => {
    setSelectedCake(cake);
    setForm((prev) => ({
      ...prev,
      productId: cake.id,
      productCategory: cake.category,
      productImageUrl: cake.imageUrl || "",
    }));
    setOrderMessage("");
    sessionStorage.setItem(ORDER_PRODUCT_STORAGE_KEY, cake.id);
    router.push(`/order?product=${encodeURIComponent(cake.id)}`);
  };

  const onReferenceImageSelected = async (file: File) => {
    setOrderMessage("");
    if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
      setOrderMessage(t.imageTooLarge);
      return;
    }
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
      sessionStorage.setItem(ORDER_REFERENCE_STORAGE_KEY, nextUrl);
      router.push("/order");
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "图片上传失败。");
    } finally {
      setUploadingReferenceImage(false);
    }
  };

  const buildSubmitPayload = () => {
    const cleaned = form.depositAmount.replace(/[$,\s]/g, "");
    const n = Number.parseFloat(cleaned);
    const depositAmount = Number.isFinite(n) && n > 0 ? n.toFixed(2) : form.depositAmount.trim();
    return {
      ...form,
      size: form.size === "other" ? form.customSize.trim() : form.size,
      filling: form.filling === "other" ? form.customFilling.trim() : form.filling,
      depositAmount,
    };
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOrderMessage("");

    if (!runValidation()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSubmitPayload()),
      });

      const result = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(result.message || "提交失败，请稍后重试。");
      }

      setOrderMessage("");
      setFieldErrorId(null);
      setSuccessPaid(false);
      setShowSuccessDialog(true);
      setForm((prev) => ({
        ...initialForm,
        productId: prev.productId,
        productCategory: prev.productCategory,
        productImageUrl: prev.productImageUrl,
      }));
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-linear-to-b from-[#F8F7F5] via-[#F6F5F2] to-[#F3F1ED] py-6 text-zinc-800 outline-none sm:py-10">
      <div className="mx-auto max-w-6xl px-6">
        <SiteHeader language={language} onLanguageChange={setLanguage} />
        {(() => {
          const homeLabel = language === "zh" ? "首页" : language === "es" ? "Inicio" : "Home";
          if (isOrderPage) {
            return (
              <Breadcrumbs
                items={[
                  { href: "/", label: homeLabel },
                  { label: language === "zh" ? "订购" : language === "es" ? "Pedido" : "Order" },
                ]}
              />
            );
          }
          if (pathname === "/sweet/photos") {
            return (
              <Breadcrumbs
                items={[
                  { href: "/", label: homeLabel },
                  { href: "/sweet", label: categoryLabels[language].sweet },
                  {
                    label:
                      language === "zh" ? "作品图" : language === "es" ? "Fotos" : "Photos",
                  },
                ]}
              />
            );
          }
          if (activeCategory !== "all" && pathname !== "/") {
            return (
              <Breadcrumbs
                items={[
                  { href: "/", label: homeLabel },
                  { label: categoryLabels[language][activeCategory] },
                ]}
              />
            );
          }
          return null;
        })()}
        <section className="overflow-hidden rounded-2xl bg-linear-to-r from-[#E7E3DE] via-[#E3DED8] to-[#DED8D0] shadow-sm">
          <div className="p-5 sm:p-7">
            <div className="mt-1 flex items-end justify-between gap-3 sm:gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-3xl font-bold tracking-tight text-[#2F2926] sm:text-4xl">{t.title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-700 sm:text-base">{t.intro}</p>
              </div>
              <div className="relative h-[4.75rem] w-[4.75rem] shrink-0 overflow-hidden rounded-xl border border-[#D8D2C9] bg-white p-1.5 shadow-sm sm:h-32 sm:w-32 sm:p-2">
                <div className="relative h-full w-full">
                  <Image
                    src="/brand/wechat-qr-only.jpg"
                    alt={t.wechatQrAlt}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 76px, 128px"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[16/7] w-full min-h-[11rem] sm:min-h-[14rem] md:aspect-[21/8]">
            <Image
              src="/products/cupcake.webp"
              alt="Assorted bakery cakes"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </section>


        {!isOrderPage && (
          <section className="mt-8 rounded-2xl border border-[#D8D2C9] bg-white/95 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">{t.showcaseTitle}</h2>
            <p className="mt-2 text-sm text-zinc-600">{t.showcaseHint}</p>

            <div className="mt-5" role="search">
              <label htmlFor={searchInputId} className="text-sm font-semibold text-[#4C403A]">
                {t.searchLabel}
              </label>
              <input
                id={searchInputId}
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t.searchPlaceholder}
                className={`${inputClassName} max-w-md focus-ring`}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-zinc-500" aria-live="polite">
                {filteredWorks.length} result{filteredWorks.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label={t.showcaseTitle}>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setActiveCategory(category);
                    let targetRoute = categoryRouteMap[category];
                    if (category === "sweet" && pathname === "/sweet/photos") {
                      targetRoute = "/sweet";
                    }
                    if (pathname !== targetRoute) {
                      // Keep scroll position when switching Men / Women / Kids tabs
                      router.push(targetRoute, { scroll: false });
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${category === activeCategory ? "bg-[#5C4B43] text-white" : "bg-[#F1ECE7] text-[#5C4B43] hover:bg-[#E6DED4]"
                    }`}
                >
                  {categoryLabels[language][category]}
                </button>
              ))}
            </div>

            {activeCategory === "sweet" ? (
              pathname === "/sweet/photos" ? (
                <div className="mt-5">
                  <Link
                    href="/sweet"
                    className="inline-flex text-sm font-semibold text-[#5C4B43] underline decoration-[#8B776A] underline-offset-2 hover:text-[#4D3F38]"
                  >
                    {t.backToDessertMenuLink}
                  </Link>
                  <p className="mt-4 text-sm font-semibold text-[#5C4B43]">{t.sweetStylesHeading}</p>
                  <p className="mt-1 text-sm text-zinc-600">{t.sweetPhotosHint}</p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {filteredWorks.map((work) => (
                      <WorkShowcaseCard key={work.id} work={work} language={language} onSelect={goOrder} />
                    ))}
                  </div>
                  {filteredWorks.length === 0 ? (
                    <p className="mt-4 text-sm text-zinc-500">{t.sweetEmpty}</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-5">
                  <div className="mt-4">
                    <Link
                      href="/sweet/photos"
                      className="inline-flex text-sm font-semibold text-[#5C4B43] underline decoration-[#8B776A] underline-offset-2 hover:text-[#4D3F38]"
                    >
                      {t.viewDessertPhotosLink}
                    </Link>
                  </div>
                  <figure className="mx-auto mt-4 overflow-hidden rounded-xl border border-[#D8D2C9] bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 价目长图 */}
                    <img
                      src={DESSERT_MENU_PUBLIC_PATH}
                      alt="Lu Lu dessert menu: scones, box cakes, mochi, prices"
                      width={DESSERT_MENU_PIXEL_WIDTH}
                      height={DESSERT_MENU_PIXEL_HEIGHT}
                      className="block h-auto max-w-full"
                      style={{ width: `min(100%, ${DESSERT_MENU_PIXEL_WIDTH}px)` }}
                      loading={pathname === "/sweet" ? "eager" : "lazy"}
                      decoding="async"
                      fetchPriority={pathname === "/sweet" ? "high" : "low"}
                    />
                  </figure>

                </div>
              )
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {filteredWorks.map((work) => (
                  <WorkShowcaseCard key={work.id} work={work} language={language} onSelect={goOrder} />
                ))}
              </div>
            )}
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-800">{t.showcaseCustomHint}</p>
              <p className="mt-2 text-xs text-amber-900/80">{t.imageUploadHint}</p>
              <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-[#5C4B43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38]">
                {uploadingReferenceImage ? t.uploadingReferenceImage : t.uploadReferenceImage}
                <input
                  type="file"
                  accept=".heic,.heif,image/*"
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

        {isOrderPage && (
          <section className="mt-8 scroll-mt-24 rounded-2xl border border-[#D8D2C9] bg-white/95 p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold">{t.orderTitle}</h2>
                <p className="mt-2 text-sm text-zinc-600">{t.orderHint}</p>
              </div>
              <button
                type="button"
                onClick={backToGallery}
                className="rounded-full border border-[#D8D2C9] bg-white px-4 py-1.5 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] focus-ring"
              >
                {t.backToGallery}
              </button>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#D8D2C9] bg-[#F1ECE7] px-3 py-2 text-xs font-semibold text-[#5C4B43]">
                {t.orderStep1}
              </div>
              <div className="rounded-lg border border-[#D8D2C9] bg-[#F1ECE7] px-3 py-2 text-xs font-semibold text-[#5C4B43]">
                {t.orderStep2}
              </div>
              <div className="rounded-lg border border-[#D8D2C9] bg-[#F1ECE7] px-3 py-2 text-xs font-semibold text-[#5C4B43]">
                {t.orderStep3}
              </div>
              <div className="rounded-lg border border-[#D8D2C9] bg-[#F1ECE7] px-3 py-2 text-xs font-semibold text-[#5C4B43]">
                {t.orderStep4}
              </div>
            </div>
            <div id="order-style" className="mt-4 text-sm font-semibold text-zinc-700">
              {t.orderStep1}
            </div>
            {fieldErrorId === "order-style" && messageText ? (
              <p className="mt-2 rounded-lg border-2 border-rose-400 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900">
                {messageText}
              </p>
            ) : null}
            {selectedCake ? (
              <div className="mt-2 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-[#D8D2C9] bg-[#F4F1EC] p-4 text-sm text-zinc-700">
                  {t.currentCake}：<span className="font-semibold">ID: {selectedCake.id.slice(0, 8)}</span>
                  {selectedCake.imageUrl ? (
                    <div className="relative mt-3 aspect-square w-full max-w-sm overflow-hidden rounded-lg border border-rose-200 bg-white">
                      <Image
                        src={selectedCake.imageUrl}
                        alt="Selected cake image"
                        fill
                        unoptimized={selectedCake.category === "sweet"}
                        loading="lazy"
                        decoding="async"
                        className="object-cover brightness-95 contrast-105"
                        sizes="(min-width: 640px) 24rem, 100vw"
                      />
                    </div>
                  ) : null}
                </div>
                <div className="rounded-lg border border-[#D8D2C9] bg-[#F4F1EC] p-4">
                  <p>{t.referenceImage}</p>
                  <p className="mt-1 text-xs text-zinc-500">{t.imageUploadHint}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer rounded-lg border border-[#D8D2C9] bg-white px-3 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]">
                      {uploadingReferenceImage ? t.uploadingReferenceImage : t.uploadReferenceImage}
                      <input
                        type="file"
                        accept=".heic,.heif,image/*"
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
                      <Image
                        src={form.referenceImageUrl}
                        alt="Reference image"
                        fill
                        loading="lazy"
                        decoding="async"
                        className="object-cover"
                        sizes="18rem"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                {!form.referenceImageUrl.trim() && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
                    {t.needPick}
                  </div>
                )}
                <div className="mt-2 rounded-lg border border-[#D8D2C9] bg-[#F4F1EC] p-4">
                  <p>{t.referenceImage}</p>
                  <p className="mt-1 text-xs text-zinc-500">{t.imageUploadHint}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer rounded-lg border border-[#D8D2C9] bg-white px-3 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC]">
                      {uploadingReferenceImage ? t.uploadingReferenceImage : t.uploadReferenceImage}
                      <input
                        type="file"
                        accept=".heic,.heif,image/*"
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
                      <Image
                        src={form.referenceImageUrl}
                        alt="Reference image"
                        fill
                        loading="lazy"
                        decoding="async"
                        className="object-cover"
                        sizes="18rem"
                      />
                    </div>
                  ) : null}
                </div>
              </>
            )}
            <form className="mt-6 grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>

              <div className="sm:col-span-2 mt-1 text-sm font-semibold text-zinc-700">{t.orderStep2}</div>
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
                    id="order-custom-size"
                    className={fieldClass("order-custom-size")}
                    value={form.customSize}
                    onChange={(e) => {
                      setFieldErrorId(null);
                      setForm((prev) => ({ ...prev, customSize: e.target.value }));
                    }}
                    placeholder={t.placeholderOtherSize}
                    required
                  />
                  {fieldErrorId === "order-custom-size" && messageText ? (
                    <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                  ) : null}
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
                    id="order-custom-filling"
                    className={fieldClass("order-custom-filling")}
                    value={form.customFilling}
                    onChange={(e) => {
                      setFieldErrorId(null);
                      setForm((prev) => ({ ...prev, customFilling: e.target.value }));
                    }}
                    placeholder={t.placeholderOtherFilling}
                    required
                  />
                  {fieldErrorId === "order-custom-filling" && messageText ? (
                    <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                  ) : null}
                </label>
              )}

              <div className="sm:col-span-2 mt-1 text-sm font-semibold text-zinc-700">{t.orderStep3}</div>
              <label>
                {t.name}
                <input
                  id="order-name"
                  className={fieldClass("order-name")}
                  value={form.name}
                  onChange={(e) => {
                    setFieldErrorId(null);
                    setForm((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  placeholder={t.placeholderName}
                  required
                />
                {fieldErrorId === "order-name" && messageText ? (
                  <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                ) : null}
              </label>
              <label>
                {t.email}
                <input
                  id="order-email"
                  className={fieldClass("order-email")}
                  type="email"
                  value={form.email}
                  onChange={(e) => {
                    setFieldErrorId(null);
                    setForm((prev) => ({ ...prev, email: e.target.value }));
                  }}
                  placeholder={t.placeholderEmail}
                  required
                />
                {fieldErrorId === "order-email" && messageText ? (
                  <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                ) : null}
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
                  id="order-pickup-date"
                  className={fieldClass("order-pickup-date")}
                  type="date"
                  value={form.pickupDate}
                  onChange={(e) => {
                    setFieldErrorId(null);
                    setForm((prev) => ({ ...prev, pickupDate: e.target.value }));
                  }}
                  required
                />
                {fieldErrorId === "order-pickup-date" && messageText ? (
                  <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                ) : null}
              </label>
              <label>
                {t.pickupTime}
                <input
                  id="order-pickup-time"
                  className={fieldClass("order-pickup-time")}
                  type="time"
                  value={form.pickupTime}
                  onChange={(e) => {
                    setFieldErrorId(null);
                    setForm((prev) => ({ ...prev, pickupTime: e.target.value }));
                  }}
                  placeholder={t.placeholderPickupTime}
                  required
                />
                {fieldErrorId === "order-pickup-time" && messageText ? (
                  <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                ) : null}
              </label>
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
              <label className="sm:col-span-2 flex items-start gap-2 text-sm text-zinc-700">
                <input
                  id="order-policy"
                  type="checkbox"
                  className={`mt-0.5 h-4 w-4 rounded border-[#D8D2C9] text-[#5C4B43] focus:ring-[#8B776A]${
                    fieldErrorId === "order-policy" ? " ring-2 ring-rose-300" : ""
                  }`}
                  checked={form.acceptedPolicy}
                  onChange={(e) => {
                    setFieldErrorId(null);
                    setForm((prev) => ({ ...prev, acceptedPolicy: e.target.checked }));
                  }}
                  required
                />
                <span>
                  {t.policyConsent}{" "}
                  <Link href="/privacy" className="font-semibold text-[#5C4B43] underline">
                    {t.privacyLink}
                  </Link>
                  {fieldErrorId === "order-policy" && messageText ? (
                    <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                  ) : null}
                </span>
              </label>
              <div className="sm:col-span-2">
                <p className="text-sm font-semibold text-zinc-700">{t.orderStep4}</p>
                <p className="mt-1 text-xs text-zinc-500">{t.payHint}</p>
                <label className="mt-3 block max-w-md">
                  {t.payDeposit}
                  <div className="mt-1 flex items-center gap-2">
                    <span className="shrink-0 text-sm font-semibold text-[#5C4B43]">$</span>
                    <input
                      id="order-deposit"
                      className={depositInputClass}
                      type="number"
                      inputMode="decimal"
                      min={1}
                      step="0.01"
                      value={form.depositAmount}
                      onChange={(e) => {
                        setFieldErrorId(null);
                        setForm((prev) => ({ ...prev, depositAmount: e.target.value }));
                      }}
                      placeholder={t.placeholderDeposit}
                      required
                    />
                    <span className="shrink-0 text-sm text-zinc-600">{depositCurrency}</span>
                  </div>
                  {fieldErrorId === "order-deposit" && messageText ? (
                    <span className="mt-1 block text-sm font-semibold text-rose-700">{messageText}</span>
                  ) : null}
                </label>
                <div className="mt-3 w-full min-w-0">
                  {!showSuccessDialog ? (
                    <PayPalCheckout
                      draft={buildSubmitPayload()}
                      amountLabel={depositLabel}
                      disabled={submitting || uploadingReferenceImage}
                      onValidate={() => runValidation(true)}
                      onPaying={setPaying}
                      onError={(msg) => {
                        setOrderMessage(msg);
                        if (!fieldErrorId) {
                          const el = document.getElementById("order-form-message");
                          el?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                      }}
                      onSuccess={(info) => {
                        setOrderMessage("");
                        setFieldErrorId(null);
                        setPaying(false);
                        setSuccessPaid(true);
                        setShowSuccessDialog(true);
                        if (info?.emailSent === false && info.emailError) {
                          setOrderMessage(info.emailError);
                        }
                        setForm((prev) => ({
                          ...initialForm,
                          productId: prev.productId,
                          productCategory: prev.productCategory,
                          productImageUrl: prev.productImageUrl,
                        }));
                      }}
                    />
                  ) : null}
                </div>
                {paying ? <p className="mt-2 text-sm font-semibold text-[#5C4B43]">{t.paying}</p> : null}
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting || paying}
                  className="rounded-lg border border-[#D8D2C9] bg-white px-5 py-2 text-sm font-semibold text-[#5C4B43] transition hover:bg-[#F4F1EC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? t.submitting : t.submit}
                </button>
                {messageText ? (
                  <p
                    id="order-form-message"
                    className="mt-3 rounded-lg border-2 border-rose-400 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-900"
                  >
                    {messageText}
                  </p>
                ) : null}
              </div>
            </form>
          </section>
        )}
      </div>
      <SiteFooter language={language} />
      {messageText && fieldErrorId ? (
        <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
          <p className="pointer-events-auto max-w-lg rounded-xl border-2 border-rose-400 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 shadow-lg">
            {messageText}
          </p>
        </div>
      ) : null}
      {showSuccessDialog && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowSuccessDialog(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            aria-describedby={dialogDescId}
            className="w-full max-w-md rounded-2xl border border-[#D8D2C9] bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id={dialogTitleId} className="text-lg font-semibold text-zinc-900">
              {t.successDialogTitle}
            </h3>
            <p id={dialogDescId} className="mt-3 text-sm text-zinc-700">
              {successPaid ? t.successPaidBody : t.successDialogBody}
            </p>
            <button
              ref={closeDialogRef}
              type="button"
              className="mt-5 rounded-lg bg-[#5C4B43] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#4D3F38] focus-ring"
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
