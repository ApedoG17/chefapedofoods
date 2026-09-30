"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import { SplashSequence } from "@/components/SplashSequence";
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
    pathname.startsWith("/delivery") ||
    pathname.startsWith("/about") ||
    pathname.startsWith("/contact") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/order/") ||
    pathname.startsWith("/orders/") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/cart");

  return (
    <div className="relative min-h-screen w-full bg-brand-dark text-white flex flex-col selection:bg-brand-yellow selection:text-brand-dark overflow-x-hidden">
      <SplashSequence />
      {!isFocusScreen && <Navbar />}

      <div
        className={
          pathname === "/"
            ? "flex-1 w-full"
            : isFullWidthPage
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
