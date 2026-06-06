export interface Ingredient {
  id?: string;
  name: string;
  category: string;
  quantity?: number;
  unit?: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: number;
  nutrition: Nutrition;
  tags: string[];
  matchScore?: number;
}

export interface Preferences {
  cuisine: string[];
  diet: string[];
  time: string;
  budget: number;
}

export interface Pantry {
  id: string;
  userId: string;
  ingredients: Ingredient[];
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  preferences: Preferences;
  pantry?: Pantry;
}

export interface DayPlan {
  Breakfast: Recipe;
  Lunch: Recipe;
  Dinner: Recipe;
}

export interface WeeklyPlan {
  [day: string]: DayPlan; // Monday, Tuesday, etc.
}

export interface MealPlanData {
  id: string;
  userId: string;
  weekStartDate: string; // e.g. "2026-06-08"
  plan: WeeklyPlan;
  budgetLimit: number;
}
