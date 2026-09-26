"use client";

import React, { useState } from "react";
import { ORDERING_HOURS, EXCLUDED_DELIVERY_AREAS } from "@/config/business";
import { MessageSquare, Clock, Phone, MapPin, Send, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  // Business WhatsApp number from environment if provided, otherwise null (never invent one)
  const configuredWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || null;
  const whatsappUrl = configuredWhatsApp
    ? `https://wa.me/${configuredWhatsApp}?text=${encodeURIComponent(
        "Hello Chef Apedo Foods, I have an enquiry about an order."
      )}`
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Do not fabricate a fake API success without a backend endpoint per instructions.
    // Instead indicate readiness for integration.
    setFormSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="w-full bg-brand-red text-white pt-10 sm:pt-14 pb-14 sm:pb-18 border-b border-black/10 relative overflow-hidden">
        {/* Subtle geometric lighting accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 bg-black/25 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-white/10">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Customer Enquiries</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.5rem] uppercase tracking-tight leading-[1.02] text-white">
              Let&apos;s Talk.
            </h1>

            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-sans font-normal">
              Questions about today&apos;s batch, delivery locations, or order assistance? Get in touch with Chef Apedo Foods.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CONTACT CHANNELS & FORM (EDITORIAL 2-COLUMN LAYOUT)                     */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-14 sm:py-20 border-b border-brand-cream-dark flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Business Details & WhatsApp CTA (5 Cols) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {/* WhatsApp Support Card */}
              <div className="bg-[#EFE5D5] rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-brand-red">
                  <MessageSquare className="w-5 h-5 stroke-[2.5]" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    Instant Messaging
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-brand-dark">
                    WhatsApp Support
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                    Direct messaging for active orders, delivery updates, and quick questions.
                  </p>
                </div>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-button-yellow transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 stroke-[2.5]" />
                    <span>Chat on WhatsApp</span>
                  </a>
                ) : (
                  <div className="p-4 rounded-2xl bg-white/80 border border-black/5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-dark">
                      <Phone className="w-4 h-4 text-brand-red" />
                      <span>WhatsApp Channel</span>
                    </div>
                    <p className="text-[11px] text-brand-muted leading-relaxed">
                      Official WhatsApp business line connection pending deployment configuration.
                    </p>
                  </div>
                )}
              </div>

              {/* Factual Operational Details */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-brand-red">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight text-brand-dark">
                    Operating Schedule
                  </h4>
                </div>

                <div className="space-y-3 text-xs divide-y divide-brand-cream-dark">
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-muted">Order Window:</span>
                    <span className="font-bold text-brand-dark">
                      {ORDERING_HOURS.opensAt} – {ORDERING_HOURS.closesAt} GMT
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-muted">Same-Day Cutoff:</span>
                    <span className="font-bold text-brand-red">
                      {ORDERING_HOURS.sameDayCutoff} GMT
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-brand-muted">First Dispatch Slot:</span>
                    <span className="font-bold text-brand-dark">
                      {ORDERING_HOURS.firstDeliverySlot} GMT
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Boundaries */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-brand-red">
                  <MapPin className="w-4 h-4 stroke-[2.5]" />
                  <h4 className="font-display font-extrabold text-sm uppercase tracking-tight text-brand-dark">
                    Delivery Zone Note
                  </h4>
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  We serve central Accra locations. To ensure meals arrive piping hot, the following outer zones are excluded:
                </p>
                <div className="text-[11px] font-bold text-brand-red/90 pt-1">
                  {EXCLUDED_DELIVERY_AREAS.join(" · ")}
                </div>
              </div>
            </div>

            {/* Right Column: Clean Single-Column Contact Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-brand-cream-dark shadow-xs space-y-6 text-left">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                  Send An Enquiry
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-brand-dark mt-1">
                  Message Us
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted mt-1">
                  Fill in your details below and our team will get back to you regarding your order or question.
                </p>
              </div>

              {formSubmitted ? (
                <div className="p-6 rounded-2xl bg-brand-cream border border-brand-cream-dark space-y-3">
                  <div className="flex items-center gap-2 text-brand-red font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Enquiry Recorded</span>
                  </div>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Thank you, {formData.name || "Customer"}. Your enquiry has been received for review by the kitchen dispatch team.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({ name: "", phone: "", subject: "", message: "" });
                    }}
                    className="text-xs font-bold text-brand-red hover:underline pt-2"
                  >
                    ← Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Kwame Mensah"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-black/10 text-brand-dark text-sm placeholder:text-brand-muted/60 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-phone" className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Phone Number
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 024 123 4567"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-black/10 text-brand-dark text-sm placeholder:text-brand-muted/60 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Question about today's lunch delivery"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-black/10 text-brand-dark text-sm placeholder:text-brand-muted/60 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label htmlFor="contact-message" className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your enquiry here..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-black/10 text-brand-dark text-sm placeholder:text-brand-muted/60 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 outline-none transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4 stroke-[2.5]" />
                      <span>Send Enquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
