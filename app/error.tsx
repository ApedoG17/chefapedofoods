"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col items-center justify-center p-6 text-center selection:bg-brand-yellow selection:text-brand-dark">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-brand-cream-dark shadow-sm space-y-4">
        <div className="w-16 h-16 bg-brand-red/10 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={36} className="text-brand-red stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase text-brand-dark tracking-tight">
          Something went wrong
        </h2>
        <p className="text-sm font-medium text-brand-dark/70 max-w-sm mx-auto leading-relaxed">
          Our kitchen encountered a technical issue. Don&apos;t worry, no data was lost.
        </p>
        <div className="pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-black uppercase tracking-wider py-4 px-8 rounded-full transition-all shadow-button-yellow hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
