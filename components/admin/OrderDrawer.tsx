'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  ChefHat, 
  Bike, 
  ShoppingBag,
  CreditCard,
  Wallet
} from 'lucide-react';

// Dynamically import Leaflet MapPin to prevent SSR issues
const OrderMapPin = dynamic(() => import('@/components/admin/OrderMapPin'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-48 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-xs text-white/40 gap-2">
      <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin" />
      <span>Loading OpenStreetMap Pin...</span>
    </div>
  ),
});

export interface OrderItem {
  id?: string;
  quantity?: number;
  base_price_pesewas?: number;
  included_protein_package_name?: string;
  meal?: { name?: string };
  size?: { size?: string };
  proteins?: Array<{ protein?: { name?: string; additional_price_pesewas?: number } }>;
  name?: string;
}

export interface AdminOrder {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  delivery_address?: string;
  delivery_area?: string;
  delivery_slot?: string;
  total_amount?: number;
  subtotal_pesewas?: number;
  delivery_fee_pesewas?: number;
  payment_method?: string;
  payment_status?: string;
  status: string;
  order_status?: string;
  paystack_reference?: string;
  rider_id?: string | null;
  created_at: string;
  items?: OrderItem[];
  customers?: { name?: string; phone?: string };
  addresses?: { address?: string; area?: string };
  order_items?: OrderItem[];
}

interface OrderDrawerProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
}

