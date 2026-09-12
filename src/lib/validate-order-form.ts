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
};

export type OrderValidationMessages = {
  pickFirst: string;
  contactRequired: string;
  otherSizeRequired: string;
  otherFillingRequired: string;
  pickupRequired: string;
  policyRequired: string;
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
  if (form.size === "other" && !form.customSize.trim()) {
    return messages.otherSizeRequired;
  }
  if (form.filling === "other" && !form.customFilling.trim()) {
    return messages.otherFillingRequired;
  }
  if (!form.pickupDate.trim() || !form.pickupTime.trim()) {
    return messages.pickupRequired;
  }
  if (!form.acceptedPolicy) {
    return messages.policyRequired;
  }
  return null;
}
