'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ClipboardList, 
  Search, 
  Clock, 
  CheckCircle, 
  Bike, 
  ChefHat, 
  AlertCircle, 
  RotateCcw,
  MapPin,
  Phone
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import OrderDrawer, { type AdminOrder } from '@/components/admin/OrderDrawer';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STATUS_FILTERS = [
  { id: 'all', label: 'All Orders' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'cooking', label: 'Cooking / Prep' },
  { id: 'out_for_delivery', label: 'Out for Delivery' },
  { id: 'completed', label: 'Completed' },
  { id: 'awaiting_payment', label: 'Awaiting Payment' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const normalizeOrder = (o: any): AdminOrder => {
    const custName = o.customer_name || o.customers?.name || o.customer?.name || 'Guest Customer';
    const custPhone = o.customer_phone || o.customers?.phone || o.customer?.phone || '';
    const addr = o.delivery_address || o.addresses?.address || o.address?.address || 'Accra, Ghana';
    const area = o.delivery_area || o.addresses?.area || o.address?.area || 'Greater Accra';
    const amount = o.total_amount !== undefined 
      ? Number(o.total_amount) 
      : Number(o.subtotal_pesewas || 0);
    const st = o.status || o.order_status || 'confirmed';
    const items = o.items || o.order_items || [];

    return {
      ...o,
      customer_name: custName,
      customer_phone: custPhone,
      delivery_address: addr,
      delivery_area: area,
      total_amount: amount,
      status: st,
      items: items,
    };
  };

  const fetchOrders = useCallback(async () => {
    try {
      // 1. Try relational query
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers (name, phone),
          address:addresses (address, area),
          items:order_items (
            id,
            quantity,
            base_price_pesewas,
            included_protein_package_name,
            meal:meals (name),
            size:meal_sizes (size),
            proteins:order_item_proteins (
              protein:protein_options (name, additional_price_pesewas)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        setOrders(data.map(normalizeOrder));
        setIsLoading(false);
        return;
      }

      // 2. Fallback to API route
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const apiJson = await res.json();
        if (apiJson.orders && apiJson.orders.length > 0) {
          setOrders(apiJson.orders.map(normalizeOrder));
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback flat select
      const flatRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (flatRes.data) {
        setOrders(flatRes.data.map(normalizeOrder));
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const subscription = supabase
      .channel('admin-orders-stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchOrders]);

  const handleRowClick = (order: AdminOrder) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus, order_status: newStatus } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus, order_status: newStatus } : null);
    }
    fetchOrders();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awaiting_payment':
        return 'bg-red-400/10 text-red-400 border border-red-400/20';
      case 'confirmed':
        return 'bg-blue-400/10 text-blue-400 border border-blue-400/20';
      case 'cooking':
      case 'preparing':
        return 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/20';
      case 'out_for_delivery':
      case 'ready_for_dispatch':
      case 'dispatched':
        return 'bg-purple-400/10 text-purple-400 border border-purple-400/20';
      case 'completed':
      case 'delivered':
        return 'bg-green-400/10 text-green-400 border border-green-400/20';
      default:
        return 'bg-white/10 text-white/70 border border-white/20';
    }
  };

  // Filter orders by status tab and search input
  const filteredOrders = orders.filter((order) => {
    const matchesFilter = 
      activeFilter === 'all' 
        ? true 
        : activeFilter === 'cooking' 
        ? (order.status === 'cooking' || order.status === 'preparing')
        : activeFilter === 'out_for_delivery'
        ? (order.status === 'out_for_delivery' || order.status === 'dispatched' || order.status === 'ready_for_dispatch')
        : activeFilter === 'completed'
        ? (order.status === 'completed' || order.status === 'delivered')
        : order.status === activeFilter;

    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const id = order.id.toLowerCase();
    const name = (order.customer_name || '').toLowerCase();
    const phone = (order.customer_phone || '').toLowerCase();
    const addr = (order.delivery_address || '').toLowerCase();

    return id.includes(q) || name.includes(q) || phone.includes(q) || addr.includes(q);
  });

  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="text-brand-yellow" size={24} />
            <h2 className="text-2xl font-bold text-white">Live Orders Pipeline</h2>
          </div>
          <p className="text-white/50 text-sm">
            Real-time kitchen ticket management, dispatching, and delivery tracking.
          </p>
        </div>

        <button
          onClick={() => fetchOrders()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Refresh Queue</span>
        </button>
      </header>

      {/* Search & Filter Toolbar */}
      <div className="space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search orders by customer name, phone, order ID, or hostel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-brand-yellow outline-none transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-brand-yellow text-[#18110E] shadow-[0_0_15px_rgba(255,184,0,0.25)]'
                    : 'bg-[#141414] text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Order Ref</th>
                <th className="px-6 py-4 font-medium">Destination</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Slot</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/40">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                      <span>Loading live order queue...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/40">
                    No orders match the current filter or search criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const shortId = order.id.split('-')[0]?.toUpperCase();
                  const totalGHS = ((order.total_amount || 0) / 100).toFixed(2);

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleRowClick(order)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-yellow/20 text-brand-yellow flex items-center justify-center font-bold text-xs uppercase group-hover:bg-brand-yellow group-hover:text-[#18110E] transition-colors">
                            {order.customer_name?.substring(0, 2) || 'CU'}
                          </div>
                          <div>
                            <span className="font-bold text-white block group-hover:text-brand-yellow transition-colors">
                              {order.customer_name}
                            </span>
                            {order.customer_phone && (
                              <span className="text-[11px] text-white/40 flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                <span>{order.customer_phone}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-white/80">
                        #{shortId}
                      </td>

                      <td className="px-6 py-4 max-w-[200px]">
                        <div className="truncate text-white text-xs flex items-center gap-1">
                          <MapPin size={12} className="text-brand-yellow flex-none" />
                          <span className="truncate">{order.delivery_address}</span>
                        </div>
                        {order.delivery_area && (
                          <span className="text-[11px] text-white/40 block mt-0.5">
                            {order.delivery_area}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-white">
                        GH₵ {totalGHS}
                      </td>

                      <td className="px-6 py-4 text-xs text-white/70">
                        {order.delivery_slot || '11:30 AM'}
                      </td>

                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-brand-yellow font-bold group-hover:underline">
                          View Ticket ➔
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Order Details Drawer with OpenStreetMap Pin & Itemized Food List */}
      <OrderDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
}
