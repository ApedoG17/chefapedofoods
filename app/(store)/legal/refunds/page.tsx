import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Chef Apedo Foods",
  description: "Refund policy and cancellation parameters for Chef Apedo Foods.",
};

export default function RefundPolicy() {
  return (
    <div className="w-full min-h-[70vh] bg-brand-cream text-brand-dark py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border border-black/5 shadow-xs space-y-6">
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-brand-dark tracking-tight">Refund Policy</h1>
        <p className="text-sm font-bold text-brand-muted">Last Updated: September 2026</p>
        
        <p className="text-brand-dark/80 leading-relaxed text-sm sm:text-base">
          Because our products are perishable food items prepared to order, we do not accept returns. However, we are committed to top-tier quality.
        </p>
        <ul className="list-disc pl-5 space-y-3 text-brand-dark/80 text-sm sm:text-base leading-relaxed">
          <li>
            <strong className="text-brand-dark font-bold">Missing or Incorrect Items:</strong> If your order is missing an item or is entirely incorrect, contact our admin line within 30 minutes of delivery for a replacement or partial refund.
          </li>
          <li>
            <strong className="text-brand-dark font-bold">Cancellations:</strong> You may cancel your order for a full refund only if the kitchen has not yet begun the &quot;Preparing&quot; phase. Once food is on the grill, cancellations are not permitted.
          </li>
        </ul>
      </div>
    </div>
  );
}
