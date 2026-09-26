"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on login page, don't show admin header
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink">
      {!isLoginPage && (
        <header className="border-b border-line bg-surface sticky top-0 z-20">
          <div className="max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                href="/admin/dashboard"
                className="font-serif font-semibold text-[16px] text-ink hover:text-gold transition-colors"
              >
                Chef Apedo <span className="text-gold text-[12px] uppercase tracking-wider font-sans font-normal ml-1">Admin</span>
              </Link>

              <nav className="flex items-center gap-3 text-[12px]">
                <Link
                  href="/admin/dashboard"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    pathname === "/admin/dashboard"
                      ? "bg-gold text-ink-on-cream font-medium"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    pathname.startsWith("/admin/orders")
                      ? "bg-gold text-ink-on-cream font-medium"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  Orders
                </Link>
                <Link
                  href="/admin/kitchen"
                  className={`px-2.5 py-1 rounded-full transition-colors ${
                    pathname === "/admin/kitchen"
                      ? "bg-gold text-ink-on-cream font-medium"
                      : "text-ink-dim hover:text-ink"
                  }`}
                >
                  Kitchen
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3 text-[12px]">
              <Link
                href="/"
                target="_blank"
                className="text-ink-dim hover:text-ink transition-colors"
              >
                Storefront ↗
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-warn text-[11px] border border-warn/40 hover:bg-warn/10 px-2 py-0.5 rounded transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="max-w-[430px] md:max-w-[900px] mx-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  );
}
