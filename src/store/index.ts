import { create } from "zustand";
import { Ingredient, Recipe, Preferences, WeeklyPlan } from "@/types";

interface CookWiseStore {
  pantry: Ingredient[];
  preferences: Preferences;
  searchResults: Recipe[];
  activeRecipe: Recipe | null;
  weeklyPlan: WeeklyPlan | null;
  budgetLimit: number;
  favorites: Recipe[];
  groceryList: Ingredient[];
  
  // Loading states
  loadingPantry: boolean;
  loadingRecipes: boolean;
  loadingWeeklyPlan: boolean;
  loadingFavorites: boolean;
  loadingSubstitutes: boolean;

  // Actions
  fetchPantry: () => Promise<void>;
  updatePantry: (ingredients: Ingredient[]) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Preferences) => Promise<void>;
  generateRecipe: () => Promise<void>;
  generateWeeklyPlan: (regenerate?: boolean) => Promise<void>;
  fetchWeeklyPlan: () => Promise<void>;
  updateMealPlan: (updatedPlan: WeeklyPlan) => Promise<void>;
  updateBudgetLimit: (limit: number) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addFavorite: (recipe: Recipe) => Promise<void>;
  removeFavorite: (recipeId: string) => Promise<void>;
  fetchGroceryList: () => Promise<void>;
}

export const useCookWiseStore = create<CookWiseStore>((set, get) => ({
  pantry: [],
  preferences: {
    cuisine: ["Indian"],
    diet: ["Vegetarian"],
    time: "Under 30 min",
    budget: 300,
  },
  searchResults: [],
  activeRecipe: null,
  weeklyPlan: null,
  budgetLimit: 1000,
  favorites: [],
  groceryList: [],

  loadingPantry: false,
  loadingRecipes: false,
  loadingWeeklyPlan: false,
  loadingFavorites: false,
  loadingSubstitutes: false,

  fetchPantry: async () => {
    set({ loadingPantry: true });
    try {
      const res = await fetch("/api/pantry");
      const data = await res.json();
      if (data.success) {
        set({ pantry: data.ingredients });
      }
    } catch (err) {
      console.error("Error fetching pantry:", err);
    } finally {
      set({ loadingPantry: false });
    }
  },

  updatePantry: async (ingredients) => {
    try {
      const res = await fetch("/api/pantry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients }),
      });
      const data = await res.json();
      if (data.success) {
        set({ pantry: data.ingredients });
        // Automatically refresh grocery list when pantry changes
        if (get().weeklyPlan) {
          get().fetchGroceryList();
        }
      }
    } catch (err) {
      console.error("Error updating pantry:", err);
    }
  },

  fetchPreferences: async () => {
    try {
      const res = await fetch("/api/preferences");
      const data = await res.json();
      if (data.success) {
        set({ preferences: data.preferences });
      }
    } catch (err) {
      console.error("Error fetching preferences:", err);
    }
  },

  updatePreferences: async (preferences) => {
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences }),
      });
      const data = await res.json();
      if (data.success) {
        set({ preferences: data.preferences });
      }
    } catch (err) {
      console.error("Error updating preferences:", err);
    }
  },

  generateRecipe: async () => {
    set({ loadingRecipes: true, activeRecipe: null });
    try {
      const { pantry, preferences } = get();
      const ingredientNames = pantry.map((i) => i.name);
      
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredientNames, preferences }),
      });
      
      const data = await res.json();
      if (data.success) {
        set({
          activeRecipe: data.recipe,
          searchResults: [data.recipe, ...get().searchResults.slice(0, 9)],
        });
      }
    } catch (err) {
      console.error("Error generating recipe:", err);
    } finally {
      set({ loadingRecipes: false });
    }
  },

  fetchWeeklyPlan: async () => {
    set({ loadingWeeklyPlan: true });
    try {
      const res = await fetch("/api/planner/weekly");
      const data = await res.json();
      if (data.success && data.mealPlan) {
        set({ weeklyPlan: data.mealPlan, budgetLimit: data.budgetLimit });
        get().fetchGroceryList();
      }
    } catch (err) {
      console.error("Error fetching weekly plan:", err);
    } finally {
      set({ loadingWeeklyPlan: false });
    }
  },

  generateWeeklyPlan: async (regenerate = false) => {
    set({ loadingWeeklyPlan: true });
    try {
      const { budgetLimit } = get();
      const res = await fetch("/api/planner/weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budgetLimit, regenerate }),
      });
      const data = await res.json();
      if (data.success) {
        set({ weeklyPlan: data.mealPlan, budgetLimit: data.budgetLimit });
        get().fetchGroceryList();
      }
    } catch (err) {
      console.error("Error generating weekly plan:", err);
    } finally {
      set({ loadingWeeklyPlan: false });
    }
  },

  updateMealPlan: async (updatedPlan) => {
    try {
      const { budgetLimit } = get();
      const res = await fetch("/api/planner/weekly", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: updatedPlan, budgetLimit }),
      });
      const data = await res.json();
      if (data.success) {
        set({ weeklyPlan: data.mealPlan });
        get().fetchGroceryList();
      }
    } catch (err) {
      console.error("Error updating weekly plan:", err);
    }
  },

  updateBudgetLimit: async (limit) => {
    set({ budgetLimit: limit });
    try {
      const { weeklyPlan } = get();
      if (weeklyPlan) {
        await fetch("/api/planner/weekly", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: weeklyPlan, budgetLimit: limit }),
        });
      }
    } catch (err) {
      console.error("Error updating budget limit:", err);
    }
  },

  fetchFavorites: async () => {
    set({ loadingFavorites: true });
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      if (data.success) {
        set({ favorites: data.favorites });
      }
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      set({ loadingFavorites: false });
    }
  },

  addFavorite: async (recipe) => {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const data = await res.json();
      if (data.success) {
        get().fetchFavorites();
      }
    } catch (err) {
      console.error("Error adding favorite:", err);
    }
  },

  removeFavorite: async (recipeId) => {
    try {
      const res = await fetch(`/api/favorites?recipeId=${recipeId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        get().fetchFavorites();
      }
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  },

  fetchGroceryList: async () => {
    const { weeklyPlan } = get();
    if (!weeklyPlan) return;

    // Aggregate all recipes in the weekly plan
    const recipes: Recipe[] = [];
    Object.values(weeklyPlan).forEach((dayPlan) => {
      if (dayPlan.Breakfast) recipes.push(dayPlan.Breakfast);
      if (dayPlan.Lunch) recipes.push(dayPlan.Lunch);
      if (dayPlan.Dinner) recipes.push(dayPlan.Dinner);
    });

    if (recipes.length === 0) return;

    try {
      const res = await fetch("/api/grocery/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes }),
      });
      const data = await res.json();
      if (data.success) {
        set({ groceryList: data.groceryList });
      }
    } catch (err) {
      console.error("Error generating grocery list:", err);
    }
  },
}));
