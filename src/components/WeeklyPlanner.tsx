"use client";

import React, { useState, useEffect } from "react";
import { useCookWiseStore } from "@/store";
import { Calendar, RefreshCw, AlertTriangle, CheckCircle, IndianRupee, Sparkles, Plus, Trash2 } from "lucide-react";
import { Recipe, WeeklyPlan, DayPlan } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"] as const;

export default function WeeklyPlanner({ onViewRecipe }: { onViewRecipe: (recipe: Recipe) => void }) {
  const {
    weeklyPlan,
    budgetLimit,
    loadingWeeklyPlan,
    favorites,
    generateWeeklyPlan,
    fetchWeeklyPlan,
    updateMealPlan,
    updateBudgetLimit,
  } = useCookWiseStore();

  const [activeSlot, setActiveSlot] = useState<{ day: string; meal: "Breakfast" | "Lunch" | "Dinner" } | null>(null);

  useEffect(() => {
    fetchWeeklyPlan();
  }, [fetchWeeklyPlan]);

  // Deterministic Cost Engine
  const calculateRecipeCost = (recipe?: Recipe) => {
    if (!recipe || !recipe.ingredients) return 0;
    const cost = recipe.ingredients.reduce((total, ing) => {
      let base = 15;
      if (ing.category === "Protein") base = 40;
      else if (ing.category === "Dairy") base = 30;
      else if (ing.category === "Vegetables") base = 20;
      else if (ing.category === "Grains") base = 10;
      
      const qty = ing.quantity || 1;
      return total + (base * Math.min(qty, 2));
    }, 15);
    return Math.round(cost);
  };

  const calculateTotalPlanCost = () => {
    if (!weeklyPlan) return 0;
    let total = 0;
    Object.values(weeklyPlan).forEach((dayPlan) => {
      if (dayPlan.Breakfast) total += calculateRecipeCost(dayPlan.Breakfast);
      if (dayPlan.Lunch) total += calculateRecipeCost(dayPlan.Lunch);
      if (dayPlan.Dinner) total += calculateRecipeCost(dayPlan.Dinner);
    });
    return total;
  };

  const totalCost = calculateTotalPlanCost();
  const isOverBudget = totalCost > budgetLimit;

  const handleGenerate = () => {
    generateWeeklyPlan(true);
  };

  const handleSwapMeal = (recipe: Recipe) => {
    if (!activeSlot || !weeklyPlan) return;
    const { day, meal } = activeSlot;
    
    const updatedPlan = { ...weeklyPlan };
    updatedPlan[day] = {
      ...updatedPlan[day],
      [meal]: recipe,
    };

    updateMealPlan(updatedPlan);
    setActiveSlot(null);
  };

  const handleRemoveMeal = (day: string, meal: "Breakfast" | "Lunch" | "Dinner") => {
    if (!weeklyPlan) return;
    const updatedPlan = { ...weeklyPlan };
    // Create shallow copy of DayPlan
    updatedPlan[day] = {
      ...updatedPlan[day],
    };
    // Delete target meal key
    delete (updatedPlan[day] as any)[meal];

    updateMealPlan(updatedPlan);
  };

  return (
    <div className="glass p-6 rounded-aurora w-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Calendar className="w-5 h-5 text-accent" />
            Weekly Meal Planner
          </h2>
          <p className="text-xs text-text-secondary mt-1">Schedule your meals, manage nutritional flow, and control budget</p>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loadingWeeklyPlan}
          className="bg-primary hover:bg-primary-hover text-white text-sm px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 self-start md:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loadingWeeklyPlan ? "animate-spin" : ""}`} />
          {weeklyPlan ? "Regenerate AI Plan" : "Generate Weekly AI Plan"}
        </button>
      </div>

      {/* Budget Meter Card */}
      <div className="p-4 rounded-2xl bg-[#09090B]/60 border border-white/5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Cost vs Budget Status */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isOverBudget ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
          }`}>
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-text-secondary uppercase tracking-wider">Weekly Budget Meter</div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-text-primary">₹{totalCost}</span>
              <span className="text-xs text-text-secondary">estimated cost</span>
            </div>
          </div>
        </div>

        {/* Budget Limit Slider */}
        <div className="flex-1 max-w-xs space-y-1">
          <div className="flex justify-between text-xs font-semibold text-text-secondary">
            <span>Budget Cap</span>
            <span className="text-text-primary">₹{budgetLimit}</span>
          </div>
          <input
            type="range"
            min="300"
            max="3000"
            step="100"
            value={budgetLimit}
            onChange={(e) => updateBudgetLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* Budget Status Badge */}
        <div className={`px-4 py-2 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shrink-0 ${
          isOverBudget
            ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
        }`}>
          {isOverBudget ? (
            <>
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              Exceeds Budget
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Within Budget ✓
            </>
          )}
        </div>
      </div>

      {/* Grid Schedule */}
      {loadingWeeklyPlan ? (
        <div className="text-center py-20 text-sm text-text-secondary flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <span>Curating your personalized weekly recipe schedule...</span>
        </div>
      ) : !weeklyPlan ? (
        <div className="text-center py-20 border border-dashed border-aurora-border rounded-2xl flex flex-col items-center justify-center gap-4">
          <Sparkles className="w-12 h-12 text-primary animate-pulse-glow" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-text-primary">No Meal Plan Scheduled</h3>
            <p className="text-xs text-text-secondary max-w-sm">Tap the button above to let Gemini automatically build a 7-day culinary experience customized for you.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayPlan: DayPlan = weeklyPlan[day] || { Breakfast: null, Lunch: null, Dinner: null };
            return (
              <div
                key={day}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-aurora-card/30 border border-aurora-border/60 hover:border-white/5 transition"
              >
                {/* Day Label */}
                <div className="md:col-span-2 flex items-center md:border-r border-white/5 pr-2">
                  <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {day}
                  </h3>
                </div>

                {/* 3 Meals */}
                <div className="md:col-span-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {MEAL_TYPES.map((meal) => {
                    const recipe: Recipe | undefined = (dayPlan as any)[meal];
                    const cost = calculateRecipeCost(recipe);

                    return (
                      <div
                        key={meal}
                        className="p-3 rounded-xl border border-white/5 bg-[#09090B]/40 hover:bg-aurora-card/40 hover:border-white/10 transition flex flex-col justify-between group"
                      >
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-[9px] uppercase font-bold text-text-secondary tracking-wider">
                            {meal}
                          </span>
                          {recipe && (
                            <span className="text-[9px] font-semibold text-accent/80">
                              ₹{cost}
                            </span>
                          )}
                        </div>

                        {recipe ? (
                          <div className="flex-1 flex flex-col justify-between">
                            <h4
                              onClick={() => onViewRecipe(recipe)}
                              className="text-xs font-bold text-text-primary line-clamp-2 hover:text-primary transition cursor-pointer mb-2"
                            >
                              {recipe.title}
                            </h4>
                            <div className="flex items-center justify-between border-t border-white/5 pt-1.5 mt-auto">
                              <span className="text-[9px] text-text-secondary">
                                {recipe.cookingTime} min
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => setActiveSlot({ day, meal })}
                                  className="text-[9px] text-accent hover:underline font-semibold cursor-pointer"
                                >
                                  Swap
                                </button>
                                <span className="text-[9px] text-white/10">|</span>
                                <button
                                  onClick={() => handleRemoveMeal(day, meal)}
                                  className="text-[9px] text-rose-400 hover:text-rose-500 font-semibold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center py-4">
                            <button
                              onClick={() => setActiveSlot({ day, meal })}
                              className="text-[10px] text-primary hover:text-primary-hover font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Meal
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Swap Modal Overlay */}
      {activeSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass max-w-md w-full rounded-2xl p-5 border border-white/10 flex flex-col max-h-[70vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-text-primary">
                Select replacement for {activeSlot.day} {activeSlot.meal}
              </h3>
              <button
                onClick={() => setActiveSlot(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-xs text-text-secondary border border-dashed border-aurora-border rounded-xl">
                  No bookmarked favorite recipes found. Bookmark recipes in the Recipe Explorer first to swap them here!
                </div>
              ) : (
                favorites.map((recipe) => (
                  <div
                    key={recipe.id}
                    onClick={() => handleSwapMeal(recipe)}
                    className="p-3 rounded-xl bg-aurora-card/60 border border-aurora-border hover:border-accent hover:bg-aurora-card cursor-pointer transition flex justify-between items-center"
                  >
                    <div>
                      <div className="text-xs font-bold text-text-primary">{recipe.title}</div>
                      <div className="text-[10px] text-text-secondary">{recipe.cuisine} • {recipe.cookingTime} min</div>
                    </div>
                    <span className="text-[10px] bg-accent/10 px-2 py-0.5 rounded text-accent border border-accent/20">
                      ₹{calculateRecipeCost(recipe)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple X icon replacement inside the modal header
function X({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
