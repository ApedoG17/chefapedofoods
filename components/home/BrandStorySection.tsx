import React from "react";
import { Flame, Sparkles, Clock } from "lucide-react";

export function BrandStorySection() {
  const pillars = [
    {
      num: "01",
      icon: Flame,
      title: "Never Mass-Produced",
      description:
        "We cook in small, artisanal morning batches so every grain of rice and cut of protein absorbs authentic, fire-simmered seasoning.",
    },
    {
      num: "02",
      icon: Sparkles,
      title: "Real Ghanaian Aromatics",
      description:
        "Zero shortcuts. We grind fresh ginger, garlic, rosemary, and local chili peppers into our slow-cooked tomato stew base.",
    },
    {
      num: "03",
      icon: Clock,
      title: "Piped Hot For Midday",
      description:
        "Our kitchen times each batch directly to your scheduled delivery window, ensuring meals arrive piping hot at your desk.",
    },
  ];

  return (
    <section className="w-full bg-brand-dark text-white py-20 sm:py-28 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-yellow">
            The Kitchen Promise
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-tight text-white">
            Small Batch Cooking. <br />
            <span className="text-brand-yellow">Big Accra Flavors.</span>
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Chef Apedo Foods was born from a simple belief: Accra deserves real,
            home-cooked Ghanaian meals prepared with patience and genuine care.
          </p>
        </div>

        {/* 3 Pillars Grid with Visual Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.num}
                className="bg-brand-charcoal p-8 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-brand-yellow/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-display font-extrabold text-2xl text-brand-yellow">
                      {pillar.num}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-yellow">
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-white uppercase mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sprint 3 §3 → Video: autoplay, muted, looped, mobile-safe */}
        <div className="relative w-full h-[320px] sm:h-[420px] lg:h-[500px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/about-prep.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay for legibility of caption */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.2em]">
              Behind the Batch
            </p>
            <p className="text-white font-display font-black text-lg sm:text-xl uppercase tracking-wide leading-tight mt-0.5">
              Chef Apedo &mdash; East Legon Kitchen, Accra
            </p>
          </div>
        </div>

        {/* Founder Quote */}
        <div className="max-w-2xl mx-auto text-center pt-8 border-t border-white/10 space-y-3">
          <p className="font-serif italic text-base sm:text-xl text-white/90 leading-relaxed">
            &ldquo;When you open a box from Chef Apedo Foods, you should feel right at home with every single bite.&rdquo;
          </p>
          <div className="text-xs font-black uppercase tracking-widest text-brand-yellow">
            — Chef Godwin Apedo · Accra, Ghana
          </div>
        </div>
      </div>
    </section>
  );
}
