import { getSupabaseClient } from "@/lib/supabase";
import { normalizeSupabaseStoragePublicUrl } from "@/lib/supabase-storage-url";

export type Language = "zh" | "en" | "es";
export type CakeCategory = "men" | "women" | "kids" | "sweet" | "other";

export type I18nText = Record<Language, string>;

export type CakeItem = {
  id: string;
  category: CakeCategory;
  imageUrl: string;
  descriptionI18n: I18nText;
  /** 展示序号，越小越靠前；可与后台列表中修改。 */
  sortOrder: number;
};

export type NewCakeInput = {
  category: CakeCategory;
  imageUrl: string;
  description: string;
  /** 不传则自动取当前最大序号 + 1，排在列表末尾。 */
  sortOrder?: number;
};

export type ProductReadResult = {
  products: CakeItem[];
  source: "supabase";
};

export const categories: CakeCategory[] = ["men", "women", "kids", "sweet", "other"];

type ProductRow = {
  id: string;
  category: CakeCategory;
  image_url: string | null;
  description: string;
  created_at?: string;
  sort_order?: number | null;
};

function rowSortOrder(row: ProductRow): number {
  return typeof row.sort_order === "number" && Number.isFinite(row.sort_order) ? row.sort_order : 0;
}

function rowCreatedAtMs(row: ProductRow): number {
  if (!row.created_at) return 0;
  const t = Date.parse(row.created_at);
  return Number.isFinite(t) ? t : 0;
}

/** 甜品（sweet）整体排在非甜品之后，避免在「全部」里顶在最前；组内再按 sort_order、创建时间。 */
function categoryAllPageTier(category: CakeCategory): number {
  return category === "sweet" ? 1 : 0;
}

function sortProductRows(rows: ProductRow[]): ProductRow[] {
  return [...rows].sort((a, b) => {
    const tierA = categoryAllPageTier(a.category);
    const tierB = categoryAllPageTier(b.category);
    if (tierA !== tierB) return tierA - tierB;

    const ao = rowSortOrder(a);
    const bo = rowSortOrder(b);
    if (ao !== bo) return ao - bo;
    const ta = rowCreatedAtMs(a);
    const tb = rowCreatedAtMs(b);
    if (tb !== ta) return tb - ta;
    return a.id.localeCompare(b.id);
  });
}

function mapRowToCakeItem(row: ProductRow): CakeItem {
  const sortOrder = rowSortOrder(row);
  return {
    id: row.id,
    category: row.category,
    imageUrl: normalizeSupabaseStoragePublicUrl(row.image_url),
    descriptionI18n: {
      zh: row.description,
      en: row.description,
      es: row.description,
    },
    sortOrder,
  };
}

async function nextProductSortOrder(supabase: ReturnType<typeof getSupabaseClient>): Promise<number> {
  const { data, error } = await supabase
    .from("products")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  const max = typeof data?.sort_order === "number" && Number.isFinite(data.sort_order) ? data.sort_order : -1;
  return max + 1;
}

export async function readProducts(): Promise<ProductReadResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, category, image_url, description, created_at, sort_order");

  if (error) {
    throw new Error(error.message);
  }

  const sorted = sortProductRows((data ?? []) as ProductRow[]);

  return {
    products: sorted.map(mapRowToCakeItem),
    source: "supabase",
  };
}

export async function addProduct(input: NewCakeInput) {
  const supabase = getSupabaseClient();
  let sortOrder: number;
  if (input.sortOrder !== undefined && Number.isFinite(input.sortOrder)) {
    sortOrder = Math.trunc(input.sortOrder);
  } else {
    sortOrder = await nextProductSortOrder(supabase);
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      category: input.category,
      image_url: input.imageUrl || null,
      description: input.description,
      sort_order: sortOrder,
    })
    .select("id, category, image_url, description, created_at, sort_order")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "写入产品失败。");
  }

  return mapRowToCakeItem(data as ProductRow);
}

export async function updateProductSortOrder(id: string, sortOrder: number) {
  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error("缺少产品 ID。");
  }
  if (!Number.isFinite(sortOrder)) {
    throw new Error("序号必须是数字。");
  }
  const value = Math.trunc(sortOrder);

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .update({ sort_order: value })
    .eq("id", trimmedId)
    .select("id, category, image_url, description, created_at, sort_order")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "更新序号失败。");
  }

  return mapRowToCakeItem(data as ProductRow);
}
