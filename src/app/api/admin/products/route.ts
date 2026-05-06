import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from "@/lib/admin-auth";
import { addProduct, categories, updateProductSortOrder, type CakeCategory } from "@/lib/products";

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
      return NextResponse.json({ message: "未登录或会话失效。" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const category = toText(body.category) as CakeCategory;
    const description = toText(body.description);
    const imageUrl = toText(body.imageUrl);
    const sortOrder = parseOptionalSortOrder(body.sortOrder);

    if (!categories.includes(category)) {
      return NextResponse.json({ message: "分类无效。" }, { status: 400 });
    }

    const product = await addProduct({ category, imageUrl, description, sortOrder });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "上传失败。";
    const message = rawMessage.includes("products_category_check")
      ? "数据库分类约束尚未更新，请先在 Supabase 执行新增 other 分类的 SQL。"
      : rawMessage.includes("sort_order")
        ? "数据库缺少 sort_order 列，请在 Supabase 执行 supabase/migrations 中的 sort_order 迁移 SQL。"
        : rawMessage;
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json({ message: "未登录或会话失效。" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const id = toText(body.id);
    const sortOrder = parseOptionalSortOrder(body.sortOrder);

    if (!id) {
      return NextResponse.json({ message: "缺少产品 id。" }, { status: 400 });
    }
    if (sortOrder === undefined) {
      return NextResponse.json({ message: "缺少有效序号 sortOrder。" }, { status: 400 });
    }

    const product = await updateProductSortOrder(id, sortOrder);
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "更新失败。";
    const message = rawMessage.includes("sort_order")
      ? "数据库缺少 sort_order 列，请在 Supabase 执行迁移 SQL。"
      : rawMessage;
    return NextResponse.json({ message }, { status: 500 });
  }
}
