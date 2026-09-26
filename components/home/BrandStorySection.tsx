import React from "react";
import { Flame, Clock, Sparkles, ShieldCheck, Heart } from "lucide-react";

export function BrandStorySection() {
  const pillars = [
    {
      icon: <Flame className="w-6 h-6 text-brand-yellow" />,
      title: "Never Mass-Produced",
      description:
        "We cook in small, artisanal batches every single morning so every grain and protein absorbs authentic, fire-simmered seasoning.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-brand-gold-soft" />,
      title: "Real Ghanaian Aromatics",
      description:
        "No generic artificial powders. We grind fresh ginger, garlic, rosemary, and local chili peppers into our slow-cooked tomato base.",
    },
    {
      icon: <Clock className="w-6 h-6 text-brand-yellow" />,
      title: "Piped Hot For Lunch",
      description:
        "Our kitchen prepares your meal right before your delivery window, ensuring it arrives steaming hot at your home or office.",
    },
  ];

  return (
    <section className="w-full bg-brand-red text-ink py-20 sm:py-28 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-brand-red-dark/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/20 text-brand-yellow text-xs font-bold tracking-widest uppercase mb-4 border border-white/10">
            <Heart className="w-3.5 h-3.5 fill-brand-yellow" />
            <span>The Chef&apos;s Promise</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink leading-tight tracking-tight mb-6">
            Small batch cooking. <br />
            <span className="italic font-light text-brand-yellow">
              Big Accra flavors.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-ink/90 leading-relaxed max-w-2xl mx-auto font-normal">
            Chef Apedo Foods was born from a simple belief: Accra deserves real,
            home-cooked Ghanaian meals prepared with patience and genuine care,
            not mass-produced fast food.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-black/20 backdrop-blur-sm border border-white/15 rounded-3xl p-8 hover:bg-black/30 transition-colors duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-inner">
                  {pillar.icon}
                </div>
                <h3 className="font-serif font-bold text-xl text-ink mb-3">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink/80 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-semibold text-brand-yellow">
                <ShieldCheck className="w-4 h-4" />
                <span>100% Quality Guaranteed</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quote banner */}
        <div className="mt-16 p-8 rounded-3xl bg-brand-espresso/60 border border-white/10 text-center max-w-3xl mx-auto backdrop-blur-md">
          <p className="font-serif italic text-lg sm:text-xl text-brand-gold-soft mb-3">
            &ldquo;Food is memory, comfort, and culture. When you open a box from Chef Apedo Foods, you should feel right at home.&rdquo;
          </p>
          <div className="text-xs font-semibold uppercase tracking-widest text-ink-dim">
            — Chef Godwin Apedo · Accra, Ghana
          </div>
        </div>
      </div>
    </section>
  );
}
