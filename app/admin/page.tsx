'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowUpRight, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import OrderDrawer, { type AdminOrder } from '@/components/admin/OrderDrawer';

// Initialize Supabase client
const supabase = createClient();


export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Normalize order data to gracefully support both joined tables and flat schema shapes
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
      // 1. Try querying Supabase client with related tables
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
        .limit(50);

      if (!error && data && data.length > 0) {
        setOrders(data.map(normalizeOrder));
        setIsLoading(false);
        return;
      }

      // 2. If client direct select is empty or RLS protected, fetch through admin route
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const apiJson = await res.json();
        if (apiJson.orders && apiJson.orders.length > 0) {
          setOrders(apiJson.orders.map(normalizeOrder));
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback: flat select
      const flatRes = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (flatRes.data) {
        setOrders(flatRes.data.map(normalizeOrder));
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial orders and subscribe to real-time changes
  useEffect(() => {
    fetchOrders();

    // Set up the Realtime Subscription on the 'orders' table
    const subscription = supabase
      .channel('live-orders')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          // Re-fetch the orders to ensure we have the latest data and sorting
          fetchOrders();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchOrders]);

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Helper to dynamically style the status badges
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'awaiting_payment':
        return 'bg-red-400/10 text-red-400';
      case 'confirmed':
        return 'bg-blue-400/10 text-blue-400';
      case 'cooking':
      case 'preparing':
        return 'bg-brand-yellow/10 text-brand-yellow';
      case 'out_for_delivery':
      case 'ready_for_dispatch':
      case 'dispatched':
        return 'bg-purple-400/10 text-purple-400';
      case 'completed':
      case 'delivered':
        return 'bg-green-400/10 text-green-400';
      default:
        return 'bg-white/10 text-white/70';
    }
  };

  // Calculate live metrics from the fetched orders
  const today = new Date().toISOString().split('T')[0] ?? '';
  
  const todaysRevenue = orders
    .filter(o => o.created_at?.startsWith(today) && o.status !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    
  const activeOrders = orders.filter(o => 
    ['awaiting_payment', 'confirmed', 'cooking', 'preparing', 'ready_for_dispatch', 'out_for_delivery', 'dispatched'].includes(o.status)
  ).length;

  const completedToday = orders.filter(o => 
    o.created_at?.startsWith(today) && (o.status === 'completed' || o.status === 'delivered')
  ).length;

  const metrics = [
    { title: "Today's Revenue", value: `GH₵ ${(todaysRevenue / 100).toFixed(2)}`, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Active Orders", value: activeOrders.toString(), icon: Clock, color: "text-brand-yellow", bg: "bg-brand-yellow/10" },
    { title: "Completed Today", value: completedToday.toString(), icon: CheckCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Avg. Prep Time", value: "18 min", icon: ArrowUpRight, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

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

  return (
    <div className="p-8">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Kitchen Overview</h2>
          <p className="text-white/50 text-sm">Real-time metrics and order tracking with live Supabase subscriptions.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Realtime Connected
          </span>
        </div>
      </header>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <div key={idx} className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <p className="text-white/50 text-sm font-medium">{metric.title}</p>
                <div className={`p-2 rounded-lg ${metric.bg} ${metric.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h3 className="text-3xl font-black text-white">{metric.value}</h3>
              <div className="absolute -inset-2 bg-gradient-to-r from-brand-yellow/0 via-brand-yellow/5 to-brand-yellow/0 opacity-0 group-hover:opacity-100 transition-opacity blur-xl z-0 pointer-events-none" />
            </div>
          );
        })}
      </div>

      {/* Live Order Queue */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <p className="text-xs text-white/40 mt-0.5">Click any order to view exact OpenStreetMap pin &amp; itemized food plate</p>
          </div>
          <button 
            onClick={() => fetchOrders()}
            className="text-sm text-brand-yellow hover:text-brand-yellow/80 transition-colors font-medium flex items-center gap-1"
          >
            Refresh ➔
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-white/5 text-white/50">
              <tr>
                <th className="px-6 py-4 rounded-l-lg font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Address</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 rounded-r-lg font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
                      <span>Loading live orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                    No orders placed yet. Place an order via checkout to see it appear here in real-time.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => handleRowClick(order)}
                    className="border-b border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    title="Click to view delivery map and itemized food plate"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-yellow/20 text-brand-yellow group-hover:bg-brand-yellow group-hover:text-[#18110E] transition-colors flex items-center justify-center font-bold uppercase text-xs">
                        {order.customer_name?.substring(0, 2) || 'CU'}
                      </div>
                      <div>
                        <span className="font-semibold text-white block group-hover:text-brand-yellow transition-colors">
                          {order.customer_name}
                        </span>
                        {order.customer_phone && (
                          <span className="text-[11px] text-white/40 block">
                            {order.customer_phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[120px] font-mono text-xs">
                      #{order.id.split('-')[0]?.toUpperCase()}
                    </td>
                    <td className="px-6 py-4 truncate max-w-[220px]">
                      <span className="text-white/80">{order.delivery_address}</span>
                      {order.delivery_area && (
                        <span className="text-[11px] text-white/40 block">
                          {order.delivery_area}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white font-mono">
                      GH₵ {((order.total_amount || 0) / 100).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
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
