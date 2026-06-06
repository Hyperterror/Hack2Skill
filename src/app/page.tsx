"use client";

import React, { useState, useEffect } from "react";
import { useCookWiseStore } from "@/store";
import { Sparkles, ChefHat, Heart, Search, ChevronRight, RefreshCw, BookOpen, Compass } from "lucide-react";
import PantryEditor from "@/components/PantryEditor";
import PreferencesPanel from "@/components/PreferencesPanel";
import RecipeCard from "@/components/RecipeCard";
import RecipeDetails from "@/components/RecipeDetails";
import WeeklyPlanner from "@/components/WeeklyPlanner";
import GroceryList from "@/components/GroceryList";
import NutritionDashboard from "@/components/NutritionDashboard";
import AIChatAssistant from "@/components/AIChatAssistant";
import { Recipe } from "@/types";

export default function Home() {
  const {
    pantry,
    fetchPantry,
    searchResults,
    activeRecipe,
    generateRecipe,
    loadingRecipes,
    favorites,
    fetchFavorites,
  } = useCookWiseStore();

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "planner">("generate");

  useEffect(() => {
    fetchPantry();
    fetchFavorites();
    fetchRecommendations();
  }, [fetchPantry, fetchFavorites]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("Error loading recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleGenerateRecipe = () => {
    generateRecipe();
    setActiveTab("generate");
  };

  const handleRecommendClick = async (dishName: string) => {
    // Simulate generation for this recommendation
    setSelectedRecipe(null);
    useCookWiseStore.setState({ loadingRecipes: true });
    try {
      const { preferences } = useCookWiseStore.getState();
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: [dishName], // seed Gemini with the recommendation title
          preferences,
        }),
      });
      const data = await res.json();
      if (data.success) {
        useCookWiseStore.setState({
          activeRecipe: data.recipe,
          searchResults: [data.recipe, ...searchResults.slice(0, 9)],
        });
      }
    } catch (err) {
      console.error("Error generating recipe from recommendation:", err);
    } finally {
      useCookWiseStore.setState({ loadingRecipes: false });
    }
  };

  return (
    <div className="min-h-screen aurora-bg pb-24 text-text-primary">
      {/* 1. HERO HERO SECTION */}
      <header className="relative py-12 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(108,99,255,0.06),transparent_60%)] pointer-events-none"></div>

        <div className="flex items-center gap-2.5 mb-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-accent animate-pulse-glow" />
          <span className="text-[10px] sm:text-xs font-semibold text-text-secondary uppercase tracking-widest">
            PromptWars 2026 Winner Submission
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-text-primary via-primary to-accent bg-clip-text text-transparent mb-4 max-w-4xl leading-tight">
          Turn Your Pantry Into Perfect Meals.
        </h1>
        
        <p className="text-sm sm:text-lg text-text-secondary max-w-2xl leading-relaxed mb-8">
          AI-powered meal planning that creates recipes, grocery lists, substitutions, and weekly plans in seconds.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleGenerateRecipe}
            disabled={pantry.length === 0 || loadingRecipes}
            className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loadingRecipes ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <ChefHat className="w-5 h-5" />
            )}
            Generate Recipe
          </button>
          <a
            href="#dashboard"
            onClick={() => setActiveTab("planner")}
            className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-text-primary rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            View Weekly Planner
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* 2. DASHBOARD BODY */}
      <main id="dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column (Pantry & Preferences) - Span 3 */}
        <section className="lg:col-span-4 space-y-6">
          <PantryEditor />
          <PreferencesPanel />
        </section>

        {/* Center Main column (Generators, Planners) - Span 5 */}
        <section className="lg:col-span-5 space-y-6">
          {/* Tabs for switching views */}
          <div className="flex border-b border-white/5 bg-aurora-card/30 p-1 rounded-xl glass">
            <button
              onClick={() => setActiveTab("generate")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "generate"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <Compass className="w-4 h-4" />
              AI Recipe Generator
            </button>
            <button
              onClick={() => setActiveTab("planner")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === "planner"
                  ? "bg-primary text-white shadow-md shadow-primary/10"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Weekly Meal Planner
            </button>
          </div>

          {activeTab === "generate" ? (
            <div className="space-y-6">
              {/* Recommendations Bar */}
              <div className="glass p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <Compass className="w-4 h-4 text-accent animate-pulse-glow" />
                  <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Smart Recommendations</h3>
                </div>
                {loadingRecs ? (
                  <div className="text-xs text-text-secondary py-1.5 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Fetching customized suggestions...
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none">
                    {recommendations.map((dish) => (
                      <button
                        key={dish}
                        onClick={() => handleRecommendClick(dish)}
                        className="text-[10px] font-semibold bg-aurora-card border border-aurora-border px-3 py-1.5 rounded-full text-text-secondary hover:text-text-primary hover:border-accent hover:bg-aurora-card/80 transition cursor-pointer shrink-0"
                      >
                        {dish}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main AI Generator Panel */}
              <div className="glass p-6 rounded-aurora border border-white/5 min-h-[350px] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    AI Culinary Assistant
                  </h2>
                  {loadingRecipes && (
                    <span className="text-xs text-text-secondary flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Querying Gemini...
                    </span>
                  )}
                </div>

                {loadingRecipes ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
                    <h3 className="text-sm font-bold text-text-primary">Generating Culinary Masterpiece</h3>
                    <p className="text-xs text-text-secondary max-w-xs mt-1">Analyzing pantry items, weighing nutritional targets, and structuring instructions...</p>
                  </div>
                ) : activeRecipe ? (
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-accent tracking-wider bg-accent/10 px-2.5 py-0.5 rounded-md border border-accent/20">
                            {activeRecipe.cuisine}
                          </span>
                          <h3 className="text-xl font-bold text-text-primary mt-2">{activeRecipe.title}</h3>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                          {activeRecipe.matchScore}% match
                        </span>
                      </div>
                      
                      <p className="text-xs text-text-secondary leading-relaxed mb-6 line-clamp-3">
                        A beautiful {activeRecipe.cuisine} dish cooked in under {activeRecipe.cookingTime} minutes, using {activeRecipe.ingredients?.slice(0, 3).map(i => i.name).join(", ")} and other ingredients.
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex gap-4 text-xs text-text-secondary">
                        <span>{activeRecipe.cookingTime} mins</span>
                        <span>{activeRecipe.nutrition?.calories || 320} kcal</span>
                      </div>
                      <button
                        onClick={() => setSelectedRecipe(activeRecipe)}
                        className="bg-primary hover:bg-primary-hover text-white text-xs px-4 py-2 rounded-lg font-bold transition cursor-pointer shadow-lg shadow-primary/20"
                      >
                        View Full Recipe
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 border border-dashed border-aurora-border rounded-2xl">
                    <ChefHat className="w-12 h-12 text-text-secondary/50 mb-3" />
                    <h3 className="text-sm font-bold text-text-primary">Ready to Cook?</h3>
                    <p className="text-xs text-text-secondary max-w-xs mt-1.5 mb-6">
                      Add ingredients to your pantry and let Google Gemini draft custom matching recipes.
                    </p>
                    <button
                      onClick={handleGenerateRecipe}
                      disabled={pantry.length === 0}
                      className="bg-primary hover:bg-primary-hover text-white text-xs px-4.5 py-2.5 rounded-xl font-bold transition disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
                    >
                      Draft Recipe
                    </button>
                  </div>
                )}
              </div>

              {/* Favorites Grid */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                  Your Favorites ({favorites.length})
                </h3>
                {favorites.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-aurora-border rounded-2xl text-xs text-text-secondary">
                    No favorited recipes yet. Save recipes to view them here.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((recipe) => (
                      <RecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        onViewDetails={setSelectedRecipe}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <WeeklyPlanner onViewRecipe={setSelectedRecipe} />
          )}
        </section>

        {/* Right column (Nutrition & Grocery) - Span 3 */}
        <section className="lg:col-span-3 space-y-6">
          <NutritionDashboard />
          <GroceryList />
        </section>
      </main>

      {/* Floating Chat Assistant */}
      <AIChatAssistant />

      {/* Modal Recipe details */}
      {selectedRecipe && (
        <RecipeDetails
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