export function parseCoordinates(addressStr: string): { lat: number; lng: number } {
  if (!addressStr) return { lat: 5.6505, lng: -0.1870 }; // Default East Legon / Campus

  // 1. Try explicit GPS pattern: "GPS: 5.6593, -0.1932"
  const gpsMatch = addressStr.match(/GPS:\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/i);
  if (gpsMatch && gpsMatch[1] && gpsMatch[2]) {
    const lat = parseFloat(gpsMatch[1]);
    const lng = parseFloat(gpsMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // 2. Try generic coordinate pattern: "5.6593, -0.1932"
  const coordMatch = addressStr.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (coordMatch && coordMatch[1] && coordMatch[2]) {
    const lat = parseFloat(coordMatch[1]);
    const lng = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  // 3. Known Accra campus and residential hotspots
  const lower = addressStr.toLowerCase();
  if (lower.includes('evandy')) return { lat: 5.6593, lng: -0.1932 };
  if (lower.includes('pentagon') || lower.includes('pent')) return { lat: 5.6582, lng: -0.1915 };
  if (lower.includes('tf hostel') || lower.includes('hostel annex')) return { lat: 5.6575, lng: -0.1902 };
  if (lower.includes('bani')) return { lat: 5.6601, lng: -0.1925 };
  if (lower.includes('african union') || lower.includes('au hostel')) return { lat: 5.6565, lng: -0.1938 };
  if (lower.includes('legon hall')) return { lat: 5.6498, lng: -0.1876 };
  if (lower.includes('akuafo')) return { lat: 5.6515, lng: -0.1872 };
  if (lower.includes('commonwealth') || lower.includes('vandals')) return { lat: 5.6542, lng: -0.1856 };
  if (lower.includes('volta hall')) return { lat: 5.6508, lng: -0.1858 };
  if (lower.includes('sarbah')) return { lat: 5.6472, lng: -0.1895 };
  if (lower.includes('a&c') || lower.includes('a and c')) return { lat: 5.6375, lng: -0.1558 };
  if (lower.includes('american house')) return { lat: 5.6418, lng: -0.1532 };
  if (lower.includes('lagos ave') || lower.includes('lagos avenue')) return { lat: 5.6392, lng: -0.1610 };
  if (lower.includes('shiashie')) return { lat: 5.6265, lng: -0.1742 };
  if (lower.includes('osu')) return { lat: 5.5560, lng: -0.1820 };
  if (lower.includes('cantonments')) return { lat: 5.5780, lng: -0.1740 };
  if (lower.includes('spintex')) return { lat: 5.6300, lng: -0.1000 };

  // Default East Legon
  return { lat: 5.6505, lng: -0.1870 };
}

export default function OrderDrawer({ order, isOpen, onClose, onStatusUpdate }: OrderDrawerProps) {
  const [updating, setUpdating] = useState(false);
  const [riders, setRiders] = useState<{ id: string; full_name: string; phone_number: string }[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [riderSaveSuccess, setRiderSaveSuccess] = useState(false);

  // Sync rider state when order changes or drawer opens
  React.useEffect(() => {
    if (order) {
      setSelectedRiderId(order.rider_id || '');
    }
  }, [order]);

  // Fetch active riders list
  React.useEffect(() => {
    if (!isOpen) return;
    async function loadRiders() {
      try {
        const res = await fetch('/api/admin/riders');
        if (res.ok) {
          const json = await res.json();
          if (json.riders) {
            setRiders(json.riders);
          }
        }
      } catch (err) {
        console.warn('Could not load riders list:', err);
      }
    }
    loadRiders();
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const customerName = order.customer_name || order.customers?.name || 'Guest Customer';
  const customerPhone = order.customer_phone || order.customers?.phone || '';
  const fullAddress = order.delivery_address || order.addresses?.address || order.delivery_area || 'Accra, Ghana';
  const areaName = order.delivery_area || order.addresses?.area || 'Greater Accra';
  const totalGHS = ((order.total_amount || order.subtotal_pesewas || 0) / 100).toFixed(2);
  const deliveryFeeGHS = (((order.delivery_fee_pesewas || 1000) / 100)).toFixed(2);
  const currentStatus = order.status || order.order_status || 'confirmed';
  const coords = parseCoordinates(fullAddress);

  const itemsList = order.items && order.items.length > 0 
    ? order.items 
    : order.order_items && order.order_items.length > 0 
    ? order.order_items 
    : [];

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      const normalizedStatus =
        newStatus === 'cooking'
          ? 'preparing'
          : newStatus === 'out_for_delivery'
          ? 'dispatched'
          : newStatus === 'completed'
          ? 'delivered'
          : newStatus;

      const payload: { orderStatus: string; rider_id?: string | null } = {
        orderStatus: normalizedStatus,
      };
      if (selectedRiderId) {
        payload.rider_id = selectedRiderId;
      }
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = await res.json();
        const updatedStatus = json.order?.order_status || json.order?.status || normalizedStatus;
        if (onStatusUpdate) {
          onStatusUpdate(order.id, updatedStatus);
        }
      } else {
        const errJson = await res.json().catch(() => null);
        console.error('Failed to update order status:', errJson);
      }
    } catch (e) {
      console.error('Failed to update order status:', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveRiderAssignment = async () => {
    if (!order) return;
    setUpdating(true);
    setRiderSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rider_id: selectedRiderId || null }),
      });
      if (res.ok) {
        setRiderSaveSuccess(true);
        setTimeout(() => setRiderSaveSuccess(false), 2500);
      }
    } catch (e) {
      console.error('Failed to assign rider:', e);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'awaiting_payment':
        return 'bg-red-400/10 text-red-400 border-red-400/20';
      case 'confirmed':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'cooking':
      case 'preparing':
        return 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/20';
      case 'ready_for_dispatch':
      case 'out_for_delivery':
      case 'dispatched':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      case 'completed':
      case 'delivered':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      default:
        return 'bg-white/10 text-white/70 border-white/20';
    }
  };

  const formattedDate = new Date(order.created_at).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const openStreetMapUrl = `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Drawer Panel */}
      <aside className="relative w-full max-w-lg bg-[#141414] border-l border-white/10 h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#181818]">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-white uppercase tracking-wider">
                #{order.id.split('-')[0]?.toUpperCase()}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(currentStatus)}`}>
                {currentStatus.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-white/50 flex items-center gap-1.5">
              <Clock size={12} />
              <span>{formattedDate}</span>
              {order.delivery_slot && (
                <span className="text-brand-yellow font-semibold ml-1">· Slot: {order.delivery_slot}</span>
              )}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="Close Drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Controls: Status Advancement */}
        <div className="px-6 py-3 bg-[#111111] border-b border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider flex-none">
            Update Status:
          </span>
          <button
            disabled={updating || currentStatus === 'cooking' || currentStatus === 'preparing'}
            onClick={() => handleUpdateStatus('preparing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-none flex items-center gap-1.5 ${
              currentStatus === 'cooking' || currentStatus === 'preparing'
                ? 'bg-brand-yellow text-[#18110E]'
                : 'bg-white/5 hover:bg-brand-yellow/20 hover:text-brand-yellow text-white/70'
            }`}
          >
            <ChefHat size={13} />
            <span>Cooking</span>
          </button>

          <button
            disabled={updating || currentStatus === 'out_for_delivery' || currentStatus === 'dispatched'}
            onClick={() => handleUpdateStatus('out_for_delivery')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-none flex items-center gap-1.5 ${
              currentStatus === 'out_for_delivery' || currentStatus === 'dispatched'
                ? 'bg-purple-500 text-white'
                : 'bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 text-white/70'
            }`}
          >
            <Bike size={13} />
            <span>Dispatch</span>
          </button>

          <button
            disabled={updating || currentStatus === 'completed' || currentStatus === 'delivered'}
            onClick={() => handleUpdateStatus('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-none flex items-center gap-1.5 ${
              currentStatus === 'completed' || currentStatus === 'delivered'
                ? 'bg-green-500 text-white'
                : 'bg-white/5 hover:bg-green-500/20 hover:text-green-300 text-white/70'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Delivered</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Dispatch Courier Assignment Strip */}
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow flex-none">
                <Bike size={18} />
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Assign Dispatch Rider</span>
                <span className="text-[11px] text-white/50">Assign courier before tapping Dispatch</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedRiderId}
                onChange={(e) => setSelectedRiderId(e.target.value)}
                className="bg-[#141414] border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-brand-yellow outline-none cursor-pointer"
              >
                <option value="">-- Unassigned --</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} ({r.phone_number})
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={updating}
                onClick={handleSaveRiderAssignment}
                className="px-3 py-2 rounded-xl bg-brand-yellow/20 hover:bg-brand-yellow text-brand-yellow hover:text-[#18110E] text-xs font-bold uppercase transition-all disabled:opacity-50 cursor-pointer"
              >
                {riderSaveSuccess ? "Saved!" : "Assign"}
              </button>
            </div>
          </div>

          {/* Section 1: Customer Contact Card */}
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-brand-yellow/20 text-brand-yellow font-black flex items-center justify-center text-sm uppercase">
                {customerName.substring(0, 2)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{customerName}</h3>
                <p className="text-xs text-white/50">{customerPhone || 'No phone recorded'}</p>
              </div>
            </div>

            {customerPhone && (
              <a
                href={`tel:${customerPhone}`}
                className="px-3 py-2 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 font-bold text-xs flex items-center gap-1.5 transition-colors border border-green-500/20"
              >
                <Phone size={13} />
                <span>Call Rider/Customer</span>
              </a>
            )}
          </div>

          {/* Section 2: OpenStreetMap Pin & Delivery Destination */}
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-yellow">
                <MapPin size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  OpenStreetMap Pin
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[11px] font-medium text-white/60">
                {areaName}
              </span>
            </div>

            {/* Address text */}
            <p className="text-xs text-white/80 leading-relaxed bg-[#141414] p-3 rounded-xl border border-white/5">
              {fullAddress}
            </p>

            {/* Leaflet Interactive OpenStreetMap Pin */}
            <div className="overflow-hidden rounded-xl border border-white/10">
              <OrderMapPin
                lat={coords.lat}
                lng={coords.lng}
                customerName={customerName}
                address={fullAddress}
              />
            </div>

            {/* Coordinate Tags & External Navigation Links */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-white/40">
              <span className="font-mono">
                GPS: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={openStreetMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-yellow hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>OSM</span>
                  <ExternalLink size={10} />
                </a>
                <span>·</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 hover:text-white flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* Section 3: Itemized Food List */}
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-brand-yellow">
                <ShoppingBag size={16} />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Itemized Food Order
                </span>
              </div>
              <span className="text-xs text-white/40 font-semibold">
                {itemsList.length} {itemsList.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {itemsList.length === 0 ? (
              <div className="py-6 text-center text-xs text-white/40">
                No individual food items broken down for this record.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {itemsList.map((item, index) => {
                  const mealName = item.meal?.name || item.name || 'Jollof & Protein Plate';
                  const sizeName = item.size?.size || 'Standard';
                  const proteinPackage = item.included_protein_package_name || 'Standard Package';
                  const itemQty = item.quantity || 1;
                  const itemPrice = item.base_price_pesewas 
                    ? `GH₵ ${(item.base_price_pesewas * itemQty / 100).toFixed(2)}`
                    : null;

                  return (
                    <div key={item.id || index} className="py-3 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-brand-yellow/20 text-brand-yellow text-xs font-black flex items-center justify-center">
                            {itemQty}x
                          </span>
                          <span className="text-sm font-bold text-white">{mealName}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            {sizeName}
                          </span>
                        </div>
                        <div className="text-xs text-white/50 pl-7">
                          <span>Combo: </span>
                          <strong className="text-white/80 font-medium">{proteinPackage}</strong>
                        </div>
                        {item.proteins && item.proteins.length > 0 && (
                          <div className="text-[11px] text-brand-yellow/80 pl-7">
                            Extra proteins: {item.proteins.map(p => p.protein?.name).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>

                      {itemPrice && (
                        <span className="text-xs font-bold text-white font-mono">
                          {itemPrice}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Dual-Payment Split & Financials */}
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Financial Breakdown
            </h4>

            <div className="space-y-2 text-xs divide-y divide-white/5">
              <div className="flex justify-between items-center pt-1 text-white/70">
                <span>Food Subtotal:</span>
                <span className="font-bold text-white">GH₵ {totalGHS}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-white/70">
                <span className="flex items-center gap-1.5">
                  <Bike size={14} className="text-brand-yellow" />
                  <span>Courier Delivery Fee (Pay Rider on Delivery):</span>
                </span>
                <span className="font-bold text-brand-yellow">GH₵ {deliveryFeeGHS}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-white/40">Payment Lane:</span>
                <span className="font-medium text-white flex items-center gap-1.5 uppercase tracking-wider">
                  {order.payment_method === 'manual' ? (
                    <>
                      <Wallet size={13} className="text-brand-yellow" />
                      <span>Manual MoMo / Cash</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={13} className="text-green-400" />
                      <span>Online (Hubtel MoMo)</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-white/10 bg-[#181818] flex items-center justify-between">
          <span className="text-xs text-white/40">
            Click outside or press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px]">Esc</kbd> to close
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Close Panel
          </button>
        </div>
      </aside>
    </div>
  );
}
