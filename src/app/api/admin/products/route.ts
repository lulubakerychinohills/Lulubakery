import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from "@/lib/admin-auth";
import { addProduct, categories, updateProductSortOrder, type CakeCategory } from "@/lib/products";
import { revalidateProductsCatalog } from "@/lib/revalidate-products";

export const runtime = "nodejs";

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseOptionalSortOrder(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string") {
    const t = value.trim();
    if (t === "") return undefined;
    const n = Number.parseInt(t, 10);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json({ message: "Not signed in or session expired." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const category = toText(body.category) as CakeCategory;
    const description = toText(body.description);
    const imageUrl = toText(body.imageUrl);
    const sortOrder = parseOptionalSortOrder(body.sortOrder);

    if (!categories.includes(category)) {
      return NextResponse.json({ message: "Invalid category." }, { status: 400 });
    }

    const product = await addProduct({ category, imageUrl, description, sortOrder });
    revalidateProductsCatalog();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Upload failed.";
    const message = rawMessage.includes("products_category_check")
      ? "Database category constraint is outdated. Run the SQL that adds the other category in Supabase."
      : rawMessage.includes("sort_order")
        ? "Database is missing the sort_order column. Run the sort_order migration SQL in supabase/migrations."
        : rawMessage;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json({ message: "Not signed in or session expired." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = toText(body.id);
    const sortOrder = parseOptionalSortOrder(body.sortOrder);

    if (!id) {
      return NextResponse.json({ message: "Missing product id." }, { status: 400 });
    }
    if (sortOrder === undefined) {
      return NextResponse.json({ message: "Missing a valid sortOrder." }, { status: 400 });
    }

    const product = await updateProductSortOrder(id, sortOrder);
    revalidateProductsCatalog();
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "Update failed.";
    const message = rawMessage.includes("sort_order")
      ? "Database is missing the sort_order column. Run the migration SQL in Supabase."
      : rawMessage;
    return NextResponse.json({ message }, { status: 500 });
  }
}
