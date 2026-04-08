import { createHash, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE_NAME = "cake_admin_session";

function getAdminPassword() {
  const password = process.env.ADMIN_PAGE_PASSWORD;
  if (!password) {
    throw new Error("缺少 ADMIN_PAGE_PASSWORD 环境变量。");
  }
  return password;
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) return false;
  return timingSafeEqual(aBuffer, bBuffer);
}

function getSessionTokenFromPassword(password: string) {
  return createHash("sha256").update(`${password}:cake-admin`).digest("hex");
}

export function isAdminPasswordValid(inputPassword: string) {
  const password = getAdminPassword();
  return safeEqual(inputPassword, password);
}

export function getAdminSessionToken() {
  return getSessionTokenFromPassword(getAdminPassword());
}

export function isAdminAuthenticated(cookieValue?: string) {
  if (!cookieValue) return false;
  return safeEqual(cookieValue, getAdminSessionToken());
}
