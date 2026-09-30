import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy & Cookie Policy | Chef Apedo Foods",
  description: "Learn how Chef Apedo Foods collects, processes, and protects customer data.",
};

export default function PrivacyPolicy() {
  return (
    <div className="w-full min-h-[70vh] bg-brand-cream text-brand-dark py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-black/5 shadow-xs space-y-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-brand-dark tracking-tight">Privacy &amp; Cookie Policy</h1>
        <p className="text-sm font-bold text-brand-muted">Last Updated: September 2026</p>
        
        <h2 className="text-xl font-bold uppercase mt-8 text-brand-dark tracking-wide">1. Data We Collect</h2>
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">To deliver your food on the University of Ghana campus, we collect essential data: your name, phone number, campus delivery location, and order history. We do not store your credit card or Mobile Money PINs; all financial processing is securely handled by Hubtel.</p>
        
        <h2 className="text-xl font-bold uppercase mt-8 text-brand-dark tracking-wide">2. How We Use Your Data</h2>
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">Your phone number is used exclusively for operational updates (dispatch notifications) and direct marketing related to Chef Apedo Foods. You can opt out of marketing broadcasts at any time.</p>
        
        <h2 className="text-xl font-bold uppercase mt-8 text-brand-dark tracking-wide">3. Cookies &amp; Tracking</h2>
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">We use essential functional cookies to keep you logged in via our database provider (Supabase) and to maintain your cart session. Because we currently only use strictly necessary cookies for the site to function, explicit cookie banners are not legally required under standard compliance frameworks, though we maintain transparency here.</p>
      </div>
    </div>
  );
}
