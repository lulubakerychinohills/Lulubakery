import { describe, expect, it } from "vitest";
import { validateOrderForm } from "@/lib/validate-order-form";

const messages = {
  pickFirst: "pick",
  contactRequired: "email",
  otherSizeRequired: "size",
  otherFillingRequired: "filling",
  pickupRequired: "pickup",
  policyRequired: "policy",
};

const validForm = {
  productId: "p1",
  referenceImageUrl: "",
  email: "a@b.com",
  size: "6",
  customSize: "",
  filling: "mango",
  customFilling: "",
  pickupDate: "2026-05-01",
  pickupTime: "14:00",
  acceptedPolicy: true,
};

describe("validateOrderForm", () => {
  it("accepts a complete form", () => {
    expect(validateOrderForm(validForm, messages)).toBeNull();
  });

  it("requires product or reference image", () => {
    expect(
      validateOrderForm({ ...validForm, productId: "", referenceImageUrl: "" }, messages),
    ).toBe("pick");
  });

  it("requires email", () => {
    expect(validateOrderForm({ ...validForm, email: "  " }, messages)).toBe("email");
  });

  it("requires custom size when size is other", () => {
    expect(
      validateOrderForm({ ...validForm, size: "other", customSize: "" }, messages),
    ).toBe("size");
  });

  it("requires privacy consent", () => {
    expect(validateOrderForm({ ...validForm, acceptedPolicy: false }, messages)).toBe("policy");
  });

  it("rejects invalid email format", () => {
    expect(
      validateOrderForm(
        { ...validForm, email: "not-an-email" },
        { ...messages, emailInvalid: "bad-email" },
      ),
    ).toBe("bad-email");
  });

  it("rejects notes that exceed max length", () => {
    expect(
      validateOrderForm(
        { ...validForm, notes: "x".repeat(1001) },
        { ...messages, tooLong: "too-long" },
      ),
    ).toBe("too-long");
  });
});
