import React from "react";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Phone, Sparkles } from "lucide-react";

export default function ContactPage() {
  return (
    <main className="space-y-6 pb-20 max-w-2xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Customer Support</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
          Let&apos;s Connect
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          Questions about today&apos;s lunch, delivery coordination, or catering inquiries.
        </p>
      </div>

      <div className="bg-surface2/80 border border-line rounded-3xl p-6 shadow-md space-y-4">
        <div className="divide-y divide-line/60 text-xs sm:text-sm">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-ok/15 text-ok flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-medium text-ink">WhatsApp Support</span>
            </div>
            <a
              href="https://wa.me/233240000000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ok font-semibold border border-ok/40 px-3 py-1 rounded-full hover:bg-ok/10 transition-colors"
            >
              Direct Chat
            </a>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-gold/15 text-brand-gold flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-medium text-ink">Phone Line</span>
            </div>
            <a
              href="tel:+233240000000"
              className="text-xs text-brand-gold font-semibold border border-brand-gold/40 px-3 py-1 rounded-full hover:bg-brand-gold/10 transition-colors"
            >
              +233 24 000 0000
            </a>
          </div>

          <div className="flex justify-between items-center py-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-surface border border-line text-ink-dim flex items-center justify-center">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <span className="font-medium text-ink">Instagram</span>
            </div>
            <span className="text-xs text-ink-dim font-medium">
              @chefapedofoods
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-2xl bg-surface2/60 border border-brand-gold/20 text-xs text-ink-dim flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-brand-gold flex-none mt-0.5" />
        <p className="leading-relaxed">
          Order active right now? Message us on WhatsApp with your Order ID for instant dispatch and delivery updates.
        </p>
      </div>

      <div className="pt-2">
        <a
          href="https://wa.me/233240000000"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button variant="primary" className="w-full shadow-gold-glow py-3.5 font-bold flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Chat With Chef on WhatsApp</span>
          </Button>
        </a>
      </div>
    </main>
  );
}
