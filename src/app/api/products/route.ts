import { NextResponse } from "next/server";
import { readProducts } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await readProducts();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ message: "读取产品失败。" }, { status: 500 });
  }
}
