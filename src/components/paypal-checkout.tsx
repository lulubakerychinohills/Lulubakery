"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useEffect, useMemo, useRef, useState } from "react";

export type PayPalOrderDraft = {
  name: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  referenceImageUrl: string;
  productCategory: string;
  productId: string;
  productImageUrl: string;
  size: string;
  filling: string;
  notes: string;
  acceptedPolicy: boolean;
  depositAmount: string;
};

type Props = {
  draft: PayPalOrderDraft;
  amountLabel: string;
  disabled?: boolean;
  /** 返回 true 表示校验通过；失败时由父组件自行设置提示文案 */
  onValidate: () => boolean;
  onPaying: (busy: boolean) => void;
  onError: (message: string) => void;
  onSuccess: (info?: { emailSent?: boolean; emailError?: string }) => void;
};

function useIsNarrow(breakpointPx = 480) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpointPx]);
  return narrow;
}

export default function PayPalCheckout({
  draft,
  amountLabel,
  disabled = false,
  onValidate,
  onPaying,
  onError,
  onSuccess,
}: Props) {
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const onValidateRef = useRef(onValidate);
  onValidateRef.current = onValidate;
  const onPayingRef = useRef(onPaying);
  onPayingRef.current = onPaying;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  const blockedByValidationRef = useRef(false);
  const isNarrow = useIsNarrow(480);

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() || "";
  const currency = (process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD").trim().toUpperCase() || "USD";

  const options = useMemo(
    () => ({
      clientId,
      currency,
      intent: "capture" as const,
      // Force English UI for Smart Payment Buttons (labels / powered-by)
      locale: "en_US",
    }),
    [clientId, currency],
  );

  const buttonStyle = useMemo(
    () => ({
      layout: "vertical" as const,
      color: "gold" as const,
      shape: "rect" as const,
      label: "paypal" as const,
      tagline: false,
      height: isNarrow ? 42 : 48,
    }),
    [isNarrow],
  );

  if (!clientId) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        PayPal is not configured yet. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID to enable checkout.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-[#D8D2C9] bg-[#F4F1EC] p-3 sm:p-4">
      <p className="text-sm font-semibold leading-snug text-[#4C403A]">{amountLabel}</p>
      <div
        className={`mx-auto mt-3 w-full max-w-[320px] sm:max-w-[360px] md:max-w-[400px] ${
          disabled ? "pointer-events-none opacity-50" : ""
        }`}
      >
        <PayPalScriptProvider options={options}>
          <PayPalButtons
            style={buttonStyle}
            disabled={disabled}
            forceReRender={[amountLabel, draft.depositAmount, buttonStyle.height]}
            onClick={(_data, actions) => {
              blockedByValidationRef.current = false;
              onPayingRef.current(false);
              const ok = onValidateRef.current();
              if (!ok) {
                blockedByValidationRef.current = true;
                return actions.reject();
              }
              onErrorRef.current("");
              return actions.resolve();
            }}
            createOrder={async () => {
              try {
                const ok = onValidateRef.current();
                if (!ok) {
                  blockedByValidationRef.current = true;
                  throw new Error("FORM_INVALID");
                }
                const response = await fetch("/api/paypal/create-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draftRef.current),
                });
                const result = (await response.json()) as { orderId?: string; message?: string };
                if (!response.ok || !result.orderId) {
                  const failMessage = result.message || "Unable to start PayPal checkout.";
                  onErrorRef.current(failMessage);
                  throw new Error(failMessage);
                }
                return result.orderId;
              } catch (error) {
                onPayingRef.current(false);
                if (!blockedByValidationRef.current) {
                  const failMessage = error instanceof Error ? error.message : "Unable to start PayPal checkout.";
                  if (failMessage !== "FORM_INVALID") {
                    onErrorRef.current(failMessage);
                  }
                }
                throw error instanceof Error ? error : new Error("Unable to start PayPal checkout.");
              }
            }}
            onApprove={async (data) => {
              onPayingRef.current(true);
              try {
                const response = await fetch("/api/paypal/capture-order", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...draftRef.current,
                    paypalOrderId: data.orderID,
                  }),
                });
                const result = (await response.json()) as {
                  ok?: boolean;
                  message?: string;
                  emailSent?: boolean;
                  emailError?: string;
                };
                if (!response.ok || !result.ok) {
                  throw new Error(result.message || "Payment capture failed.");
                }
                onSuccessRef.current({ emailSent: result.emailSent, emailError: result.emailError });
              } catch (error) {
                onErrorRef.current(error instanceof Error ? error.message : "Payment failed.");
              } finally {
                onPayingRef.current(false);
              }
            }}
            onCancel={() => {
              onPayingRef.current(false);
              if (!blockedByValidationRef.current) {
                onErrorRef.current("Payment was cancelled.");
              }
            }}
            onError={() => {
              onPayingRef.current(false);
              if (!blockedByValidationRef.current) {
                onErrorRef.current("PayPal checkout failed. Please try again.");
              }
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}
