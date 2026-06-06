"use client";

import React, { useState } from "react";
import { useCookWiseStore } from "@/store";
import { Plus, X, Carrot, Milk, Egg, Flame, ShieldAlert, Sparkles } from "lucide-react";
import { Ingredient } from "@/types";

const SUGGESTED_INGREDIENTS = [
  { name: "Tomatoes", category: "Vegetables" },
  { name: "Onions", category: "Vegetables" },
  { name: "Garlic", category: "Vegetables" },
  { name: "Ginger", category: "Vegetables" },
  { name: "Rice", category: "Grains" },
  { name: "Pasta", category: "Grains" },
  { name: "Eggs", category: "Protein" },
  { name: "Chicken", category: "Protein" },
  { name: "Paneer", category: "Protein" },
  { name: "Milk", category: "Dairy" },
  { name: "Cheese", category: "Dairy" },
  { name: "Butter", category: "Dairy" },
  { name: "Spinach", category: "Vegetables" },
  { name: "Coriander", category: "Vegetables" },
  { name: "Olive Oil", category: "Pantry" },
  { name: "Salt", category: "Pantry" },
  { name: "Black Pepper", category: "Pantry" },
  { name: "Chili Powder", category: "Pantry" }
];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Vegetables: <Carrot className="w-4 h-4 text-emerald-400" />,
  Dairy: <Milk className="w-4 h-4 text-blue-400" />,
  Protein: <Egg className="w-4 h-4 text-amber-400" />,
  Grains: <Flame className="w-4 h-4 text-orange-400" />,
  Pantry: <Sparkles className="w-4 h-4 text-purple-400" />,
  Other: <ShieldAlert className="w-4 h-4 text-gray-400" />
};

export default function PantryEditor() {
  const { pantry, updatePantry, loadingPantry } = useCookWiseStore();
  const [inputValue, setInputValue] = useState("");
  const [category, setCategory] = useState("Vegetables");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("pcs");

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Check if already in pantry
    const nameLower = inputValue.trim().toLowerCase();
    if (pantry.some((item) => item.name.toLowerCase() === nameLower)) {
      setInputValue("");
      return;
    }

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: inputValue.trim(),
      category,
      quantity,
      unit
    };

    updatePantry([...pantry, newItem]);
    setInputValue("");
    setQuantity(1);
  };

  const handleAddSuggested = (item: { name: string; category: string }) => {
    if (pantry.some((p) => p.name.toLowerCase() === item.name.toLowerCase())) return;

    const newItem: Ingredient = {
      id: Date.now().toString(),
      name: item.name,
      category: item.category,
      quantity: 1,
      unit: item.category === "Grains" ? "cup" : "pcs"
    };

    updatePantry([...pantry, newItem]);
  };

  const handleRemove = (id?: string) => {
    if (!id) return;
    updatePantry(pantry.filter((item) => item.id !== id));
  };

  return (
    <div className="glass p-6 rounded-aurora w-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <Carrot className="w-5 h-5 text-accent" />
        Pantry Inventory
      </h2>

      {/* Custom Input Form */}
      <form onSubmit={handleAddCustom} className="mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Add ingredient (e.g. Potatoes)"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-[#09090B]/60 border border-aurora-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-primary transition"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#09090B]/60 border border-aurora-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary transition"
          >
            <option value="Vegetables">Vegetables</option>
            <option value="Protein">Protein</option>
            <option value="Dairy">Dairy</option>
            <option value="Grains">Grains</option>
            <option value="Pantry">Pantry / Spice</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-[#09090B]/60 border border-aurora-border rounded-lg px-2 py-1 w-1/2">
            <span className="text-xs text-text-secondary pl-1">Qty</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
              className="bg-transparent border-none text-text-primary text-sm focus:outline-none w-full text-center"
            />
          </div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-[#09090B]/60 border border-aurora-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary w-1/2 transition"
          >
            <option value="pcs">pcs</option>
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="cup">cup</option>
            <option value="tbsp">tbsp</option>
            <option value="tsp">tsp</option>
          </select>
          <button
            type="submit"
            disabled={loadingPantry}
            className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </form>

      {/* Suggested Quick Add Chips */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Quick Add Suggestions</h3>
        <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
          {SUGGESTED_INGREDIENTS.map((item, idx) => {
            const added = pantry.some((p) => p.name.toLowerCase() === item.name.toLowerCase());
            return (
              <button
                key={idx}
                onClick={() => handleAddSuggested(item)}
                disabled={added}
                className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1 transition-all cursor-pointer ${
                  added
                    ? "bg-emerald-950/20 text-emerald-500 border-emerald-900/40 pointer-events-none"
                    : "bg-aurora-card text-text-secondary border-aurora-border hover:text-text-primary hover:border-text-secondary"
                }`}
              >
                {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other}
                {item.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Ingredients list */}
      <div>
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Currently in Pantry ({pantry.length})
        </h3>
        
        {loadingPantry ? (
          <div className="text-center py-4 text-sm text-text-secondary">Loading pantry...</div>
        ) : pantry.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-aurora-border rounded-xl text-sm text-text-secondary">
            Your pantry is empty. Add ingredients to get started!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {pantry.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-aurora-card/60 border border-aurora-border hover:border-white/10 hover:bg-aurora-card/80 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                    {CATEGORY_ICONS[item.category] || CATEGORY_ICONS.Other}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text-primary">{item.name}</div>
                    <div className="text-[10px] text-text-secondary">
                      {item.quantity} {item.unit} • {item.category}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-text-secondary hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
