type PayPalTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  message?: string;
  details?: Array<{ description?: string }>;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{ id?: string; status?: string; amount?: { value?: string; currency_code?: string } }>;
    };
  }>;
};

function getPayPalConfig() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const mode = (process.env.PAYPAL_MODE || "sandbox").trim().toLowerCase();
  const baseUrl = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

  if (!clientId || !clientSecret) {
    throw new Error("缺少 PayPal 配置，请设置 NEXT_PUBLIC_PAYPAL_CLIENT_ID 与 PAYPAL_CLIENT_SECRET。");
  }

  return { clientId, clientSecret, baseUrl };
}

async function getAccessToken() {
  const { clientId, clientSecret, baseUrl } = getPayPalConfig();
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = (await response.json()) as PayPalTokenResponse;
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "PayPal 授权失败。");
  }
  return { token: data.access_token, baseUrl };
}

export async function createPayPalOrder(amount: string, currency: string, description: string) {
  const { token, baseUrl } = await getAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          description,
          amount: {
            currency_code: currency,
            value: amount,
          },
        },
      ],
    }),
  });
  const data = (await response.json()) as PayPalOrderResponse;
  if (!response.ok || !data.id) {
    const detail = data.details?.[0]?.description || data.message || "创建 PayPal 订单失败。";
    throw new Error(detail);
  }
  return data.id;
}

export async function capturePayPalOrder(orderId: string) {
  const { token, baseUrl } = await getAccessToken();
  const response = await fetch(`${baseUrl}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  const data = (await response.json()) as PayPalOrderResponse;
  if (!response.ok) {
    const detail = data.details?.[0]?.description || data.message || "PayPal 扣款失败。";
    throw new Error(detail);
  }

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture?.id || capture.status !== "COMPLETED") {
    throw new Error("PayPal 支付未完成。");
  }

  return {
    captureId: capture.id,
    amount: capture.amount?.value || "",
    currency: capture.amount?.currency_code || "",
    status: capture.status,
  };
}

export function isPayPalConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() && process.env.PAYPAL_CLIENT_SECRET?.trim());
}
