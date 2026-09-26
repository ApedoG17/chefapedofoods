import React from "react";
import Link from "next/link";
import { ORDERING_HOURS, EXCLUDED_DELIVERY_AREAS } from "@/config/business";
import { MapPin, Clock, Phone, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-brand-espresso text-ink border-t border-line/60 pt-16 pb-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-gold/5 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-line/50">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-red to-brand-gold flex items-center justify-center text-ink font-serif font-black text-sm shadow-md">
                CA
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-ink">Chef Apedo Foods</span>
                <div className="text-[10px] tracking-wider text-brand-gold uppercase font-semibold">
                  Accra, Ghana
                </div>
              </div>
            </div>
            <p className="text-xs text-ink-dim leading-relaxed">
              Authentic Ghanaian culinary craft. Small-batch home-style cooking prepared fresh daily with the finest local ingredients and delivered hot to your doorstep.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-gold-soft">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Strict hygiene & fresh daily batch guarantee</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-ink tracking-wide">Explore</h4>
            <ul className="space-y-2 text-xs text-ink-dim">
              <li>
                <Link href="/menu" className="hover:text-brand-gold transition-colors">
                  Today&apos;s Menu & Prices
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-brand-gold transition-colors">
                  How Ordering Works
                </Link>
              </li>
              <li>
                <Link href="/delivery-info" className="hover:text-brand-gold transition-colors">
                  Accra Delivery Coverage & Zones
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-gold transition-colors">
                  Our Culinary Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Daily Schedule & Operations */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-ink tracking-wide">Daily Hours</h4>
            <div className="space-y-2 text-xs text-ink-dim">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-none" />
                <div>
                  <span className="text-ink font-medium">Orders Open:</span> {ORDERING_HOURS.opensAt} GMT
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-red mt-0.5 flex-none" />
                <div>
                  <span className="text-brand-red-light font-semibold">Same-Day Cutoff:</span> {ORDERING_HOURS.sameDayCutoff} GMT
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-gold mt-0.5 flex-none" />
                <div>
                  <span className="text-ink font-medium">Lunch Delivery:</span> From {ORDERING_HOURS.firstDeliverySlot} GMT
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Payment Split Notice */}
          <div className="space-y-3">
            <h4 className="font-serif font-semibold text-sm text-ink tracking-wide">Payment Transparency</h4>
            <div className="p-3.5 rounded-2xl bg-surface2/60 border border-line text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-brand-gold">
                <span>1. Food Subtotal:</span>
                <span className="text-ink">Prepaid via Paystack</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-brand-yellow">
                <span>2. Delivery Fee:</span>
                <span className="text-ink">Paid directly to rider</span>
              </div>
              <p className="text-[11px] text-ink-dim leading-normal pt-1 border-t border-line/40">
                Delivery starting from GH₵10 depending on distance across central Accra.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-dim">
          <p>© {new Date().getFullYear()} Chef Apedo Foods. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-brand-red fill-brand-red" />
            <span>in Accra, Ghana</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
