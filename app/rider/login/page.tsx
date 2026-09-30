"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bike, ArrowRight } from "lucide-react";

export default function RiderLogin() {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rider/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Rider not found. Contact Admin.");
      } else {
        // Store rider identity locally for fast mobile access
        localStorage.setItem("chef_apedo_rider", JSON.stringify(data.rider));
        router.push("/rider");
      }
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col justify-center items-center p-6 text-white">
      <div className="w-full max-w-sm bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 border border-brand-yellow/20 flex items-center justify-center text-brand-yellow mb-5">
          <Bike className="w-6 h-6 stroke-[2.5]" />
        </div>

        <h1 className="text-2xl font-black text-white uppercase tracking-wider mb-1 font-display">
          Rider Portal
        </h1>
        <p className="text-xs text-white/50 mb-8 font-medium">
          Enter your registered Ghana phone number to access your deliveries.
        </p>

        {error && (
          <div className="mb-5 p-3.5 bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-bold rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 0241234567"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all placeholder:text-white/20 text-sm"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !phone.trim()}
            className="w-full bg-brand-yellow hover:bg-brand-yellow-dark text-[#18110E] font-black uppercase tracking-wider py-4 rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-button-yellow text-sm"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Access Portal</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <p className="text-[11px] text-white/40">
            Chef Apedo Foods · Courier Logistics Network
          </p>
        </div>
      </div>
    </div>
  );
}
