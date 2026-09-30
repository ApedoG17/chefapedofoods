"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { Star, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function FeedbackPage({
  params: initialParams,
}: {
  params?: { orderId?: string } | Promise<{ orderId?: string }>;
}) {
  const routeParams = useParams();
  const rawOrderId =
    (routeParams?.orderId as string) ||
    ((initialParams as any)?.orderId as string) ||
    "";

  const isInvalidOrderId = !rawOrderId || !UUID_REGEX.test(rawOrderId);

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const shortOrderId = !isInvalidOrderId
    ? rawOrderId.split("-")[0]?.toUpperCase()
    : "PENDING";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    if (isInvalidOrderId) {
      setError("Please open this feedback page from your active order confirmation or SMS link with your real order reference.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: rawOrderId,
          rating,
          customer_comment: comment.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit feedback.");
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-brand-yellow/20 text-brand-yellow rounded-full flex items-center justify-center mb-6 shadow-sm border border-brand-yellow/30">
          <Star size={40} className="fill-brand-yellow text-brand-yellow" />
        </div>
        <h1 className="text-3xl font-black uppercase text-brand-dark mb-2 font-display tracking-tight">
          Thank You!
        </h1>
        <p className="text-brand-muted font-medium text-sm leading-relaxed mb-8">
          Your rating and review go directly to our kitchen team to keep Chef Apedo Foods Ghanaian hot lunch service top-tier.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-black uppercase text-xs tracking-wider transition-all shadow-button-yellow"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto p-6 py-12">
      <div className="text-center mb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
          Customer Quality Loop
        </span>
        <h1 className="text-2xl sm:text-3xl font-black uppercase text-brand-dark mb-1 font-display tracking-tight mt-0.5">
          Rate Your Meal
        </h1>
        <p className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Order #{shortOrderId}
        </p>
      </div>

      {isInvalidOrderId && (
        <div className="mb-6 p-5 bg-brand-yellow/15 border border-brand-yellow/30 text-brand-dark rounded-2xl text-xs space-y-2">
          <div className="flex items-center justify-center gap-1.5 font-bold uppercase tracking-wider text-brand-dark">
            <AlertCircle size={16} className="text-brand-yellow-dark" />
            <span>Order Reference Required</span>
          </div>
          <p className="text-brand-muted text-[11px] leading-relaxed text-center">
            This rating loop is linked to verified campus orders. Please open the feedback link received via SMS or from your Order Status page (e.g. <code>/feedback/c00466bd...</code>).
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-brand-red/10 border border-brand-red/20 text-brand-red rounded-2xl text-xs font-bold text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-brand-cream-dark shadow-sm">
        {/* Star Rating Selector */}
        <div>
          <label className="block text-center text-xs font-black uppercase tracking-wider text-brand-dark mb-4">
            How was your food?
          </label>
          <div className="flex justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    setRating(star);
                    if (error) setError("");
                  }}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 sm:p-2 transition-transform hover:scale-115 cursor-pointer focus:outline-none"
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    size={38}
                    className={`transition-colors duration-150 ${
                      isFilled
                        ? "fill-brand-yellow text-brand-yellow drop-shadow-xs"
                        : "text-brand-cream-dark hover:text-brand-yellow/50"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="text-center mt-2 h-4">
            <span className="text-xs font-bold text-brand-dark/70 uppercase tracking-wider">
              {hoverRating === 5 || rating === 5
                ? "⭐⭐⭐⭐⭐ Outstanding!"
                : hoverRating === 4 || rating === 4
                ? "⭐⭐⭐⭐ Great!"
                : hoverRating === 3 || rating === 3
                ? "⭐⭐⭐ Good"
                : hoverRating === 2 || rating === 2
                ? "⭐⭐ Fair"
                : hoverRating === 1 || rating === 1
                ? "⭐ Needs Improvement"
                : ""}
            </span>
          </div>
        </div>

        {/* Comment field */}
        <div className="space-y-2 pt-2">
          <label className="block text-[11px] font-black uppercase tracking-wider text-brand-muted">
            Comments for the Chef (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="w-full bg-brand-cream/50 border border-brand-cream-dark rounded-2xl p-4 focus:border-brand-yellow focus:bg-white outline-none resize-none font-medium text-sm text-brand-dark placeholder:text-brand-muted/40 transition-all"
            placeholder="The jollof rice was hot and delicious, but..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-brand-dark hover:bg-black text-brand-yellow font-black uppercase tracking-wider py-4 rounded-full disabled:opacity-40 transition-all duration-200 shadow-sm cursor-pointer text-xs sm:text-sm"
        >
          {isSubmitting ? "Submitting Review..." : "Send Feedback"}
        </button>
      </form>
    </main>
  );
}
