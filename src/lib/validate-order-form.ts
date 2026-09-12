import { ORDER_FIELD_MAX, isValidEmailFormat } from "@/lib/order-field-limits";

export type OrderFormLike = {
  productId: string;
  referenceImageUrl: string;
  email: string;
  size: string;
  customSize: string;
  filling: string;
  customFilling: string;
  pickupDate: string;
  pickupTime: string;
  acceptedPolicy: boolean;
  name?: string;
  phone?: string;
  notes?: string;
};

export type OrderValidationMessages = {
  pickFirst: string;
  contactRequired: string;
  emailInvalid?: string;
  otherSizeRequired: string;
  otherFillingRequired: string;
  pickupRequired: string;
  policyRequired: string;
  tooLong?: string;
};

/** Client-side order form validation (mirrors HomeClient submit checks). */
export function validateOrderForm(
  form: OrderFormLike,
  messages: OrderValidationMessages,
): string | null {
  if (!form.productId.trim() && !form.referenceImageUrl.trim()) {
    return messages.pickFirst;
  }
  if (!form.email.trim()) {
    return messages.contactRequired;
  }
  if (form.email.trim().length > ORDER_FIELD_MAX.email) {
    return messages.tooLong ?? messages.contactRequired;
  }
  if (!isValidEmailFormat(form.email)) {
    return messages.emailInvalid ?? messages.contactRequired;
  }
  if (typeof form.name === "string" && form.name.trim().length > ORDER_FIELD_MAX.name) {
    return messages.tooLong ?? messages.contactRequired;
  }
  if (typeof form.phone === "string" && form.phone.trim().length > ORDER_FIELD_MAX.phone) {
    return messages.tooLong ?? messages.contactRequired;
  }
  if (form.size === "other" && !form.customSize.trim()) {
    return messages.otherSizeRequired;
  }
  if (form.customSize.trim().length > ORDER_FIELD_MAX.customSize) {
    return messages.tooLong ?? messages.otherSizeRequired;
  }
  if (form.filling === "other" && !form.customFilling.trim()) {
    return messages.otherFillingRequired;
  }
  if (form.customFilling.trim().length > ORDER_FIELD_MAX.customFilling) {
    return messages.tooLong ?? messages.otherFillingRequired;
  }
  if (typeof form.notes === "string" && form.notes.length > ORDER_FIELD_MAX.notes) {
    return messages.tooLong ?? messages.pickupRequired;
  }
  if (!form.pickupDate.trim() || !form.pickupTime.trim()) {
    return messages.pickupRequired;
  }
  if (!form.acceptedPolicy) {
    return messages.policyRequired;
  }
  return null;
}
