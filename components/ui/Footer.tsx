import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ORDERING_HOURS } from "@/config/business";
import { Clock } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#18110E] text-white border-t border-white/10 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10 items-start">
          {/* Brand Info with Official Light Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/images/chef_apedo_logo_variations/logo-light-on-dark.png"
                alt="Chef Apedo Foods"
                width={200}
                height={130}
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-xs">
              Authentic Ghanaian home cooking. Small morning batches prepared fresh daily with local aromatics and delivered piping hot across Accra.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-white/75 font-medium">
              <li>
                <Link href="/menu" className="hover:text-brand-yellow transition-colors">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-brand-yellow transition-colors">
                  Delivery
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-yellow transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-yellow transition-colors">
                  Contact
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
                  <span className="text-white font-bold">First Dispatch:</span> From {ORDERING_HOURS.firstDeliverySlot} GMT
                </div>
              </div>
            </div>
          </div>

          {/* Payment Protocol Summary */}
          <div className="space-y-3">
            <h4 className="font-display font-extrabold text-sm text-white uppercase tracking-wider">
              Payment Protocol
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2 font-medium">
              <div className="text-brand-yellow font-bold">
                1. Food Total: <span className="text-white font-normal">Prepaid online via Paystack</span>
              </div>
              <div className="text-brand-yellow font-bold">
                2. Delivery Fee: <span className="text-white font-normal">Paid directly to rider upon arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <div>
            © 2026 Chef Apedo Foods. All rights reserved.
          </div>
          <div className="font-display font-bold uppercase tracking-widest text-brand-yellow text-[11px]">
            Ghanaian Food. Made to Order. · Accra, Ghana
          </div>
        </div>
      </div>
    </footer>
  );
}
