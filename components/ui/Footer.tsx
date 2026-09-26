import React from "react";
import Link from "next/link";
import { ORDERING_HOURS } from "@/config/business";
import { Clock, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-brand-dark text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark font-display font-extrabold text-sm shadow-md">
                ca
              </div>
              <div>
                <span className="font-display font-black text-lg uppercase text-white">
                  Chef Apedo
                  <span className="text-brand-yellow ml-1 text-xs">Foods</span>
                </span>
                <div className="text-[10px] tracking-widest text-brand-yellow uppercase font-bold">
                  Accra, Ghana
                </div>
              </div>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              Authentic Ghanaian home cooking. Small-batch meals prepared fresh daily with local aromatics and delivered piping hot across Accra.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-yellow font-bold">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Cooked fresh daily · Never reheated</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Explore Menu
            </h4>
            <ul className="space-y-2 text-xs text-white/75 font-medium">
              <li>
                <Link href="/" className="hover:text-brand-yellow transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-brand-yellow transition-colors">
                  Today&apos;s Menu &amp; Prices
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-brand-yellow transition-colors">
                  Accra Coverage &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-yellow transition-colors">
                  Founder Story &amp; Values
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-yellow transition-colors">
                  Contact &amp; Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Daily Schedule & Operations */}
          <div className="space-y-3">
            <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Kitchen Schedule
            </h4>
            <div className="space-y-2.5 text-xs text-white/75 font-medium">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-yellow mt-0.5 flex-none" />
                <div>
                  <span className="text-white font-bold">Orders Open:</span> {ORDERING_HOURS.opensAt} GMT
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-red mt-0.5 flex-none" />
                <div>
                  <span className="text-brand-yellow font-bold">Lunch Cutoff:</span> {ORDERING_HOURS.sameDayCutoff} GMT
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-yellow mt-0.5 flex-none" />
                <div>
                  <span className="text-white font-bold">Lunch Dispatch:</span> From {ORDERING_HOURS.firstDeliverySlot} GMT
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Payment Split Notice */}
          <div className="space-y-3">
            <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Payment Policy
            </h4>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 font-medium">
              <div className="text-brand-yellow font-bold">
                1. Food Subtotal: <span className="text-white font-normal">Prepaid via Paystack</span>
              </div>
              <div className="text-brand-yellow font-bold">
                2. Delivery Fee: <span className="text-white font-normal">Paid directly to courier</span>
              </div>
              <p className="text-[11px] text-white/60 pt-1 border-t border-white/10">
                Standard delivery fee starting from GH₵10 across central Accra.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © {new Date().getFullYear()} Chef Apedo Foods. All rights reserved.
          </div>
          <div className="font-display font-bold uppercase tracking-widest text-brand-yellow text-[11px]">
            Real Ghanaian Food · Accra, Ghana
          </div>
        </div>
      </div>
    </footer>
  );
}
