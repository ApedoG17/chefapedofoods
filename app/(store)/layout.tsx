"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "@/components/ui/TopNav";
import { Footer } from "@/components/ui/Footer";
import { useCart } from "@/lib/cart/store";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { itemCount } = useCart();

  // Confirmation and tracking screens drop top nav for focus per docs/COMPONENTS.md
  const isFocusScreen =
    pathname.startsWith("/orders/") || pathname.includes("/confirmation");

  const isHomePage = pathname === "/";

  return (
    <div className="min-h-screen w-full bg-brand-espresso text-ink flex flex-col selection:bg-brand-gold selection:text-brand-espresso">
      {!isFocusScreen && <TopNav cartItemCount={itemCount} showCart={true} />}

      <div
        className={
          isHomePage
            ? "flex-1 w-full"
            : "flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-8"
        }
      >
        {children}
      </div>

      {!isFocusScreen && <Footer />}
    </div>
  );
}
