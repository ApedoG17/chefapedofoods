import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Sparkles, ArrowRight, Utensils, Sliders, CreditCard, Flame, Bike, Banknote } from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: 1,
      icon: <Utensils className="w-5 h-5 text-brand-gold" />,
      title: "Choose your meal",
      desc: "Select between our signature Jollof Rice, seasoned Fried Rice, or Plain Rice & rich Ghanaian stew.",
    },
    {
      num: 2,
      icon: <Sliders className="w-5 h-5 text-brand-gold" />,
      title: "Customize size & proteins",
      desc: "Pick Small (GH₵45), Medium (GH₵70), or Large (GH₵90). Your base price includes generous proteins (sausages, chicken, eggs). Add extras as you crave.",
    },
    {
      num: 3,
      icon: <CreditCard className="w-5 h-5 text-brand-gold" />,
      title: "Prepay food subtotal online",
      desc: "Pay securely with MTN MoMo, Telecel Cash, or Card via Paystack. Upfront prepayment guarantees your spot in our limited daily batch.",
    },
    {
      num: 4,
      icon: <Flame className="w-5 h-5 text-brand-red" />,
      title: "Small-batch morning cooking",
      desc: "We simmer each batch fresh from scratch in our Accra kitchen right before delivery so everything is piping hot.",
    },
    {
      num: 5,
      icon: <Bike className="w-5 h-5 text-brand-yellow" />,
      title: "Prompt midday dispatch",
      desc: "Our dispatch riders depart on dedicated routes to arrive at your selected delivery window (11:30 AM – 2:30 PM).",
    },
    {
      num: 6,
      icon: <Banknote className="w-5 h-5 text-ok" />,
      title: "Pay delivery fee to rider",
      desc: "Pay the standard delivery fee (starting from GH₵10) directly to the rider upon arrival with cash or MoMo.",
    },
  ];

  return (
    <main className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ordering Guide</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
          How Ordering Works
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          Six simple, transparent steps from our small-batch kitchen to your Accra doorstep.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((s) => (
          <div
            key={s.num}
            className="bg-surface2/80 border border-line rounded-3xl p-5 sm:p-6 shadow-md flex items-start gap-4 hover:border-brand-gold/30 transition-colors"
          >
            <div className="w-10 h-10 rounded-2xl bg-surface border border-line flex items-center justify-center flex-none shadow-inner">
              {s.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-gold">
                  Step 0{s.num}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-ink">
                {s.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <Link href="/menu">
          <Button
            variant="primary"
            className="w-full shadow-gold-glow py-3.5 font-bold flex items-center justify-center gap-2"
          >
            <span>Ready? Explore Today&apos;s Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
