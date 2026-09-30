import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const riderId = searchParams.get("rider_id") || searchParams.get("riderId");

    if (!riderId) {
      return NextResponse.json({ error: "rider_id parameter is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: rawOrders, error } = await (supabase as any)
      .from("orders")
      .select(`
        id,
        subtotal_pesewas,
        delivery_fee_pesewas,
        amount_paid_pesewas,
        payment_status,
        payment_method,
        order_status,
        delivery_slot,
        created_at,
        rider_id,
        customer:customers (name, phone),
        address:addresses (address, area)
      `)
      .eq("rider_id", riderId)
      .in("order_status", ["dispatched", "out_for_delivery", "ready_for_dispatch"])
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching rider orders:", error);
      return NextResponse.json({ error: "Failed to fetch deliveries" }, { status: 500 });
    }

    const orders = (rawOrders || []).map((o: any) => {
      const custName = o.customer?.name || "Customer";
      const custPhone = o.customer?.phone || "";
      const addr = o.address?.address || o.address?.area || "Accra, Ghana";
      const totalAmount = Number(o.subtotal_pesewas || 0) + Number(o.delivery_fee_pesewas || 0);

      return {
        ...o,
        customer_name: custName,
        customer_phone: custPhone,
        delivery_address: addr,
        delivery_area: o.address?.area || "",
        total_amount: totalAmount,
        status: o.order_status,
      };
    });

    return NextResponse.json({ success: true, orders });
  } catch (err) {
    console.error("Rider orders route error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
