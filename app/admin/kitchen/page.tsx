"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WarningBox } from "@/components/ui/WarningBox";

interface KitchenData {
  kitchenSettings: {
    id: string;
    open: boolean;
    daily_capacity: number;
    orders_today: number;
  };
  meals: { id: string; name: string; available: boolean }[];
  proteins: { id: string; name: string; available: boolean }[];
}

export default function AdminKitchenPage() {
  const [data, setData] = useState<KitchenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capacityInput, setCapacityInput] = useState<number>(12);

  const fetchKitchenData = async () => {
    try {
      const res = await fetch("/api/admin/kitchen");
      const json = await res.json();
      if (res.ok) {
        setData(json);
        if (json.kitchenSettings) {
          setCapacityInput(json.kitchenSettings.daily_capacity);
        }
      } else {
        setErrorMsg(json.error || "Failed to load kitchen settings");
      }
    } catch (e) {
      setErrorMsg("Failed to connect to kitchen controls");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKitchenData();
  }, []);

  const handleToggleKitchenOpen = async () => {
    if (!data?.kitchenSettings) return;
    setUpdating(true);
    const newOpen = !data.kitchenSettings.open;

    try {
      const res = await fetch("/api/admin/kitchen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenSettings: { open: newOpen },
        }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                kitchenSettings: { ...prev.kitchenSettings, open: newOpen },
              }
            : null
        );
      }
    } catch (e) {
      setErrorMsg("Failed to toggle kitchen status");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateCapacity = async () => {
    if (!data?.kitchenSettings) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/kitchen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenSettings: { daily_capacity: capacityInput },
        }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                kitchenSettings: {
                  ...prev.kitchenSettings,
                  daily_capacity: capacityInput,
                },
              }
            : null
        );
      }
    } catch (e) {
      setErrorMsg("Failed to update capacity");
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleMeal = async (mealId: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/kitchen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealId,
          available: !current,
        }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                meals: prev.meals.map((m) =>
                  m.id === mealId ? { ...m, available: !current } : m
                ),
              }
            : null
        );
      }
    } catch (e) {
      setErrorMsg("Failed to toggle meal availability");
    }
  };

  const handleToggleProtein = async (proteinId: string, current: boolean) => {
    try {
      const res = await fetch("/api/admin/kitchen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proteinId,
          available: !current,
        }),
      });
      if (res.ok) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                proteins: prev.proteins.map((p) =>
                  p.id === proteinId ? { ...p, available: !current } : p
                ),
              }
            : null
        );
      }
    } catch (e) {
      setErrorMsg("Failed to toggle protein availability");
    }
  };

  if (loading) {
    return <main className="py-12 text-center text-ink-dim">Loading kitchen controls…</main>;
  }

  const isOpen = data?.kitchenSettings?.open ?? true;
  const ordersToday = data?.kitchenSettings?.orders_today ?? 0;
  const capacity = data?.kitchenSettings?.daily_capacity ?? 12;
  const remaining = Math.max(0, capacity - ordersToday);

  return (
    <main className="space-y-4 pb-12">
      <div>
        <p className="text-[10px] tracking-[0.14em] uppercase text-gold font-medium mb-1">
          Operations
        </p>
        <h1 className="font-serif font-semibold text-[24px] text-ink mb-1">
          Kitchen Controls
        </h1>
        <p className="text-[12.5px] text-ink-dim">
          Master switch for ordering, daily capacity limit, and item stock levels.
        </p>
      </div>

      {errorMsg && <WarningBox>{errorMsg}</WarningBox>}

      {/* Kitchen Open/Close Master Switch */}
      <Card className="flex justify-between items-center py-4">
        <div>
          <div className="font-serif font-semibold text-[16px] text-ink">
            Kitchen Ordering
          </div>
          <div className="text-[12px] text-ink-dim mt-0.5">
            {isOpen ? "Currently accepting new orders" : "Kitchen closed — orders blocked"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleKitchenOpen}
          disabled={updating}
          className={`w-12 h-7 rounded-full border-2 p-0.5 transition-colors relative flex items-center ${
            isOpen ? "border-gold bg-gold/20" : "border-line bg-surface2"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full transition-transform ${
              isOpen ? "bg-gold translate-x-5" : "bg-ink-dim translate-x-0"
            }`}
          />
        </button>
      </Card>

      {/* Capacity Controls */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Daily Capacity
        </div>
        <div className="divide-y divide-line text-[13px]">
          <div className="flex justify-between py-2 items-center">
            <span className="text-ink">Daily Capacity Limit</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="50"
                value={capacityInput}
                onChange={(e) => setCapacityInput(parseInt(e.target.value) || 12)}
                className="w-16 bg-surface2 border border-line rounded px-2 py-1 text-center text-ink text-[13px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpdateCapacity}
                disabled={updating || capacityInput === capacity}
              >
                Save
              </Button>
            </div>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-ink">Orders Confirmed Today</span>
            <span className="text-ink font-semibold">{ordersToday}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-ink">Remaining Slots</span>
            <span className="text-gold font-semibold">{remaining}</span>
          </div>
        </div>
      </Card>

      {/* Meal Availability Toggles */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Meals Availability
        </div>
        <div className="divide-y divide-line text-[13px]">
          {data?.meals.map((meal) => (
            <div key={meal.id} className="flex justify-between items-center py-2.5">
              <span className="text-ink font-medium">{meal.name}</span>
              <button
                type="button"
                onClick={() => handleToggleMeal(meal.id, meal.available)}
                className="cursor-pointer"
              >
                <Badge variant={meal.available ? "ok" : "warn"}>
                  {meal.available ? "Available" : "Out of stock"}
                </Badge>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Protein Options Availability Toggles */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Proteins Availability
        </div>
        <div className="divide-y divide-line text-[13px]">
          {data?.proteins.map((protein) => (
            <div key={protein.id} className="flex justify-between items-center py-2.5">
              <span className="text-ink font-medium">{protein.name}</span>
              <button
                type="button"
                onClick={() => handleToggleProtein(protein.id, protein.available)}
                className="cursor-pointer"
              >
                <Badge variant={protein.available ? "ok" : "warn"}>
                  {protein.available ? "Available" : "Out of stock"}
                </Badge>
              </button>
            </div>
          ))}
        </div>
      </Card>
    </main>
  );
}
