'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Banknote, 
  RotateCcw,
  CheckCircle2, 
  AlertCircle,
  Bike
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FinanceOrder {
  id: string;
  paystack_reference?: string;
  subtotal_pesewas: number;
  delivery_fee_pesewas: number;
  amount_paid_pesewas: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  customer?: { name?: string; phone?: string };
}

export default function FinancePage() {
  const [orders, setOrders] = useState<FinanceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const fetchFinanceData = async () => {
    setIsLoading(true);
    try {
      // 1. Try relational query
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          paystack_reference,
          subtotal_pesewas,
          delivery_fee_pesewas,
          amount_paid_pesewas,
          payment_method,
          payment_status,
          order_status,
          created_at,
          customer:customers (name, phone)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        setOrders(data as any[]);
        setIsLoading(false);
        return;
      }

      // 2. Fallback via API
      const res = await fetch('/api/admin/orders');
      if (res.ok) {
        const apiJson = await res.json();
        if (apiJson.orders) {
          setOrders(apiJson.orders);
          setIsLoading(false);
          return;
        }
      }

      // 3. Flat select fallback
      const flat = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (flat.data) {
        setOrders(flat.data as any[]);
      }
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Compute Financial Aggregations
  const totalSubtotalPesewas = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.subtotal_pesewas || 0), 0);

  const totalDeliveryFeesPesewas = orders
    .filter(o => o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.delivery_fee_pesewas || 1000), 0);

  const onlineRevenuePesewas = orders
    .filter(o => o.payment_method !== 'manual' && o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.subtotal_pesewas || 0), 0);

  const manualMoMoRevenuePesewas = orders
    .filter(o => o.payment_method === 'manual' && o.order_status !== 'cancelled')
    .reduce((sum, o) => sum + (o.subtotal_pesewas || 0), 0);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'paid') return o.payment_status === 'paid';
    if (statusFilter === 'unpaid') return o.payment_status === 'unpaid';
    return true;
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="text-brand-yellow" size={24} />
            <h2 className="text-2xl font-bold text-white">Financial Ledger &amp; Revenue</h2>
          </div>
          <p className="text-white/50 text-sm">
            Auditing food payments, dispatch courier fee splits, and MoMo channel breakdown.
          </p>
        </div>

        <button
          onClick={fetchFinanceData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Refresh Ledger</span>
        </button>
      </header>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Gross Food Revenue</span>
            <div className="p-2 rounded-lg bg-green-400/10 text-green-400">
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-mono">
            GH₵ {(totalSubtotalPesewas / 100).toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Excludes cancelled orders</p>
        </div>

        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Online MoMo &amp; Card</span>
            <div className="p-2 rounded-lg bg-blue-400/10 text-blue-400">
              <CreditCard size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-mono">
            GH₵ {(onlineRevenuePesewas / 100).toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Settled via Hubtel</p>
        </div>

        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Manual MoMo / Cash</span>
            <div className="p-2 rounded-lg bg-brand-yellow/10 text-brand-yellow">
              <Banknote size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-mono">
            GH₵ {(manualMoMoRevenuePesewas / 100).toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Collected on delivery / direct</p>
        </div>

        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
          <div className="flex justify-between items-start mb-3">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Courier Delivery Fees</span>
            <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
              <Bike size={18} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white font-mono">
            GH₵ {(totalDeliveryFeesPesewas / 100).toFixed(2)}
          </h3>
          <p className="text-[11px] text-white/40 mt-1">Disbursed directly to riders</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex gap-2">
          {(['all', 'paid', 'unpaid'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-brand-yellow text-[#18110E] shadow-[0_0_15px_rgba(255,184,0,0.25)]'
                  : 'bg-[#141414] text-white/60 hover:text-white border border-white/5'
              }`}
            >
              {filter === 'all' ? 'All Transactions' : `${filter} Only`}
            </button>
          ))}
        </div>

        <span className="text-xs text-white/40 font-medium">
          Showing {filteredOrders.length} records
        </span>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-[#141414] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/70">
            <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Reference</th>
                <th className="px-6 py-4 font-medium">Channel</th>
                <th className="px-6 py-4 font-medium">Food Subtotal</th>
                <th className="px-6 py-4 font-medium">Courier Fee</th>
                <th className="px-6 py-4 font-medium">Payment Status</th>
                <th className="px-6 py-4 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/40 font-sans">
                    <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading financial ledger...</span>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-white/40 font-sans">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const ref = order.paystack_reference || order.id.split('-')[0]?.toUpperCase();
                  const customerName = order.customer?.name || (order as any).customer_name || 'Guest Customer';
                  const dateStr = new Date(order.created_at).toLocaleString('en-GB', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-sans font-medium text-white">
                        {customerName}
                      </td>

                      <td className="px-6 py-4 text-white/80">
                        #{ref}
                      </td>

                      <td className="px-6 py-4 font-sans">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-white/80">
                          {order.payment_method === 'manual' ? (
                            <>
                              <Banknote size={11} className="text-brand-yellow" />
                              <span>Manual MoMo / Cash</span>
                            </>
                          ) : (
                            <>
                              <CreditCard size={11} className="text-green-400" />
                              <span>Online MoMo</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-white">
                        GH₵ {((order.subtotal_pesewas || 0) / 100).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 text-brand-yellow">
                        GH₵ {(((order.delivery_fee_pesewas || 1000) / 100)).toFixed(2)}
                      </td>

                      <td className="px-6 py-4 font-sans">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            order.payment_status === 'paid'
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : order.payment_status === 'failed'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-white/40">
                        {dateStr}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
