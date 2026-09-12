import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminSessionToken, isAdminPasswordValid } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string };
    const password = typeof body.password === "string" ? body.password : "";
    if (!isAdminPasswordValid(password)) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: getAdminSessionToken(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
