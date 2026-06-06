"use client";

import React from "react";
import { Recipe } from "@/types";
import { useCookWiseStore } from "@/store";
import { Clock, Flame, Heart, ChevronRight, Sparkles } from "lucide-react";

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
}

export default function RecipeCard({ recipe, onViewDetails }: RecipeCardProps) {
  const { favorites, addFavorite, removeFavorite } = useCookWiseStore();
  const isFav = favorites.some((f) => f.id === recipe.id || f.title.toLowerCase() === recipe.title.toLowerCase());

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFav) {
      const match = favorites.find((f) => f.title.toLowerCase() === recipe.title.toLowerCase());
      if (match) removeFavorite(match.id);
    } else {
      addFavorite(recipe);
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (score >= 90) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 70) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div
      onClick={() => onViewDetails(recipe)}
      className="glow-card glass p-5 rounded-aurora border border-white/5 cursor-pointer relative flex flex-col justify-between h-full group"
    >
      <div>
        {/* Top Header */}
        <div className="flex justify-between items-start gap-2 mb-3">
          <span className="text-[10px] uppercase font-bold text-accent tracking-wider bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
            {recipe.cuisine}
          </span>
          <button
            onClick={handleFavoriteClick}
            className={`p-1.5 rounded-lg border transition ${
              isFav
                ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                : "bg-black/30 border-white/5 text-text-secondary hover:text-rose-500"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-text-primary mb-2.5 line-clamp-1 group-hover:text-primary transition">
          {recipe.title}
        </h3>

        {/* Match Score */}
        {recipe.matchScore !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span className="text-text-secondary flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse-glow" />
                Pantry Match
              </span>
              <span className={`font-semibold ${getScoreColor(recipe.matchScore).split(" ")[0]}`}>
                {recipe.matchScore}%
              </span>
            </div>
            <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${recipe.matchScore}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Quick Details */}
        <div className="flex items-center gap-3 text-xs text-text-secondary mb-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.cookingTime} min
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {recipe.nutrition?.calories || 350} kcal
          </span>
        </div>
      </div>

      {/* Footer tags */}
      <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-auto">
        <div className="flex flex-wrap gap-1 max-w-[80%] overflow-hidden h-5">
          {recipe.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] bg-aurora-card px-2 py-0.5 rounded text-text-secondary border border-aurora-border"
            >
              {tag}
            </span>
          ))}
        </div>
        <ChevronRight className="w-4 h-4 text-text-secondary group-hover:translate-x-1 group-hover:text-primary transition" />
      </div>
    </div>
  );
}
