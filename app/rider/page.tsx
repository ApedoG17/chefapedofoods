"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Phone, MapPin, CheckCircle, Bike, LogOut, Navigation, RefreshCw } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RiderIdentity {
  id: string;
  full_name: string;
  phone_number?: string;
}

interface RiderOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  delivery_area?: string;
  delivery_slot?: string;
  total_amount: number;
  payment_status: string;
  status: string;
  order_status?: string;
  created_at: string;
}

export default function RiderDashboard() {
  const [rider, setRider] = useState<RiderIdentity | null>(null);
  const [orders, setOrders] = useState<RiderOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const fetchActiveDeliveries = useCallback(async (riderId: string) => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/rider/orders?rider_id=${encodeURIComponent(riderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
        }
      } else {
        // Fallback direct query in case API route is unreachable
        const { data: rawData } = await supabase
          .from("orders")
          .select(`
            id,
            subtotal_pesewas,
            delivery_fee_pesewas,
            payment_status,
            order_status,
            customer:customers (name, phone),
            address:addresses (address, area)
          `)
          .eq("rider_id", riderId)
          .in("order_status", ["dispatched", "out_for_delivery"])
          .order("created_at", { ascending: true });

        if (rawData) {
          const mapped: RiderOrder[] = rawData.map((o: any) => ({
            id: o.id,
            customer_name: o.customer?.name || "Customer",
            customer_phone: o.customer?.phone || "",
            delivery_address: o.address?.address || o.address?.area || "Accra",
            delivery_area: o.address?.area || "",
            total_amount: Number(o.subtotal_pesewas || 0) + Number(o.delivery_fee_pesewas || 0),
            payment_status: o.payment_status,
            status: o.order_status,
            created_at: o.created_at || new Date().toISOString(),
          }));
          setOrders(mapped);
        }
      }
    } catch (err) {
      console.error("Failed to fetch active deliveries:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("chef_apedo_rider");
    if (!stored) {
      router.push("/rider/login");
      return;
    }
    const parsedRider: RiderIdentity = JSON.parse(stored);
    setRider(parsedRider);
    fetchActiveDeliveries(parsedRider.id);

    // Real-time listener for new assignments & status updates
    const channel = supabase
      .channel("rider-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `rider_id=eq.${parsedRider.id}`,
        },
        () => fetchActiveDeliveries(parsedRider.id)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, fetchActiveDeliveries]);

  const markDelivered = async (orderId: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (res.ok && rider) {
        fetchActiveDeliveries(rider.id);
      }
    } catch (err) {
      console.error("Failed to mark order delivered:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("chef_apedo_rider");
    router.push("/rider/login");
  };

  if (!rider) return null;

  return (
    <div className="min-h-screen bg-[#0D0D0D] p-4 sm:p-6 pb-24 text-white max-w-lg mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-6 pt-2 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-brand-yellow mb-0.5">
            <Bike className="w-4 h-4 stroke-[2.5]" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              Logistics Portal
            </span>
          </div>
          <h1 className="text-xl font-black text-white uppercase font-display">
            {rider.full_name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow px-3 py-1 rounded-full text-xs font-black">
            {orders.length} ACTIVE
          </div>

          <button
            onClick={() => rider && fetchActiveDeliveries(rider.id)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-white/5 hover:bg-brand-red/20 text-white/50 hover:text-brand-red transition-colors"
            title="Log Out"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-16 bg-[#141414] border border-white/5 rounded-2xl">
            <div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider">
              Loading deliveries...
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#141414] border border-white/5 rounded-2xl space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30 mx-auto mb-3">
              <Bike className="w-6 h-6" />
            </div>
            <p className="text-white font-bold uppercase tracking-wider text-sm">
              No Pending Deliveries
            </p>
            <p className="text-white/40 text-xs">
              When kitchen staff dispatches an order to you, it will appear here in real-time.
            </p>
          </div>
        ) : (
          orders.map((order) => {
            const shortId = order.id.split("-")[0]?.toUpperCase() || "ORDER";
            const isPaidOnline = order.payment_status === "paid";
            const amountGHS = ((order.total_amount || 0) / 100).toFixed(2);

            return (
              <div
                key={order.id}
                className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-lg"
              >
                <div className="p-5 border-b border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-black text-white">{order.customer_name}</h2>
                      {order.delivery_slot && (
                        <span className="text-[11px] text-white/50 font-medium">
                          Slot: {order.delivery_slot}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/40 font-mono font-bold bg-white/5 px-2 py-1 rounded-md">
                      #{shortId}
                    </span>
                  </div>

                  <p className="text-brand-yellow text-sm font-bold flex items-start gap-1.5 leading-snug">
                    <MapPin size={16} className="flex-none mt-0.5" />
                    <span>{order.delivery_address}</span>
                  </p>

                  {/* Payment Collection Indicator */}
                  <div className="bg-[#18110E] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="text-xs text-white/60 font-bold uppercase tracking-wider">
                      To Collect:
                    </span>
                    <span
                      className={`text-sm font-black ${
                        isPaidOnline ? "text-green-400" : "text-brand-yellow"
                      }`}
                    >
                      {isPaidOnline
                        ? "PAID ONLINE (DELIVERY ONLY)"
                        : `GH₵ ${amountGHS}`}
                    </span>
                  </div>
                </div>

                {/* Big Action Buttons */}
                <div className="grid grid-cols-3 bg-white/5 divide-x divide-white/5">
                  {order.customer_phone ? (
                    <a
                      href={`tel:${order.customer_phone}`}
                      className="flex items-center justify-center gap-1.5 p-4 text-white/90 hover:text-white hover:bg-white/10 font-bold uppercase text-xs transition-colors"
                    >
                      <Phone size={15} />
                      <span>Call</span>
                    </a>
                  ) : (
                    <div className="flex items-center justify-center p-4 text-white/30 text-xs font-bold uppercase">
                      No Phone
                    </div>
                  )}

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      order.delivery_address
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 p-4 text-white/90 hover:text-white hover:bg-white/10 font-bold uppercase text-xs transition-colors"
                  >
                    <Navigation size={15} />
                    <span>Map</span>
                  </a>

                  <button
                    onClick={() => markDelivered(order.id)}
                    className="flex items-center justify-center gap-1.5 p-4 text-green-400 hover:bg-green-400/10 font-black uppercase text-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle size={15} />
                    <span>Delivered</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
