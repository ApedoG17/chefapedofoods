"use client";

import { useEffect, useState } from "react";
import { formatGHS } from "@/lib/pricing";

export interface CartItem {
  id: string;
  mealId: string;
  mealName: string;
  size: "small" | "medium" | "large";
  sizeLabel: string;
  basePricePesewas: number;
  includedProteinPackageName: string;
  extras: {
    chicken?: number;
    sausage?: number;
    egg?: number;
    fish?: number;
  };
  quantity: number;
  itemSubtotalPesewas: number;
}

const CART_STORAGE_KEY = "chef_apedo_cart_v1";

export function getCartItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("chef-apedo-cart-updated"));
  } catch (e) {
    console.error("Failed to save cart to localStorage", e);
  }
}

export function addToCart(item: CartItem): void {
  const current = getCartItems();
  const updated = [...current, item];
  saveCartItems(updated);
}

export function removeFromCart(itemId: string): void {
  const current = getCartItems();
  const updated = current.filter((i) => i.id !== itemId);
  saveCartItems(updated);
}

export function clearCart(): void {
  saveCartItems([]);
}

export function getCartSubtotalPesewas(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.itemSubtotalPesewas, 0);
}

/**
 * React hook to subscribe to cart updates across client components.
 */
export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(getCartItems());
    setIsLoaded(true);

    const handleUpdate = () => {
      setItems(getCartItems());
    };

    window.addEventListener("chef-apedo-cart-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("chef-apedo-cart-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const subtotalPesewas = getCartSubtotalPesewas(items);

  return {
    items,
    isLoaded,
    subtotalPesewas,
    subtotalFormatted: formatGHS(subtotalPesewas),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    addItem: addToCart,
    removeItem: removeFromCart,
    clearCart,
  };
}
