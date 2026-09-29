'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  ChefHat, 
  Sliders, 
  MessageSquare, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw,
  Bike
} from 'lucide-react';

interface KitchenSettingsData {
  id?: string;
  open: boolean;
  daily_capacity: number;
  orders_today: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<KitchenSettingsData>({
    open: true,
    daily_capacity: 12,
    orders_today: 0,
  });
  const [capacityInput, setCapacityInput] = useState<number>(12);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/kitchen');
      if (res.ok) {
        const data = await res.json();
        if (data.kitchenSettings) {
          setSettings(data.kitchenSettings);
          setCapacityInput(data.kitchenSettings.daily_capacity || 12);
        }
      }
    } catch (e) {
      console.error('Failed to load settings:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleOpen = async () => {
    setIsSaving(true);
    const newOpen = !settings.open;

    // Optimistic update
    setSettings((prev) => ({ ...prev, open: newOpen }));

    try {
      const res = await fetch('/api/admin/kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchenSettings: { open: newOpen },
        }),
      });
      if (!res.ok) {
        setSettings((prev) => ({ ...prev, open: !newOpen }));
      }
    } catch (e) {
      setSettings((prev) => ({ ...prev, open: !newOpen }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCapacity = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchenSettings: { daily_capacity: capacityInput },
        }),
      });

      if (res.ok) {
        setSettings((prev) => ({ ...prev, daily_capacity: capacityInput }));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Failed to update capacity:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setTestSmsStatus('Sending test notification...');
    try {
      const res = await fetch('/api/admin/orders/test-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestSmsStatus('SMS successfully triggered via Ghanaian gateway!');
      } else {
        setTestSmsStatus(data.message || 'SMS dispatched (Mock logged in server console).');
      }
    } catch {
      setTestSmsStatus('Mock test SMS logged in console.');
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="text-brand-yellow" size={24} />
            <h2 className="text-2xl font-bold text-white">System &amp; Kitchen Settings</h2>
          </div>
          <p className="text-white/50 text-sm">
            Control kitchen availability, daily order caps, notification gateways, and delivery zones.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Reload</span>
        </button>
      </header>

      {/* Card 1: Master Kitchen Status Switch */}
      <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ChefHat className="text-brand-yellow" size={20} />
              <h3 className="text-lg font-bold text-white">Kitchen Ordering Switch</h3>
            </div>
            <p className="text-xs text-white/50">
              When switched OFF, new customer checkouts are blocked immediately on the storefront.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                settings.open
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}
            >
              {settings.open ? '● OPEN FOR ORDERS' : '● ORDERS PAUSED'}
            </span>

            <button
              onClick={handleToggleOpen}
              disabled={isSaving}
              className={`relative w-14 h-7 rounded-full transition-colors p-0.5 cursor-pointer ${
                settings.open ? 'bg-green-500' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white transition-transform ${
                  settings.open ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Card 2: Daily Capacity Limiter */}
      <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2">
          <Sliders className="text-brand-yellow" size={20} />
          <h3 className="text-lg font-bold text-white">Daily Lunch Batch Capacity</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-white/50 block">
              Max Daily Orders
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                value={capacityInput}
                onChange={(e) => setCapacityInput(parseInt(e.target.value) || 12)}
                className="w-24 bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-2.5 text-center font-mono font-bold text-lg text-white focus:border-brand-yellow outline-none"
              />
              <button
                onClick={handleSaveCapacity}
                disabled={isSaving || capacityInput === settings.daily_capacity}
                className="px-5 py-2.5 rounded-xl bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-40 text-[#18110E] font-bold text-xs uppercase tracking-wider transition-all"
              >
                {isSaving ? 'Saving...' : 'Save Cap'}
              </button>
            </div>
            {saveSuccess && (
              <span className="text-xs text-green-400 font-medium block">
                ✓ Capacity limit updated successfully
              </span>
            )}
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Confirmed Today
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {settings.orders_today}
            </span>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              Slots Remaining
            </span>
            <span className="text-2xl font-black text-brand-yellow font-mono">
              {Math.max(0, settings.daily_capacity - settings.orders_today)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 3: Ghana SMS Gateway Configuration */}
      <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="text-brand-yellow" size={20} />
            <h3 className="text-lg font-bold text-white">SMS Notification Gateway</h3>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Gateway Active
          </span>
        </div>

        <p className="text-xs text-white/60 leading-relaxed">
          Standard Ghanaian gateway integration (Arkesel / Hubtel / Mnotify). Whenever you advance an order to{' '}
          <strong className="text-purple-400">Out for Delivery</strong>, an automated SMS alerts the student to meet the courier outside their hostel.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl space-y-1">
            <span className="text-white/40 uppercase font-semibold">Registered Sender ID</span>
            <p className="font-bold text-brand-yellow font-mono text-sm">CHEF APEDO</p>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl space-y-1">
            <span className="text-white/40 uppercase font-semibold">Automatic Dispatch Trigger</span>
            <p className="font-bold text-white font-mono text-sm">Status: out_for_delivery</p>
          </div>
        </div>

        {/* Test SMS Form */}
        <form onSubmit={handleSendTestSMS} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <input
            type="tel"
            placeholder="Test phone (e.g. 024 123 4567)"
            value={testPhone}
            onChange={(e) => setTestPhone(e.target.value)}
            className="w-full sm:w-72 bg-[#1C1C1C] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-white/40 focus:border-brand-yellow outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Send Test Ping
          </button>
        </form>
        {testSmsStatus && (
          <p className="text-xs text-brand-yellow font-medium mt-1">{testSmsStatus}</p>
        )}
      </div>

      {/* Card 4: Delivery Zones Reference */}
      <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Bike className="text-brand-yellow" size={20} />
          <h3 className="text-lg font-bold text-white">Active Delivery Zones</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Zone A (East Legon)</span>
              <span className="text-xs font-bold text-brand-yellow font-mono">GH₵ 10.00</span>
            </div>
            <p className="text-[11px] text-white/50">East Legon, Legon Campus Hostels, Shiashie</p>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Zone B (Osu / Cantonments)</span>
              <span className="text-xs font-bold text-brand-yellow font-mono">GH₵ 15.00</span>
            </div>
            <p className="text-[11px] text-white/50">Osu, Cantonments, Labone</p>
          </div>

          <div className="bg-[#1C1C1C] border border-white/5 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm">Zone C (Spintex)</span>
              <span className="text-xs font-bold text-brand-yellow font-mono">GH₵ 20.00</span>
            </div>
            <p className="text-[11px] text-white/50">Spintex Road, Batsonaa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
