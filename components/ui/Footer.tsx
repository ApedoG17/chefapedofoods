import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ORDERING_HOURS_DISPLAY } from "@/config/business";
import { Clock, Phone, MessageSquare } from "lucide-react";

// ─── Social / contact configuration from env vars ────────────────────────────
// Set these in .env.local (never committed). See .env.example for the keys.
const BUSINESS_PHONE   = process.env.NEXT_PUBLIC_BUSINESS_PHONE   || null; // e.g. +233240000000
const WHATSAPP_NUMBER  = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER  || null; // e.g. 233240000000
const INSTAGRAM_URL    = process.env.NEXT_PUBLIC_INSTAGRAM_URL    || "https://instagram.com/chefapedofoods";
const TIKTOK_URL       = process.env.NEXT_PUBLIC_TIKTOK_URL       || "https://tiktok.com/@chefapedofoods";
const SNAPCHAT_URL     = process.env.NEXT_PUBLIC_SNAPCHAT_URL     || "https://snapchat.com/add/chefapedofoods";


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
              Authentic Ghanaian home cooking. Small morning batches prepared fresh daily with local aromatics and delivered piping hot across Legon and Accra.
            </p>
            <div className="text-[11px] text-white/50 space-y-1 pt-1 font-medium">
              <p>📍 Operational Base: South Legon Drive 6a, Accra</p>
              <p>✉️ <a href="mailto:hello@chefapedofoods.com" className="hover:text-brand-yellow transition-colors">hello@chefapedofoods.com</a></p>
            </div>
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
              <li>
                <Link href="/legal/privacy" className="hover:text-brand-yellow transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-brand-yellow transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/legal/refunds" className="hover:text-brand-yellow transition-colors">
                  Refund Policy
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
                  <span className="text-white font-bold">Orders Open:</span> {ORDERING_HOURS_DISPLAY.opensAt}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-red mt-0.5 flex-none" />
                <div>
                  <span className="text-brand-yellow font-bold">Lunch Cutoff:</span> {ORDERING_HOURS_DISPLAY.sameDayCutoff}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-yellow mt-0.5 flex-none" />
                <div>
                  <span className="text-white font-bold">First Dispatch:</span> From {ORDERING_HOURS_DISPLAY.firstDeliverySlot}
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
                1. Food Total: <span className="text-white font-normal">Prepaid securely online (Hubtel MoMo / Card)</span>
              </div>
              <div className="text-brand-yellow font-bold">
                2. Delivery Fee: <span className="text-white font-normal">Paid directly to rider upon arrival</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 gap-6">
          {/* Left: Copyright & Legal */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <p className="text-white/50 text-xs sm:text-sm">
              © 2026 Chef Apedo Foods. All rights reserved.
            </p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <Link href="/legal/privacy" className="hover:text-brand-yellow transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link href="/legal/terms" className="hover:text-brand-yellow transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link href="/legal/refunds" className="hover:text-brand-yellow transition-colors">
                Refunds
              </Link>
            </div>
          </div>

          {/* Center: Social & Contact Icons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Phone — shown only when NEXT_PUBLIC_BUSINESS_PHONE is set */}
            {BUSINESS_PHONE && (
              <a
                href={`tel:${BUSINESS_PHONE}`}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full text-white/60 hover:text-brand-yellow hover:bg-white/5 transition-colors"
                aria-label="Call Chef Apedo Foods"
              >
                <Phone size={20} />
              </a>
            )}

            {/* WhatsApp — shown only when NEXT_PUBLIC_WHATSAPP_NUMBER is set */}
            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Chef Apedo Foods!")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full text-white/60 hover:text-brand-yellow hover:bg-white/5 transition-colors"
                aria-label="Chat with Chef Apedo Foods on WhatsApp"
              >
                <MessageSquare size={20} />
              </a>
            )}

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full text-white/60 hover:text-brand-yellow hover:bg-white/5 transition-colors"
              aria-label="Follow Chef Apedo Foods on Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* TikTok */}
            <a
              href={TIKTOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full text-white/60 hover:text-brand-yellow hover:bg-white/5 transition-colors"
              aria-label="Follow Chef Apedo Foods on TikTok"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.39-2.92 5.76-1.75 1.36-4.11 1.76-6.19 1.13-2.07-.62-3.79-2.09-4.57-4.08-.78-1.99-.58-4.32.53-6.16 1.1-1.83 2.99-3.03 5.09-3.32.25-.03.49-.04.74-.04v4.06c-1.39.06-2.73.91-3.32 2.18-.59 1.28-.46 2.87.35 4.02.82 1.14 2.3 1.72 3.69 1.42 1.39-.3 2.5-1.47 2.84-2.85.19-.77.16-1.57.16-2.36V.02h2.98z"/>
              </svg>
            </a>

            {/* Snapchat */}
            <a
              href={SNAPCHAT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2.5 rounded-full hover:bg-white/5 transition-colors"
              aria-label="Add Chef Apedo Foods on Snapchat"
            >
              <Image
                src="/snap-logo.png"
                alt="Snapchat"
                width={24}
                height={24}
                className="rounded-full object-contain"
                unoptimized
              />
            </a>
          </div>

          {/* Right: Tagline */}
          <p className="text-brand-yellow text-sm font-black tracking-widest md:text-right">
            GHANAIAN FOOD. MADE TO ORDER. • ACCRA, GHANA
          </p>
        </div>
      </div>
    </footer>
  );
}
