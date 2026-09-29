'use client';

import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  ChefHat, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

interface MealSize {
  id: string;
  size: string;
  base_price_pesewas: number;
}

interface Meal {
  id: string;
  name: string;
  description?: string;
  available: boolean;
  meal_sizes?: MealSize[];
}

interface ProteinOption {
  id: string;
  name: string;
  additional_price_pesewas: number;
  available: boolean;
}

export default function MenuManagerPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [proteins, setProteins] = useState<ProteinOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meals' | 'proteins'>('meals');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/kitchen');
      if (res.ok) {
        const data = await res.json();
        setMeals(data.meals || []);
        setProteins(data.proteins || []);
      }
    } catch (err) {
      console.error('Failed to load menu data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleToggleMeal = async (mealId: string, currentStatus: boolean) => {
    setUpdatingId(mealId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, available: newStatus } : m))
    );

    try {
      const res = await fetch('/api/admin/kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, available: newStatus }),
      });
      if (!res.ok) {
        // Revert on failure
        setMeals((prev) =>
          prev.map((m) => (m.id === mealId ? { ...m, available: currentStatus } : m))
        );
      }
    } catch (e) {
      console.error('Failed to toggle meal:', e);
      setMeals((prev) =>
        prev.map((m) => (m.id === mealId ? { ...m, available: currentStatus } : m))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleProtein = async (proteinId: string, currentStatus: boolean) => {
    setUpdatingId(proteinId);
    const newStatus = !currentStatus;

    // Optimistic UI update
    setProteins((prev) =>
      prev.map((p) => (p.id === proteinId ? { ...p, available: newStatus } : p))
    );

    try {
      const res = await fetch('/api/admin/kitchen', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proteinId, available: newStatus }),
      });
      if (!res.ok) {
        setProteins((prev) =>
          prev.map((p) => (p.id === proteinId ? { ...p, available: currentStatus } : p))
        );
      }
    } catch (e) {
      console.error('Failed to toggle protein:', e);
      setProteins((prev) =>
        prev.map((p) => (p.id === proteinId ? { ...p, available: currentStatus } : p))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const availableMealsCount = meals.filter((m) => m.available).length;
  const availableProteinsCount = proteins.filter((p) => p.available).length;

  const filteredMeals = meals.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProteins = proteins.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Utensils className="text-brand-yellow" size={24} />
            <h2 className="text-2xl font-bold text-white">Menu &amp; Stock Manager</h2>
          </div>
          <p className="text-white/50 text-sm">
            Control live inventory availability for meals and protein combos in real-time.
          </p>
        </div>

        <button
          onClick={fetchMenu}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 self-start sm:self-auto"
        >
          <RotateCcw size={14} />
          <span>Refresh Menu</span>
        </button>
      </header>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center text-white/50 text-xs font-semibold mb-2">
            <span>MAIN PLATES</span>
            <ChefHat size={16} className="text-brand-yellow" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{availableMealsCount}</span>
            <span className="text-xs text-white/40">of {meals.length} available</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center text-white/50 text-xs font-semibold mb-2">
            <span>PROTEIN SELECTIONS</span>
            <Sparkles size={16} className="text-green-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{availableProteinsCount}</span>
            <span className="text-xs text-white/40">of {proteins.length} available</span>
          </div>
        </div>

        <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center text-white/50 text-xs font-semibold mb-2">
            <span>KITCHEN SYNC</span>
            <CheckCircle2 size={16} className="text-blue-400" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm font-bold text-white">Live Storefront Synced</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'meals'
                ? 'bg-brand-yellow text-[#18110E] shadow-[0_0_15px_rgba(255,184,0,0.25)]'
                : 'bg-[#141414] text-white/60 hover:text-white border border-white/5'
            }`}
          >
            Main Dishes ({meals.length})
          </button>
          <button
            onClick={() => setActiveTab('proteins')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'proteins'
                ? 'bg-brand-yellow text-[#18110E] shadow-[0_0_15px_rgba(255,184,0,0.25)]'
                : 'bg-[#141414] text-white/60 hover:text-white border border-white/5'
            }`}
          >
            Protein Options ({proteins.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-[#141414] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder:text-white/40 focus:border-brand-yellow outline-none w-full sm:w-64"
        />
      </div>

      {/* Main Tab: Meals */}
      {activeTab === 'meals' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-white/40">
              <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading menu items...</span>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="py-16 text-center text-white/40">No dishes found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`bg-[#141414] border rounded-2xl p-6 flex flex-col justify-between transition-all ${
                    meal.available
                      ? 'border-white/10 hover:border-brand-yellow/40'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base font-bold text-white">{meal.name}</h3>
                      <button
                        onClick={() => handleToggleMeal(meal.id, meal.available)}
                        disabled={updatingId === meal.id}
                        className={`relative w-12 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                          meal.available ? 'bg-green-500' : 'bg-white/20'
                        }`}
                        title={meal.available ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            meal.available ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-white/60 line-clamp-2">
                      {meal.description || 'Authentic Ghanaian lunch recipe prepared fresh daily.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                      Size &amp; Pricing
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {meal.meal_sizes && meal.meal_sizes.length > 0 ? (
                        meal.meal_sizes.map((s) => (
                          <span
                            key={s.id}
                            className="px-2 py-1 rounded-lg bg-white/5 text-[11px] font-mono text-white/80"
                          >
                            <span className="capitalize">{s.size}</span>:{' '}
                            <strong className="text-brand-yellow">
                              GH₵ {(s.base_price_pesewas / 100).toFixed(2)}
                            </strong>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-white/40">Standard combo base</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Second Tab: Proteins */}
      {activeTab === 'proteins' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-white/40">
              <div className="w-5 h-5 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <span>Loading proteins...</span>
            </div>
          ) : filteredProteins.length === 0 ? (
            <div className="py-16 text-center text-white/40">No protein options found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProteins.map((protein) => (
                <div
                  key={protein.id}
                  className={`bg-[#141414] border rounded-2xl p-5 flex items-center justify-between transition-all ${
                    protein.available
                      ? 'border-white/10 hover:border-brand-yellow/40'
                      : 'border-white/5 opacity-60'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-white text-sm">{protein.name}</h4>
                    <span className="text-xs text-brand-yellow font-mono">
                      {protein.additional_price_pesewas > 0
                        ? `+ GH₵ ${(protein.additional_price_pesewas / 100).toFixed(2)}`
                        : 'Included combo'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleProtein(protein.id, protein.available)}
                    disabled={updatingId === protein.id}
                    className={`relative w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                      protein.available ? 'bg-green-500' : 'bg-white/20'
                    }`}
                    title={protein.available ? 'Mark Out of Stock' : 'Mark In Stock'}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        protein.available ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
