"use client";

import React, { useEffect } from "react";
import { useCookWiseStore } from "@/store";
import { Sliders, IndianRupee, Clock, ChefHat, Sparkles } from "lucide-react";

const CUISINES = ["Indian", "Italian", "Chinese", "Mexican", "Mediterranean", "Japanese"];
const DIETARY_OPTIONS = ["Vegetarian", "Vegan", "Gluten Free", "Keto", "High Protein"];
const TIME_OPTIONS = ["Under 15 min", "Under 30 min", "Under 1 hour"];
const BUDGET_OPTIONS = [100, 300, 500, 1000];

export default function PreferencesPanel() {
  const { preferences, updatePreferences, fetchPreferences } = useCookWiseStore();

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const toggleCuisine = (cuisine: string) => {
    const active = preferences.cuisine || [];
    const updated = active.includes(cuisine)
      ? active.filter((c) => c !== cuisine)
      : [...active, cuisine];
    updatePreferences({ ...preferences, cuisine: updated });
  };

  const toggleDiet = (diet: string) => {
    const active = preferences.diet || [];
    const updated = active.includes(diet)
      ? active.filter((d) => d !== diet)
      : [...active, diet];
    updatePreferences({ ...preferences, diet: updated });
  };

  const selectTime = (time: string) => {
    updatePreferences({ ...preferences, time });
  };

  const selectBudget = (budget: number) => {
    updatePreferences({ ...preferences, budget });
  };

  return (
    <div className="glass p-6 rounded-aurora w-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
        <Sliders className="w-5 h-5 text-secondary" />
        AI Preferences
      </h2>

      {/* Cuisine Selector */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <ChefHat className="w-3.5 h-3.5" />
          Preferred Cuisines
        </h3>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map((cuisine) => {
            const isSelected = (preferences.cuisine || []).includes(cuisine);
            return (
              <button
                key={cuisine}
                onClick={() => toggleCuisine(cuisine)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                    : "bg-aurora-card text-text-secondary border-aurora-border hover:text-text-primary hover:border-text-secondary"
                }`}
              >
                {cuisine}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Selector */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Dietary Restrictions
        </h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((diet) => {
            const isSelected = (preferences.diet || []).includes(diet);
            return (
              <button
                key={diet}
                onClick={() => toggleDiet(diet)}
                className={`text-xs px-3.5 py-1.5 rounded-xl border font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                    : "bg-aurora-card text-text-secondary border-aurora-border hover:text-text-primary hover:border-text-secondary"
                }`}
              >
                {diet}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time and Budget Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Time Budget */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Cooking Time Limit
          </h3>
          <div className="flex flex-col gap-2">
            {TIME_OPTIONS.map((time) => {
              const isSelected = preferences.time === time;
              return (
                <button
                  key={time}
                  onClick={() => selectTime(time)}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border font-medium text-left transition cursor-pointer ${
                    isSelected
                      ? "bg-accent/10 text-accent border-accent/40"
                      : "bg-aurora-card/60 text-text-secondary border-aurora-border hover:text-text-primary hover:border-text-secondary"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* Financial Budget */}
        <div>
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <IndianRupee className="w-3.5 h-3.5" />
            Meal Budget Cap
          </h3>
          <div className="flex flex-col gap-2">
            {BUDGET_OPTIONS.map((budgetVal) => {
              const isSelected = preferences.budget === budgetVal;
              return (
                <button
                  key={budgetVal}
                  onClick={() => selectBudget(budgetVal)}
                  className={`text-xs px-3.5 py-2.5 rounded-xl border font-medium text-left transition flex justify-between items-center cursor-pointer ${
                    isSelected
                      ? "bg-accent/10 text-accent border-accent/40"
                      : "bg-aurora-card/60 text-text-secondary border-aurora-border hover:text-text-primary hover:border-text-secondary"
                  }`}
                >
                  <span>Under ₹{budgetVal}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping"></span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
