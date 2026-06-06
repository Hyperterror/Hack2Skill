"use client";

import React, { useState } from "react";
import { Recipe } from "@/types";
import { useCookWiseStore } from "@/store";
import { X, Clock, Flame, ShieldAlert, Check, RefreshCw, AlertCircle, Heart } from "lucide-react";

interface RecipeDetailsProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeDetails({ recipe, onClose }: RecipeDetailsProps) {
  const { pantry, favorites, addFavorite, removeFavorite } = useCookWiseStore();
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [substitutes, setSubstitutes] = useState<string[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const isFav = favorites.some((f) => f.title.toLowerCase() === recipe.title.toLowerCase());

  const handleFavoriteToggle = () => {
    if (isFav) {
      const match = favorites.find((f) => f.title.toLowerCase() === recipe.title.toLowerCase());
      if (match) removeFavorite(match.id);
    } else {
      addFavorite(recipe);
    }
  };

  const getSubstitutes = async (ingredientName: string) => {
    setSelectedIngredient(ingredientName);
    setLoadingSubs(true);
    setSubstitutes([]);
    try {
      const res = await fetch(`/api/substitute?ingredient=${encodeURIComponent(ingredientName)}&recipe=${encodeURIComponent(recipe.title)}`);
      const data = await res.json();
      if (data.success) {
        setSubstitutes(data.substitutes);
      }
    } catch (err) {
      console.error("Error fetching substitutes:", err);
    } finally {
      setLoadingSubs(false);
    }
  };

  // Helper to check ingredient availability in pantry
  const checkPantryAvailability = (ingName: string) => {
    const nameLower = ingName.toLowerCase();
    return pantry.some(
      (p) => nameLower.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(nameLower)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="glass max-w-2xl w-full max-h-[90vh] rounded-aurora overflow-hidden border border-white/10 flex flex-col shadow-2xl relative">
        {/* Banner header */}
        <div className="p-6 border-b border-white/5 bg-aurora-card/70 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase font-bold text-accent tracking-wider bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                {recipe.cuisine}
              </span>
              {recipe.tags?.slice(0, 2).map((tag) => (
                <span key={tag} className="text-xs text-text-secondary bg-[#09090B]/60 border border-aurora-border px-2 py-0.5 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-xl font-bold text-text-primary">{recipe.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-lg border transition ${
                isFav
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  : "bg-[#09090B]/60 border-white/5 text-text-secondary hover:text-rose-500"
              }`}
            >
              <Heart className={`w-4.5 h-4.5 ${isFav ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#09090B]/60 border border-white/5 text-text-secondary hover:text-text-primary hover:bg-[#09090B] transition cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Cooking stats & Nutrition bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#09090B]/50 border border-white/5">
            <div className="text-center">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time
              </div>
              <div className="text-sm font-bold text-text-primary">{recipe.cookingTime} min</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
              </div>
              <div className="text-sm font-bold text-text-primary">{recipe.nutrition?.calories || 0} kcal</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Protein</div>
              <div className="text-sm font-bold text-accent">{recipe.nutrition?.protein || 0}g</div>
            </div>
            <div className="text-center border-l border-white/5">
              <div className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">Macros (C/F)</div>
              <div className="text-sm font-bold text-text-primary">
                {recipe.nutrition?.carbs || 0}g / {recipe.nutrition?.fats || 0}g
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left side: Ingredients */}
            <div className="md:col-span-5 space-y-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Ingredients Checklist</h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {recipe.ingredients?.map((ing, idx) => {
                  const inPantry = checkPantryAvailability(ing.name);
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                        inPantry
                          ? "bg-emerald-950/10 border-emerald-900/20 text-emerald-400"
                          : "bg-rose-950/10 border-rose-900/20 text-rose-400"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {inPantry ? (
                            <div className="w-4.5 h-4.5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-4.5 h-4.5 rounded-full bg-rose-500/20 flex items-center justify-center">
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                            </div>
                          )}
                          <span className="text-sm font-medium text-text-primary">{ing.name}</span>
                        </div>
                        <span className="text-xs text-text-secondary font-semibold">
                          {ing.quantity} {ing.unit}
                        </span>
                      </div>
                      
                      {/* Substitution trigger */}
                      {!inPantry && (
                        <button
                          onClick={() => getSubstitutes(ing.name)}
                          className="mt-2 text-[10px] flex items-center gap-1.5 self-start text-accent hover:text-accent/80 transition font-medium cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3 animate-spin-slow" />
                          View AI Substitutes
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side: Instructions */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Instructions</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {recipe.instructions?.map((step, idx) => (
                  <div key={idx} className="flex gap-3.5 p-3 rounded-xl bg-aurora-card/40 border border-white/5">
                    <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-text-primary leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Substitutes Overlay/Tray */}
          {selectedIngredient && (
            <div className="p-4 rounded-xl bg-[#09090B]/80 border border-accent/20 animate-fade-in mt-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5 text-accent text-xs font-bold uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  AI Alternatives for {selectedIngredient}
                </div>
                <button
                  onClick={() => setSelectedIngredient(null)}
                  className="text-text-secondary hover:text-text-primary transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {loadingSubs ? (
                <div className="text-center py-4 text-xs text-text-secondary flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying Gemini substitutions...
                </div>
              ) : substitutes.length === 0 ? (
                <div className="text-xs text-text-secondary text-center py-2">No substitutes found.</div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {substitutes.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-aurora-card border border-white/5 text-xs text-text-primary flex items-center gap-2 hover:border-accent/40 hover:bg-aurora-card/90 transition-all"
                    >
                      <span className="w-4 h-4 rounded bg-accent/20 text-accent flex items-center justify-center text-[9px] font-bold">
                        {idx + 1}
                      </span>
                      {sub}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
