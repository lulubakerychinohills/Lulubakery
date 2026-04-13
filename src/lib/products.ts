import { getSupabaseClient } from "@/lib/supabase";

export type Language = "zh" | "en" | "es";
export type CakeCategory = "men" | "women" | "kids" | "other";

export type I18nText = Record<Language, string>;

export type CakeItem = {
  id: string;
  category: CakeCategory;
  imageUrl: string;
  descriptionI18n: I18nText;
};

export type NewCakeInput = {
  category: CakeCategory;
  imageUrl: string;
  description: string;
};

export type ProductReadResult = {
  products: CakeItem[];
  source: "supabase";
};

export const categories: CakeCategory[] = ["men", "women", "kids", "other"];

type ProductRow = {
  id: string;
  category: CakeCategory;
  image_url: string | null;  
  description: string;
  created_at?: string;
};

function mapRowToCakeItem(row: ProductRow): CakeItem {
  return {
    id: row.id,
    category: row.category,
    imageUrl: row.image_url ?? "",
    descriptionI18n: {
      zh: row.description,
      en: row.description,
      es: row.description,
    },
  };
}

export async function readProducts(): Promise<ProductReadResult> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, category, image_url, description, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return {
    products: (data as ProductRow[]).map(mapRowToCakeItem),
    source: "supabase",
  };
}

export async function addProduct(input: NewCakeInput) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert({
    category: input.category,
    image_url: input.imageUrl || null,
    description: input.description,
    })
    .select("id, category, image_url, description, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "写入产品失败。");
  }

  return mapRowToCakeItem(data as ProductRow);
}
