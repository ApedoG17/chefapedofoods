import { createAdminClient } from "@/lib/supabase/admin";

export const ORDER_EXPIRATION_MINUTES = 15;

/**
 * Calculates the expiration timestamp for an order (default: 15 minutes after creation).
 */
export function getOrderExpirationDate(createdAt: Date | string = new Date()): Date {
  const base = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  return new Date(base.getTime() + ORDER_EXPIRATION_MINUTES * 60 * 1000);
}

/**
 * Checks whether an order is past its expiration deadline.
 */
export function isOrderExpired(
  order: { created_at: string; expires_at?: string | null },
  now: Date = new Date()
): boolean {
  const expiryTime = order.expires_at
    ? new Date(order.expires_at).getTime()
    : new Date(order.created_at).getTime() + ORDER_EXPIRATION_MINUTES * 60 * 1000;

  return now.getTime() > expiryTime;
}

/**
 * Query Hubtel API to check transaction status before expiring the order,
 * ensuring that an in-flight payment that succeeded right before expiration is never cancelled.
 */
export async function checkHubtelTransactionStatus(
  clientReference: string
): Promise<{ isPaid: boolean; transactionId?: string; rawData?: any }> {
  const clientId = process.env.HUBTEL_CLIENT_ID;
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET;
  const merchantAccountNumber = process.env.HUBTEL_MERCHANT_ID;

  if (!clientId || !clientSecret || !merchantAccountNumber || clientId.includes("placeholder")) {
    // If running in development/test with placeholder credentials, no remote check
    return { isPaid: false };
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const url = `https://api-merchant.hubtel.com/v1/merchantaccount/merchants/${merchantAccountNumber}/transactions/status?clientReference=${encodeURIComponent(
      clientReference
    )}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isPaid: false };
    }

    const data = await response.json();
    const status = data?.Data?.Status || data?.status || data?.Data?.TransactionStatus;
    const responseCode = data?.ResponseCode || data?.responseCode;

    const isPaid =
      responseCode === "0000" ||
      status === "Success" ||
      status === "Paid" ||
      status === "Completed";

    return {
      isPaid,
      transactionId: data?.Data?.TransactionId || data?.Data?.InvoiceId,
      rawData: data,
    };
  } catch (err) {
    console.warn(`Could not verify Hubtel status for order ${clientReference}:`, err);
    return { isPaid: false };
  }
}

/**
 * Lazily evaluates an order: if past 15 minutes and still awaiting_payment,
 * verifies with Hubtel and marks it cancelled if unpaid, or confirms if paid.
 */
export async function checkAndExpireOrder(
  orderId: string,
  existingOrder?: any
): Promise<{
  isExpired: boolean;
  reconciledPaid: boolean;
  order: any;
}> {
  const supabase = createAdminClient();

  let order = existingOrder;
  if (!order) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error || !data) {
      return { isExpired: false, reconciledPaid: false, order: null };
    }
    order = data;
  }

  // Only evaluate orders currently awaiting payment
  if (order.order_status !== "awaiting_payment" || order.payment_status === "paid") {
    return { isExpired: false, reconciledPaid: false, order };
  }

  // Check if past 15-minute expiration deadline
  if (!isOrderExpired(order)) {
    return { isExpired: false, reconciledPaid: false, order };
  }

  // 1. Verify with Hubtel before cancelling
  const hubtelStatus = await checkHubtelTransactionStatus(order.paystack_reference || order.id);

  if (hubtelStatus.isPaid) {
    // Payment actually succeeded! Reconcile as paid
    const { data: updated } = await supabase
      .from("orders")
      .update({
        order_status: "confirmed",
        payment_status: "paid",
        amount_paid_pesewas: order.subtotal_pesewas,
      } as any)
      .eq("id", order.id)
      .select("*")
      .single();

    return {
      isExpired: false,
      reconciledPaid: true,
      order: updated || order,
    };
  }

  // 2. Mark order as cancelled due to expired payment window
  const nowIso = new Date().toISOString();
  const { data: cancelledOrder } = await supabase
    .from("orders")
    .update({
      order_status: "cancelled",
      payment_status: "failed",
      cancellation_reason: "Payment window expired after 15 minutes",
      cancelled_at: nowIso,
    } as any)
    .eq("id", order.id)
    .select("*")
    .single();

  return {
    isExpired: true,
    reconciledPaid: false,
    order: cancelledOrder || {
      ...order,
      order_status: "cancelled",
      payment_status: "failed",
      cancellation_reason: "Payment window expired after 15 minutes",
      cancelled_at: nowIso,
    },
  };
}
