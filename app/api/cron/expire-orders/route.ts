import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkAndExpireOrder, ORDER_EXPIRATION_MINUTES } from "@/lib/orders/expiration";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Validate CRON secret if configured in production
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const cutoffTime = new Date(Date.now() - ORDER_EXPIRATION_MINUTES * 60 * 1000).toISOString();

    // Query stale awaiting_payment orders created more than 15 minutes ago
    const { data: staleOrders, error } = await supabase
      .from("orders")
      .select("id, created_at, expires_at, order_status, payment_status, paystack_reference, subtotal_pesewas")
      .eq("order_status", "awaiting_payment")
      .eq("payment_status", "unpaid")
      .lt("created_at", cutoffTime)
      .limit(50);

    if (error) {
      console.error("Cron fetch stale orders error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let expiredCount = 0;
    let reconciledCount = 0;

    for (const order of staleOrders || []) {
      const result = await checkAndExpireOrder(order.id, order);
      if (result.isExpired) expiredCount++;
      if (result.reconciledPaid) reconciledCount++;
    }

    return NextResponse.json({
      success: true,
      scanned: staleOrders?.length || 0,
      expired: expiredCount,
      reconciled: reconciledCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron expiration job error:", err);
    return NextResponse.json({ error: err.message || "Cron job failed" }, { status: 500 });
  }
}
