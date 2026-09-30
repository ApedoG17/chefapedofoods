'use client';

import React, { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle2, MessageSquare, Sparkles, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function MarketingBroadcastPage() {
  const [message, setMessage] = useState('');
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadRecipientCount() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('customers')
          .select('phone');

        if (!error && data) {
          const uniquePhones = new Set(
            data
              .map((c: any) => c.phone?.replace(/[\s\-()]/g, ''))
              .filter((p: string) => p && p.length >= 10)
          );
          setRecipientCount(uniquePhones.size);
        }
      } catch (err) {
        console.warn('Could not load customer count:', err);
      }
    }
    loadRecipientCount();
  }, []);

  const charCount = message.length;
  const maxChars = 480; // Agoo's 3-segment maximum
  const segmentCount = Math.ceil(charCount / 160) || 1;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    if (!confirm(`Are you sure you want to broadcast this SMS to ${recipientCount ?? 'all'} customer(s)?`)) {
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: `Broadcast successfully sent to ${data.count} of ${data.totalAttempted} customer(s)!`,
        });
        setMessage('');
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send broadcast.',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.message || 'Network error while dispatching broadcast.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
          Growth &amp; Engagement
        </span>
        <h1 className="text-2xl sm:text-3xl font-display font-black uppercase tracking-tight text-white mt-1">
          SMS Marketing Broadcast
        </h1>
        <p className="text-xs sm:text-sm text-white/50 mt-1">
          Send instant promotional SMS blasts to your customer base across Accra via Agoo SMS.
        </p>
      </div>

      {/* Recipient Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-yellow/10 text-brand-yellow flex items-center justify-center flex-none">
            <Phone size={24} />
          </div>

          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-bold">
              Audience Reach
            </div>
            <div className="text-2xl font-black text-white mt-0.5">
              {recipientCount !== null ? `${recipientCount} Customers` : 'Loading...'}
            </div>
          </div>
        </div>


        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-none">
            <MessageSquare size={24} />
          </div>
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-bold">
              SMS Gateway
            </div>
            <div className="text-sm font-bold text-white mt-1">
              Agoo SMS (v1 API)
            </div>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-none">
            <Sparkles size={24} />
          </div>
          <div>
            <div className="text-xs text-white/50 uppercase tracking-wider font-bold">
              Approved Sender
            </div>
            <div className="text-sm font-bold text-white mt-1">
              {process.env.NEXT_PUBLIC_SMS_SENDER_ID || 'CHEF APEDO'}
            </div>
          </div>
        </div>
      </div>

      {/* Result Notification Banner */}
      {result && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
            result.success
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-brand-red/10 border-brand-red/20 text-brand-red'
          }`}
        >
          {result.success ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{result.message}</span>
        </div>
      )}

      {/* Compose Form */}
      <form onSubmit={handleSendBroadcast} className="bg-[#141414] border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black uppercase tracking-wider text-white">
              Campaign Message
            </label>
            <div className="text-xs text-white/50 font-mono">
              <span className={charCount > maxChars ? 'text-brand-red font-bold' : ''}>
                {charCount}
              </span>{' '}
              / {maxChars} chars ({segmentCount} SMS {segmentCount > 1 ? 'segments' : 'segment'})
            </div>
          </div>

          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Lunch is served! Use promo code LUNCH10 for 10% off your Jollof order today at chefapedofoods.com. Order before 10:00 AM!"
            maxLength={maxChars}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all placeholder:text-white/30 resize-none leading-relaxed"
            required
          />

          <p className="text-[11px] text-white/40 leading-relaxed">
            Agoo limits SMS bodies to 480 characters. Standard Ghana network rates apply per segment (160 characters each).
          </p>
        </div>

        {/* Quick Template Prompts */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/50">
            Quick Template Suggestions:
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setMessage(
                  'Craving authentic smoky Jollof? Chef Apedo is cooking fresh morning batches now! Order before 10:00 AM at chefapedofoods.com for hot lunch delivery.'
                )
              }
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white/80 transition-colors"
            >
              🔥 Daily Morning Reminder
            </button>
            <button
              type="button"
              onClick={() =>
                setMessage(
                  'Exclusive Campus Treat: Get 10% off your midday meal today with promo code CAMPUS10 at chefapedofoods.com! Hot dispatch starts at 11:30 AM.'
                )
              }
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-lg text-white/80 transition-colors"
            >
              🎉 Promo Code Special
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-white/50">
            Requires active <code className="text-brand-yellow font-mono">SMS_API_KEY</code>
          </div>

          <button
            type="submit"
            disabled={isSending || !message.trim() || charCount > maxChars}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-button-yellow cursor-pointer"
          >
            <Send size={16} />
            <span>{isSending ? 'Dispatching Broadcast...' : 'Send Broadcast Blast'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
