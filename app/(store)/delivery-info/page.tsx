import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { EXCLUDED_DELIVERY_AREAS, ORDERING_HOURS } from "@/config/business";
import { Bike, Clock, MapPin, ShieldAlert, Sparkles, ArrowRight } from "lucide-react";

export default function DeliveryInfoPage() {
  return (
    <main className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest">
          <Bike className="w-3.5 h-3.5" />
          <span>Practical Information</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
          Delivery & Coverage
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          Accra coverage boundaries, transparent rider fees, ordering schedules, and cancellation policies.
        </p>
      </div>

      {/* Coverage Card */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
          <MapPin className="w-4 h-4" />
          <span>Accra Coverage & Service Zones</span>
        </div>
        <p className="text-xs sm:text-sm text-ink leading-relaxed">
          We deliver across central Accra including East Legon, Shiashie, Osu, Cantonments, Labone, Spintex, and Airport Residential.
        </p>
        <div className="bg-warn/10 border border-warn/30 p-4 rounded-2xl space-y-1 text-xs">
          <div className="font-bold text-warn flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Excluded Outer Areas</span>
          </div>
          <p className="text-ink-dim leading-relaxed">
            To preserve food quality and avoid long bike transit delays, we do not deliver to:
          </p>
          <div className="font-semibold text-warn pt-1">
            {EXCLUDED_DELIVERY_AREAS.join(" · ")}
          </div>
        </div>
      </div>

      {/* Transparent Split Fee */}
      <div className="bg-surface2/80 border border-brand-gold/30 rounded-3xl p-6 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
          <Bike className="w-4 h-4" />
          <span>Delivery Fee (Paid Directly to Rider)</span>
        </div>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          Delivery fees start from <strong className="text-brand-gold font-bold">GH₵10</strong> and are calculated based on your zone. The delivery fee is paid separately and directly to the dispatch rider upon meal delivery (Cash or MoMo).
        </p>
      </div>

      {/* Schedule */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-6 shadow-md space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-gold">
          <Clock className="w-4 h-4" />
          <span>Daily Service Hours</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-surface border border-line text-xs">
            <div className="text-ink-dim text-[11px]">Orders Open</div>
            <div className="font-serif font-bold text-base text-ink">{ORDERING_HOURS.opensAt} GMT</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-brand-red/30 text-xs">
            <div className="text-brand-red font-semibold text-[11px]">Same-Day Cutoff</div>
            <div className="font-serif font-bold text-base text-brand-red">{ORDERING_HOURS.sameDayCutoff} GMT</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-surface border border-line text-xs">
            <div className="text-ink-dim text-[11px]">First Delivery Slot</div>
            <div className="font-serif font-bold text-base text-ink">{ORDERING_HOURS.firstDeliverySlot} GMT</div>
          </div>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-6 shadow-md space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          Cancellation Policy
        </div>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          Cancellations are permitted up to 1 hour before your selected delivery slot, provided food preparation has not already started. Once cooking has commenced, orders cannot be cancelled due to daily fresh batch capacity limits.
        </p>
      </div>

      <div className="pt-2">
        <Link href="/menu">
          <Button variant="primary" className="w-full shadow-gold-glow py-3.5 font-bold flex items-center justify-center gap-2">
            <span>Explore Today&apos;s Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
