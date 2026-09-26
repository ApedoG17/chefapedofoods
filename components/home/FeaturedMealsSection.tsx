"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export function FeaturedMealsSection() {
  const categories = [
    {
      name: "Jollof Rice",
      label: "Smoky Tomato Base",
      bgClass: "bg-brand-red text-white",
      href: "/menu/jollof-rice",
      tag: "Daily Staple",
    },
    {
      name: "Fried Rice",
      label: "Seasoned Garden Veg",
      bgClass: "bg-brand-yellow text-brand-dark",
      href: "/menu/fried-rice",
      tag: "Daily Staple",
    },
    {
      name: "Plain Rice & Stew",
      label: "Slow-Braised Tomato Stew",
      bgClass: "bg-[#7A150F] text-white",
      href: "/menu/plain-rice-and-stew",
      tag: "Daily Staple",
    },
  ];

  const meals = [
    {
      id: "jollof-rice",
      name: "Jollof Rice",
      description: "Ghanaian-style smoky jollof rice prepared fresh each morning in small batches with real local aromatics.",
      price: "GH₵45.00",
      image: "/images/meals/jollof-rice.jpg",
    },
    {
      id: "fried-rice",
      name: "Fried Rice",
      description: "Ghanaian-style seasoned wok fried rice with crisp garden vegetables and tender seasonings.",
      price: "GH₵45.00",
      image: "/images/meals/fried-rice.jpg",
    },
    {
      id: "plain-rice-and-stew",
      name: "Plain Rice & Stew",
      description: "Fluffy steamed white jasmine rice served with Chef Apedo's authentic rich tomato and meat stew.",
      price: "GH₵45.00",
      image: "/images/meals/plain-rice-and-stew.jpg",
    },
  ];

  return (
    <section id="featured-menu" className="w-full bg-brand-cream text-brand-dark pt-16 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs uppercase font-extrabold tracking-[0.2em] text-brand-red">
            Today&apos;s Kitchen Selection
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-dark">
            Fresh, Hot &amp; Made To Crave.
          </h2>
          <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto">
            Choose your favorite base, select your portion size, and pick your included protein package.
          </p>
        </div>

        {/* 3 Color-Coded Category Highlight Blocks (Matching Reference Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`${cat.bgClass} rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 shadow-card-depth group`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] uppercase tracking-wider font-extrabold opacity-90">
                  {cat.tag}
                </span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
              <div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl leading-none uppercase mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs font-medium opacity-85">{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* 3 White Product Cards with Large Real Food Photography (Reference Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className="bg-white rounded-2xl p-6 border border-brand-cream-dark shadow-card-depth flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Image Frame */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-6 bg-brand-cream-dark">
                <Image
                  src={meal.image}
                  alt={meal.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 360px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Title & Description */}
              <div className="space-y-2 mb-6">
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark uppercase tracking-tight">
                  {meal.name}
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-2">
                  {meal.description}
                </p>
                <div className="text-[11px] text-brand-red font-semibold pt-1">
                  Includes protein package (Chicken, Sausage, or Eggs)
                </div>
              </div>

              {/* Price & Yellow Pill Button (Reference Image 2) */}
              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                    Starts at
                  </div>
                  <div className="font-display font-extrabold text-xl text-brand-dark">
                    {meal.price}
                  </div>
                </div>

                <Link
                  href={`/menu/${meal.id}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-colors shadow-button-yellow"
                >
                  <span>Customize</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
