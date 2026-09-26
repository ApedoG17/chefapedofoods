import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/webhooks/paystack
 *
 * THE authoritative rule this route enforces (docs/ARCHITECTURE.md, docs/SECURITY.md, docs/AGENTS.md):
 *   An order is marked `confirmed` ONLY after this webhook verifies a
 *   successful payment. Never mark an order confirmed because the
 *   browser/client says payment succeeded.
 *
 * Steps:
 *   1. Verify `x-paystack-signature` using HMAC-SHA512 with timingSafeEqual.
 *   2. Filter for `event === "charge.success"`.
 *   3. Validate currency is 'GHS' and amount equals order.subtotal_pesewas.
 *   4. Check idempotency: if already paid, return 200 immediately.
 *   5. Reserve capacity atomically via increment_kitchen_orders() RPC.
 *   6. Update order: payment_status = 'paid', order_status = 'confirmed'.
 */
export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      console.error("Paystack webhook error: PAYSTACK_SECRET_KEY is not defined");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // 1. Constant-time signature verification
    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Parse payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    if (!event || !data) {
      return NextResponse.json({ error: "Invalid payload format" }, { status: 400 });
    }

    // Handle charge.success
    if (event === "charge.success") {
      const reference = data.reference;
      const amountPesewas = data.amount;
      const currency = data.currency;

      if (!reference) {
        return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
      }

      // Currency must be GHS
      if (currency !== "GHS") {
        console.error(`Paystack webhook error: unexpected currency "${currency}"`);
        return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
      }

      const adminSupabase = createAdminClient();

      // Look up order by pre-persisted paystack reference
      const { data: order, error: orderErr } = await adminSupabase
        .from("orders")
        .select("id, subtotal_pesewas, payment_status, order_status")
        .eq("paystack_reference", reference)
        .single();

      if (orderErr || !order) {
        console.error(`Paystack webhook: order not found for reference ${reference}`);
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      // 3. Idempotency check: if order is already paid, exit cleanly
      if (order.payment_status === "paid") {
        return NextResponse.json({ received: true, alreadyProcessed: true });
      }

      // 4. Amount validation: paid amount must match food subtotal in pesewas
      // (Delivery fee is paid to the rider on arrival, never charged through Paystack)
      if (amountPesewas !== order.subtotal_pesewas) {
        console.error(
          `Security Alert: Amount mismatch for order ${order.id}. Expected ${order.subtotal_pesewas}, received ${amountPesewas}`
        );
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      // 5. Atomic Daily Capacity Reservation
      const { data: capacityReserved, error: capacityError } = await adminSupabase.rpc(
        "increment_kitchen_orders"
      );

      if (capacityError) {
        console.error("Error executing increment_kitchen_orders RPC:", capacityError);
      }

      if (capacityReserved) {
        // Successful reservation: confirm order
        const { error: updateErr } = await adminSupabase
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "confirmed",
            amount_paid_pesewas: amountPesewas,
          })
          .eq("id", order.id);

        if (updateErr) {
          console.error(`Failed to update order ${order.id} status to confirmed:`, updateErr);
          return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
        }
      } else {
        // Capacity was exhausted while payment was in-flight (rare edge case)
        // Mark order cancelled and flag for refund
        console.warn(`Order ${order.id} paid after capacity filled. Flagging for refund.`);
        await adminSupabase
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "cancelled",
            cancellation_reason: "Daily capacity exceeded before payment arrived",
            refund_status: "pending",
            amount_paid_pesewas: amountPesewas,
          })
          .eq("id", order.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook unhandled exception:", error);
    return NextResponse.json(
      { error: "Webhook internal processing error" },
      { status: 500 }
    );
  }
}
