"use client";

import React, { useState } from "react";
import { useCookWiseStore } from "@/store";
import { ShoppingBag, CheckSquare, Square, RefreshCw, Printer } from "lucide-react";

export default function GroceryList() {
  const { groceryList, loadingWeeklyPlan, fetchGroceryList } = useCookWiseStore();
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (name: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  // Group items by category
  const categories: Record<string, typeof groceryList> = {};
  groceryList.forEach((item) => {
    const cat = item.category || "Other";
    if (!categories[cat]) {
      categories[cat] = [];
    }
    categories[cat].push(item);
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass p-6 rounded-aurora w-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-accent" />
          Smart Grocery List
        </h2>
        
        {groceryList.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => fetchGroceryList()}
              className="p-1.5 rounded-lg bg-aurora-card border border-aurora-border text-text-secondary hover:text-text-primary transition cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-aurora-card border border-aurora-border text-text-secondary hover:text-text-primary transition cursor-pointer"
              title="Print List"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {loadingWeeklyPlan ? (
        <div className="text-center py-10 text-xs text-text-secondary flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Compiling missing ingredients...
        </div>
      ) : groceryList.length === 0 ? (
        <div className="text-center py-10 border border-dashed border-aurora-border rounded-2xl text-xs text-text-secondary">
          No missing ingredients. Either your pantry is fully stocked, or you haven't generated a meal plan yet!
        </div>
      ) : (
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-1">
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-xs font-bold text-accent uppercase tracking-wider pl-1">{category}</h3>
              <div className="space-y-1.5">
                {items.map((item) => {
                  const isChecked = !!checkedItems[item.name];
                  return (
                    <div
                      key={item.name}
                      onClick={() => toggleItem(item.name)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-emerald-950/5 border-emerald-900/10 text-text-secondary line-through opacity-60"
                          : "bg-aurora-card/40 border-white/5 text-text-primary hover:bg-aurora-card/60 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isChecked ? (
                          <CheckSquare className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                        ) : (
                          <Square className="w-4.5 h-4.5 text-text-secondary shrink-0" />
                        )}
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                      <span className={`text-xs font-semibold ${isChecked ? "text-text-secondary" : "text-text-secondary"}`}>
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
