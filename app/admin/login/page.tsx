"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { WarningBox } from "@/components/ui/WarningBox";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        setErrorMsg(error.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (data.session) {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      console.error("Login unexpected error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex flex-col justify-center max-w-sm mx-auto">
      <div>
        <p className="text-[10px] tracking-[0.14em] uppercase text-gold font-medium mb-1">
          Chef Apedo Foods
        </p>
        <h1 className="font-serif font-semibold text-[24px] text-ink mb-1">
          Admin Login
        </h1>
        <p className="text-[12.5px] text-ink-dim mb-4">
          Kitchen operations &amp; order lifecycle management.
        </p>
      </div>

      {errorMsg && (
        <WarningBox className="mb-4">{errorMsg}</WarningBox>
      )}

      <Card>
        <form onSubmit={handleLogin} className="space-y-3">
          <FormField
            label="Email"
            type="email"
            placeholder="chef@chefapedofoods.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? "Authenticating…" : "Login"}
          </Button>

          <p className="text-[11px] text-ink-dim leading-relaxed pt-2">
            No customer accounts exist in MVP — this login is strictly for the chef and kitchen administration.
          </p>
        </form>
      </Card>
    </main>
  );
}
