"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
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
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/order/") ||
    pathname.includes("/confirmation");

  const isFullWidthPage =
    pathname === "/" ||
    pathname.startsWith("/menu") ||
    pathname.startsWith("/order/") ||
    pathname.startsWith("/orders/");

  return (
    <div className="min-h-screen w-full bg-brand-dark text-white flex flex-col selection:bg-brand-yellow selection:text-brand-dark">
      {!isFocusScreen && <Navbar />}

      <div
        className={
          isFullWidthPage
            ? "flex-1 w-full pt-14 sm:pt-18"
            : "flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-6 md:pb-8"
        }
      >
        {children}
      </div>

      {!isFocusScreen && <Footer />}
    </div>
  );
}
