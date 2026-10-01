import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  // Check Hubtel's specific signature header or authorization bearer token
  const signature = req.headers.get("x-hubtel-signature") || req.headers.get("authorization");
  const webhookSecret = process.env.HUBTEL_WEBHOOK_SECRET;

  if (webhookSecret && signature !== webhookSecret && signature !== `Bearer ${webhookSecret}`) {
    console.error("CRITICAL: Blocked unauthorized webhook attempt.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Hubtel payload structure: Data object contains clientReference, responseCode, status
    const data = body.Data || body.data || body;
    const clientReference = data.clientReference || data.client_reference || data.orderId;
    const responseCode = data.responseCode || data.response_code;
    const status = data.status;

    if (!clientReference) {
      return NextResponse.json(
        { message: "Missing clientReference in webhook payload" },
        { status: 400 }
      );
    }

    // responseCode '0000' or status 'Success' indicates confirmed payment
    if (responseCode === "0000" || status === "Success") {
      const supabase = createAdminClient();

      // 1. Fetch current order state for idempotency and late-payment reconciliation
      const { data: existingOrder, error: fetchErr } = await supabase
        .from("orders")
        .select("id, order_status, payment_status, subtotal_pesewas, created_at, expires_at")
        .eq("id", clientReference)
        .single();

      if (fetchErr || !existingOrder) {
        console.error("Hubtel webhook received for non-existent order:", clientReference);
        return NextResponse.json({ message: "Order not found" }, { status: 404 });
      }

      // 2. Idempotency Guard: avoid double-processing if already confirmed/paid
      if (existingOrder.payment_status === "paid") {
        return NextResponse.json(
          {
            message: "Order already confirmed (idempotent)",
            orderId: clientReference,
            status: existingOrder.order_status,
          },
          { status: 200 }
        );
      }

      // 3. Late Payment Reconciliation: check if payment arrived after the 15-minute expiration
      const wasCancelledOrExpired = existingOrder.order_status === "cancelled";

      const updateData: any = {
        order_status: "confirmed",
        payment_status: "paid",
        amount_paid_pesewas: existingOrder.subtotal_pesewas,
      };

      if (wasCancelledOrExpired) {
        updateData.manual_review_required = true;
        updateData.cancellation_reason =
          "Late payment received after 15m expiration — flagged for chef review";
      }

      const { data: updatedOrder, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", clientReference)
        .select("id, order_status, payment_status, manual_review_required")
        .single();

      if (error) {
        console.error("Failed to update order status from Hubtel webhook:", error);
        throw error;
      }

      return NextResponse.json(
        {
          message: wasCancelledOrExpired
            ? "Order reconciled with late payment flag"
            : "Order confirmed successfully",
          orderId: clientReference,
          status: updatedOrder?.order_status,
          lateReconciled: wasCancelledOrExpired,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Payment not successful or pending", status },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Hubtel Webhook Error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
