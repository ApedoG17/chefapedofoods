"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart/store";

export function Navbar() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const prevCountRef = useRef(itemCount);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Sprint 2 §2: Close mobile drawer when user scrolls (cleanup on unmount / close)
  useEffect(() => {
    if (!mobileOpen) return;
    const handleScroll = () => setMobileOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileOpen]);

  // Programmatic animation trigger for cart button scale pulse when item count increases
  useEffect(() => {
    if (itemCount > prevCountRef.current) {
      setCartPulse(true);
      const timer = setTimeout(() => setCartPulse(false), 350);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = itemCount;
  }, [itemCount]);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "Delivery", href: "/delivery" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <motion.header
      initial={{ x: "-50%", y: -40, opacity: 0 }}
      animate={{ x: "-50%", y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-4 sm:top-6 left-1/2 z-50 w-[95%] max-w-5xl rounded-full bg-[#FAF5EE]/85 backdrop-blur-md border border-white/50 shadow-md"
    >
      <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3">
        {/* Left Zone (Brand) */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 group transition-transform active:scale-98 flex-shrink-0"
          aria-label="Chef Apedo Foods Homepage"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shadow-xs transition-transform group-hover:scale-105 flex-shrink-0">
            <Image
              src="/images/chef_apedo_logo_variations/brand_mark_circle_yellow.png"
              alt="Chef Apedo Foods"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xs sm:text-base text-brand-dark tracking-tight uppercase leading-none">
              Chef Apedo
              <span className="text-brand-red ml-1 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                Foods
              </span>
            </span>
          </div>
        </Link>

        {/* Center Zone (Navigation - Desktop) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <motion.div key={link.href} whileHover={{ y: -2 }}>
                <Link
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-full text-xs lg:text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-black bg-black/5 font-bold"
                      : "text-black/70 hover:text-black hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Right Zone (The Cart Action + Mobile Menu Button) */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <motion.div
            animate={cartPulse ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Link
              id="global-cart-target"
              href="/cart"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-[11px] sm:text-xs uppercase tracking-wider shadow-xs transition-colors"
              aria-label={`Cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
              <span className="hidden xs:inline">Cart</span>
              {itemCount > 0 && (
                <span className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-brand-dark text-brand-yellow flex items-center justify-center text-[10px] sm:text-[11px] font-black">
                  {itemCount}
                </span>
              )}
            </Link>
          </motion.div>

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full text-brand-dark hover:bg-black/5 transition-colors focus:outline-none"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Menu className="w-5 h-5 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer / Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden absolute top-[calc(100%+8px)] left-0 right-0 bg-[#FAF5EE]/95 backdrop-blur-xl border border-white/60 shadow-lg rounded-3xl p-5 space-y-3"
          >
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "bg-brand-yellow text-brand-dark"
                      : "text-brand-dark hover:bg-black/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 border-t border-black/10">
              <Link
                href="/menu"
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-brand-yellow text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow"
              >
                <span>Order Today&apos;s Lunch</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
