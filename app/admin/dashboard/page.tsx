import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatGHS } from "@/lib/pricing";

export const revalidate = 0; // Always fresh admin operational data

export default async function AdminDashboardPage() {
  const adminSupabase = createAdminClient();

  // Fetch kitchen settings
  const { data: settings } = await adminSupabase
    .from("kitchen_settings")
    .select("*")
    .limit(1)
    .single();

  // Fetch today's orders
  const { data: orders } = await adminSupabase
    .from("orders")
    .select(`
      id,
      order_status,
      payment_status,
      paystack_reference,
      subtotal_pesewas,
      delivery_fee_pesewas,
      delivery_slot,
      created_at,
      customer:customers (
        name,
        phone
      ),
      address:addresses (
        area
      ),
      items:order_items (
        quantity,
        included_protein_package_name,
        meal:meals (name),
        size:meal_sizes (size)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  const allOrders = orders || [];
  const isOpen = settings?.open ?? true;
  const capacity = settings?.daily_capacity ?? 12;
  const ordersToday = settings?.orders_today ?? allOrders.filter((o) => o.order_status !== "cancelled").length;

  const confirmedCount = allOrders.filter((o) => o.order_status === "confirmed").length;
  const preparingCount = allOrders.filter((o) => o.order_status === "preparing").length;
  const readyCount = allOrders.filter((o) => o.order_status === "ready_for_dispatch").length;
  const dispatchedCount = allOrders.filter((o) => o.order_status === "dispatched").length;

  return (
    <main className="space-y-4">
      <div>
        <p className="text-[10px] tracking-[0.14em] uppercase text-gold font-medium mb-1">
          Today
        </p>
        <h1 className="font-serif font-semibold text-[24px] text-ink mb-1">
          Kitchen Dashboard
        </h1>
        <p className="text-[12.5px] text-ink-dim">
          Real-time order pipeline and capacity overview.
        </p>
      </div>

      {/* Kitchen Status Card */}
      <Card className="flex justify-between items-center py-3.5">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full ${isOpen ? "bg-ok animate-pulse" : "bg-warn"}`} />
          <span className="font-serif font-medium text-[15px] text-ink">
            Kitchen Status
          </span>
        </div>
        <Link href="/admin/kitchen">
          <Badge variant={isOpen ? "ok" : "warn"}>
            {isOpen ? "● OPEN" : "● CLOSED"}
          </Badge>
        </Link>
      </Card>

      {/* Stat Grid (3 columns) */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{allOrders.length}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Total Orders</span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{confirmedCount}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Confirmed</span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{preparingCount}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Preparing</span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{readyCount}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Ready</span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{dispatchedCount}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Dispatched</span>
        </div>
        <div className="bg-surface border border-line rounded-xl p-3 text-center">
          <b className="block font-serif text-[20px] text-gold">{ordersToday}/{capacity}</b>
          <span className="text-[10px] text-ink-dim uppercase tracking-wider">Capacity</span>
        </div>
      </div>

      {/* Incoming Orders Feed */}
      <div>
        <div className="flex justify-between items-center mb-2 pt-2">
          <span className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold">
            Recent Orders
          </span>
          <Link href="/admin/orders" className="text-[11.5px] text-gold hover:underline">
            View All ({allOrders.length}) →
          </Link>
        </div>

        {allOrders.length === 0 ? (
          <Card className="py-8 text-center text-ink-dim text-[13px]">
            No orders placed yet today.
          </Card>
        ) : (
          <div className="space-y-2">
            {allOrders.map((order) => {
              const ref = order.paystack_reference || order.id.substring(0, 8).toUpperCase();
              const customerName = (order.customer as any)?.name || "Guest";
              const area = (order.address as any)?.area || "Accra";
              const firstItem = (order.items as any[])?.[0];
              const mealSummary = firstItem
                ? `${firstItem.meal?.name || "Meal"} (${firstItem.size?.size})`
                : "Meal";

              return (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="block bg-surface border border-line hover:border-gold/60 rounded-xl p-3.5 transition-colors"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-[13px] text-ink">
                      #{ref} · <span className="font-normal text-ink-dim">{customerName}</span>
                    </span>
                    <span className="text-gold font-semibold text-[13px]">
                      {formatGHS(order.subtotal_pesewas)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11.5px] text-ink-dim">
                    <span>{mealSummary} · Slot: {order.delivery_slot} ({area})</span>
                    <Badge
                      variant={
                        order.order_status === "cancelled"
                          ? "warn"
                          : order.order_status === "delivered" || order.order_status === "confirmed"
                          ? "ok"
                          : "neutral"
                      }
                    >
                      {order.order_status}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
