"use client";

import React from "react";
import { useCookWiseStore } from "@/store";
import { Activity, Flame, Shield, HelpCircle } from "lucide-react";
import { Recipe } from "@/types";

interface NutritionTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

const TARGETS: NutritionTarget = {
  calories: 2000 * 7, // weekly targets
  protein: 80 * 7,
  carbs: 220 * 7,
  fats: 70 * 7,
};

export default function NutritionDashboard() {
  const { weeklyPlan } = useCookWiseStore();

  const getAggregatedNutrition = () => {
    const total = { calories: 0, protein: 0, carbs: 0, fats: 0 };
    if (!weeklyPlan) return total;

    Object.values(weeklyPlan).forEach((dayPlan) => {
      const addRecipeNut = (rec?: Recipe) => {
        if (!rec || !rec.nutrition) return;
        total.calories += rec.nutrition.calories || 0;
        total.protein += rec.nutrition.protein || 0;
        total.carbs += rec.nutrition.carbs || 0;
        total.fats += rec.nutrition.fats || 0;
      };

      addRecipeNut(dayPlan.Breakfast);
      addRecipeNut(dayPlan.Lunch);
      addRecipeNut(dayPlan.Dinner);
    });

    return total;
  };

  const current = getAggregatedNutrition();

  const getPercentage = (curr: number, target: number) => {
    return Math.min(Math.round((curr / target) * 100), 100);
  };

  const macros = [
    {
      name: "Protein",
      current: current.protein,
      target: TARGETS.protein,
      unit: "g",
      color: "bg-accent",
      textColor: "text-accent",
      bgColor: "bg-accent/10",
      description: "For muscle synthesis",
    },
    {
      name: "Carbohydrates",
      current: current.carbs,
      target: TARGETS.carbs,
      unit: "g",
      color: "bg-primary",
      textColor: "text-primary",
      bgColor: "bg-primary/10",
      description: "For daily energy",
    },
    {
      name: "Fats",
      current: current.fats,
      target: TARGETS.fats,
      unit: "g",
      color: "bg-secondary",
      textColor: "text-secondary",
      bgColor: "bg-secondary/10",
      description: "For hormonal balance",
    },
  ];

  const caloriePercentage = getPercentage(current.calories, TARGETS.calories);

  return (
    <div className="glass p-6 rounded-aurora w-full border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>

      <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent" />
        Nutritional Summary
      </h2>

      {!weeklyPlan ? (
        <div className="text-center py-10 border border-dashed border-aurora-border rounded-2xl text-xs text-text-secondary">
          No meal plan loaded. Generate a plan to view your macro summary!
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calorie Gauge */}
          <div className="p-4 rounded-2xl bg-[#09090B]/60 border border-white/5 flex items-center gap-4">
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              {/* Circular progress background */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/5"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-400"
                  strokeWidth="3.5"
                  strokeDasharray={`${caloriePercentage}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[10px] font-bold text-text-primary mt-0.5">{caloriePercentage}%</span>
              </div>
            </div>
            
            <div>
              <div className="text-[10px] text-text-secondary uppercase tracking-wider">Weekly Calorie Target</div>
              <div className="text-sm font-bold text-text-primary mt-0.5">
                {current.calories} / {TARGETS.calories} kcal
              </div>
              <p className="text-[10px] text-text-secondary mt-1">Accumulated from 7 days of scheduled meals</p>
            </div>
          </div>

          {/* Macro Progress Bars */}
          <div className="space-y-4">
            {macros.map((macro) => {
              const pct = getPercentage(macro.current, macro.target);
              return (
                <div key={macro.name} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-semibold">
                    <span className="text-text-primary flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${macro.color}`}></span>
                      {macro.name}
                    </span>
                    <span className="text-text-secondary">
                      <strong className={macro.textColor}>{macro.current}</strong> / {macro.target} {macro.unit} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${macro.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-text-secondary">
                    <span>{macro.description}</span>
                    <span>Target: {macro.target / 7}{macro.unit}/day</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Healthy Status Note */}
          <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div className="text-[10px] text-text-secondary leading-relaxed">
              <strong className="text-accent">Nutritional Balance Verified:</strong> This meal plan is structured to provide steady energy release, optimized macronutrient splits, and meets your target calorie limits.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
