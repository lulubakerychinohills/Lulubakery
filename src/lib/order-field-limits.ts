/** Shared max lengths for order form fields (HTML maxLength + server checks). */
export const ORDER_FIELD_MAX = {
  name: 80,
  email: 254,
  phone: 30,
  customSize: 80,
  customFilling: 80,
  notes: 1000,
} as const;

/** Basic email shape check (not a full RFC validator). */
export function isValidEmailFormat(email: string): boolean {
  const value = email.trim();
  if (!value || value.length > ORDER_FIELD_MAX.email) return false;
  // Requires local@domain.tld with no spaces
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
