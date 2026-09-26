import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Sparkles, Heart, Flame, ShieldCheck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="space-y-8 pb-20 max-w-3xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red-light text-xs font-bold uppercase tracking-widest">
          <Heart className="w-3.5 h-3.5 fill-brand-red" />
          <span>Our Culinary Story</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
          About Chef Apedo Foods
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
          A passion for home-style Ghanaian cooking turned into Accra&apos;s most craved lunch service.
        </p>
      </div>

      {/* Hero Visual Card */}
      <div className="relative w-full h-[240px] sm:h-[300px] rounded-3xl overflow-hidden border border-line shadow-2xl bg-surface">
        <Image
          src="/images/meals/jollof-rice.jpg"
          alt="Chef Apedo Signature Cooking"
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="font-serif italic text-base sm:text-lg text-brand-gold-soft">
            &ldquo;We treat every pot of Jollof like it&apos;s being served to our own family.&rdquo;
          </p>
          <div className="text-[11px] uppercase tracking-wider text-ink-dim font-bold mt-1">
            — Chef Godwin Apedo
          </div>
        </div>
      </div>

      {/* Story Text */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-6 sm:p-8 shadow-md space-y-4 text-xs sm:text-sm text-ink leading-relaxed">
        <h2 className="font-serif font-bold text-xl text-ink">
          Crafted with Patience, Never Shortcuts
        </h2>
        <p className="text-ink-dim">
          Chef Apedo Foods was born from a desire to bring genuine, home-cooked Ghanaian flavor to busy people across Accra. In a city dominated by fast food and mass-catered lunches, we choose a different path: small, carefully timed morning batches where every grain of rice absorbs authentic spices and fresh herbs.
        </p>
        <p className="text-ink-dim">
          From sourcing our tomatoes and scotch bonnet peppers daily at local markets to slow-simmering our signature shito, we prioritize freshness and flavor above all else.
        </p>
      </div>

      {/* The 4 Promises */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-surface2/80 border border-line shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4 text-brand-red" />
            <span>Never Reheated</span>
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Every meal is cooked from scratch for that day&apos;s lunch cycle. Zero day-old food, zero microwave shortcuts.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface2/80 border border-line shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-yellow" />
            <span>Authentic Recipes</span>
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Traditional Ghanaian seasoning profiles with genuine garlic, ginger, rosemary, and authentic firewood aroma.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface2/80 border border-line shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-ok" />
            <span>Hygienic Standards</span>
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Strict kitchen cleanliness, premium packaging that retains heat, and sealed delivery bags.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-surface2/80 border border-line shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-brand-gold font-bold text-xs uppercase tracking-wider">
            <Heart className="w-4 h-4 text-brand-red" />
            <span>Made with Care</span>
          </div>
          <p className="text-xs text-ink-dim leading-relaxed">
            Passion in every portion. When you order from Chef Apedo Foods, you taste genuine home pride.
          </p>
        </div>
      </div>

      <div className="pt-2">
        <Link href="/menu">
          <Button
            variant="primary"
            className="w-full shadow-gold-glow py-3.5 font-bold flex items-center justify-center gap-2"
          >
            <span>Taste the Difference — View Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </main>
  );
}
