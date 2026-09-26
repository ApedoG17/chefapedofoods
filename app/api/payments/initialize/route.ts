import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface InitializePaymentBody {
  orderId: string;
  email?: string;
}

/**
 * POST /api/payments/initialize
 *
 * Initializes a Paystack checkout transaction for the food subtotal.
 * Never charges the delivery fee (Rule 2: paid separately to rider).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitializePaymentBody;
    const { orderId, email } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Fetch order details
    const { data: order, error: orderErr } = await adminSupabase
      .from("orders")
      .select("id, subtotal_pesewas, payment_status, paystack_reference, customer_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        { error: "Order is already paid" },
        { status: 400 }
      );
    }

    // Ensure reference is persisted
    let reference = order.paystack_reference;
    if (!reference) {
      reference = `CAF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      await adminSupabase
        .from("orders")
        .update({ paystack_reference: reference })
        .eq("id", order.id);
    }

    // Fetch customer details for metadata
    const { data: customer } = await adminSupabase
      .from("customers")
      .select("name, phone")
      .eq("id", order.customer_id)
      .single();

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      // In development if Paystack keys aren't set yet, return mock URL for testing
      return NextResponse.json({
        authorizationUrl: `/order/${order.id}?reference=${reference}&mock=true&new=true`,
        reference,
        isMock: true,
      });
    }

    // Call Paystack Transaction Initialize API
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email || "customer@chefapedofoods.com",
          amount: order.subtotal_pesewas, // In pesewas
          currency: "GHS",
          reference,
          metadata: {
            order_id: order.id,
            customer_name: customer?.name,
            customer_phone: customer?.phone,
          },
          channels: ["mobile_money", "card"],
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok || !paystackData.status) {
      console.error("Paystack initialize error:", paystackData);
      return NextResponse.json(
        { error: paystackData.message || "Failed to initialize payment with Paystack" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference,
      accessCode: paystackData.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while initializing payment" },
      { status: 500 }
    );
  }
}
