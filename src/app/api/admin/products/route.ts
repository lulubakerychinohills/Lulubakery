import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isAdminAuthenticated } from "@/lib/admin-auth";
import { addProduct, categories, type CakeCategory } from "@/lib/products";

export const runtime = "nodejs";

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!isAdminAuthenticated(token)) {
      return NextResponse.json({ message: "未登录或会话失效。" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const category = toText(body.category) as CakeCategory;
    const title = toText(body.title);
    const description = toText(body.description);
    const imageUrl = toText(body.imageUrl);

    if (!categories.includes(category)) {
      return NextResponse.json({ message: "分类无效。" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ message: "请填写英文标题。" }, { status: 400 });
    }

    const product = await addProduct({ category, imageUrl, title, description });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    const rawMessage = error instanceof Error ? error.message : "上传失败。";
    const message = rawMessage.includes("products_category_check")
      ? "数据库分类约束尚未更新，请先在 Supabase 执行新增 other 分类的 SQL。"
      : rawMessage;
    return NextResponse.json({ message }, { status: 500 });
  }
}
