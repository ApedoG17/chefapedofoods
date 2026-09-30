import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Chef Apedo Foods",
  description: "Terms of service and delivery protocols for Chef Apedo Foods campus delivery.",
};

export default function TermsOfService() {
  return (
    <div className="w-full min-h-[70vh] bg-brand-cream text-brand-dark py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-black/5 shadow-xs space-y-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-brand-dark tracking-tight">Terms of Service</h1>
        <p className="text-sm font-bold text-brand-muted">Last Updated: September 2026</p>
        
        <h2 className="text-xl font-bold uppercase mt-8 text-brand-dark tracking-wide">1. Order Fulfillment</h2>
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">All orders placed through Chef Apedo Foods are subject to kitchen availability and campus delivery operational hours. We reserve the right to cancel and fully refund any order we cannot fulfill.</p>
        
        <h2 className="text-xl font-bold uppercase mt-8 text-brand-dark tracking-wide">2. Delivery Protocols</h2>
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">Our riders will attempt to contact you upon arrival at your designated hostel or campus location. If you are unreachable after 10 minutes, the rider will return the food to the kitchen, and you will not be eligible for a refund.</p>
      </div>
    </div>
  );
}
