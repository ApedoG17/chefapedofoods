import Link from "next/link";
import { UtensilsCrossed } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col items-center justify-center p-6 text-center selection:bg-brand-yellow selection:text-brand-dark">
      <div className="w-20 h-20 bg-brand-yellow/20 text-brand-dark rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-yellow/30">
        <UtensilsCrossed size={38} className="stroke-[2.5] text-brand-red" />
      </div>
      <h1 className="text-3xl sm:text-4xl font-black uppercase text-brand-dark mb-4 tracking-tight">
        Plate Not Found
      </h1>
      <p className="text-brand-dark/70 font-medium max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        We can&apos;t find the page you&apos;re looking for. It might have been moved, or the link is broken.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center bg-brand-dark text-brand-yellow font-black uppercase tracking-wider py-4 px-8 rounded-full hover:bg-brand-dark/90 transition-all shadow-button-yellow hover:-translate-y-0.5"
      >
        Back to Menu
      </Link>
    </div>
  );
}
