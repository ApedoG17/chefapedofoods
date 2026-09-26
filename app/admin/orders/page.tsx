import React from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatGHS } from "@/lib/pricing";

export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ status?: string }> | { status?: string };
}

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready_for_dispatch", label: "Ready" },
  { id: "dispatched", label: "Dispatched" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage(props: PageProps) {
  const resolvedSearchParams = await Promise.resolve(props.searchParams);
  const activeStatus = resolvedSearchParams.status || "all";

  const adminSupabase = createAdminClient();

  let query = adminSupabase
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
        address,
        area
      ),
      items:order_items (
        quantity,
        included_protein_package_name,
        meal:meals (name),
        size:meal_sizes (size)
      )
    `)
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("order_status", activeStatus);
  }

  const { data: orders } = await query;
  const orderList = orders || [];

  return (
    <main className="space-y-4">
      <div>
        <p className="text-[10px] tracking-[0.14em] uppercase text-gold font-medium mb-1">
          Kitchen Pipeline
        </p>
        <h1 className="font-serif font-semibold text-[24px] text-ink mb-1">
          Order Management
        </h1>
        <p className="text-[12.5px] text-ink-dim">
          Filter and advance orders through the preparation and delivery lifecycle.
        </p>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.id}
            href={`/admin/orders?status=${f.id}`}
            className={`px-3 py-1 text-[11px] rounded-full whitespace-nowrap border transition-colors ${
              activeStatus === f.id
                ? "border-gold text-gold bg-gold/10 font-semibold"
                : "border-line text-ink-dim hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Orders List */}
      {orderList.length === 0 ? (
        <Card className="py-12 text-center text-ink-dim text-[13px]">
          No orders found for status: <strong className="text-gold">{activeStatus}</strong>
        </Card>
      ) : (
        <div className="space-y-3">
          {orderList.map((order) => {
            const ref = order.paystack_reference || order.id.substring(0, 8).toUpperCase();
            const customerName = (order.customer as any)?.name || "Guest";
            const customerPhone = (order.customer as any)?.phone || "";
            const area = (order.address as any)?.area || "Accra";

            const itemsSummary = ((order.items as any[]) || [])
              .map((i) => `${i.quantity}x ${i.meal?.name || "Meal"} (${i.size?.size}, ${i.included_protein_package_name})`)
              .join(", ");

            return (
              <Card key={order.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-serif font-semibold text-[15px] text-ink">
                      #{ref}
                    </span>
                    <div className="text-[12px] text-ink font-medium mt-0.5">
                      {customerName} · {customerPhone}
                    </div>
                  </div>
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

                <div className="text-[12px] text-ink-dim leading-relaxed">
                  {itemsSummary}
                </div>

                <div className="text-[11.5px] text-ink-dim flex justify-between items-center pt-2 border-t border-line/60">
                  <span>Slot: {order.delivery_slot} · {area}</span>
                  <span className="text-gold font-semibold">
                    Paid: {formatGHS(order.subtotal_pesewas)}
                  </span>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[11.5px] text-gold border border-gold hover:bg-gold/10 px-3 py-1 rounded-full font-medium transition-colors"
                  >
                    Manage Order →
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
