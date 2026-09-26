"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowRight, Sparkles } from "lucide-react";

export interface TopNavProps {
  cartItemCount?: number;
  showCart?: boolean;
}

export function TopNav({ cartItemCount = 0, showCart = true }: TopNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on page transition
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { label: "Menu", href: "/menu" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About", href: "/about" },
    { label: "Delivery", href: "/delivery-info" },
  ];

  return (
    <header className="sticky top-2 sm:top-4 z-50 px-3 sm:px-6 w-full max-w-7xl mx-auto transition-all duration-300">
      <div
        className={`w-full rounded-full transition-all duration-300 ${
          isScrolled
            ? "glass-nav py-2.5 px-4 sm:px-6 shadow-2xl border border-white/10"
            : "glass-nav py-3.5 px-5 sm:px-7 shadow-lg border border-white/10"
        } flex items-center justify-between`}
      >
        {/* Brand Emblem */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-left transition-transform duration-200 active:scale-95"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-red to-brand-gold flex items-center justify-center text-ink font-serif font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CA
          </div>
          <div>
            <div className="font-serif font-bold text-base sm:text-lg text-ink tracking-tight flex items-center gap-1.5 leading-none">
              Chef Apedo
              <span className="text-[9px] font-sans font-semibold uppercase tracking-widest text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-full border border-brand-gold/20">
                Foods
              </span>
            </div>
            <div className="text-[10px] tracking-wider text-ink-dim uppercase hidden sm:block">
              Accra · Homemade Fresh
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 text-xs lg:text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? "bg-white/10 text-brand-gold shadow-sm"
                    : "text-ink-dim hover:text-ink hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          {showCart && (
            <Link
              href="/cart"
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                cartItemCount > 0
                  ? "bg-brand-gold text-brand-espresso font-semibold shadow-gold-glow hover:bg-brand-gold-soft active:scale-95"
                  : "bg-surface2 text-ink-dim border border-line hover:text-ink hover:border-brand-gold/40"
              }`}
              aria-label={`Cart with ${cartItemCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="bg-brand-espresso text-brand-gold px-1.5 py-0.2 text-[11px] font-bold rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}

          <Link
            href="/menu"
            className="hidden sm:inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-red to-brand-red-dark hover:from-brand-red-light hover:to-brand-red text-ink font-semibold text-xs sm:text-sm px-4 py-2 rounded-full shadow-red-glow transition-all duration-200 active:scale-95 border border-white/10"
          >
            <span>Order Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-ink-dim hover:text-ink rounded-full bg-white/5 border border-white/5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 p-4 rounded-3xl glass-nav border border-white/10 shadow-2xl space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-white/10 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-line/60">
            <Link
              href="/menu"
              className="flex items-center justify-center gap-2 w-full bg-brand-gold text-brand-espresso font-semibold py-3 rounded-2xl shadow-gold-glow"
            >
              <Sparkles className="w-4 h-4" />
              <span>Order Today&apos;s Lunch</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
