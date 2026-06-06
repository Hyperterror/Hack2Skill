# CookWise AI Tasks

This file tracks the tasks to be implemented for CookWise AI.

---

## Progress Checklist

- [x] **Phase 1: Setup & Design System**
  - [x] Initialize project codebase (Next.js or Vite React)
  - [x] Set up styling (Tailwind CSS custom Culinary Aurora theme)
  - [x] Define global Typescript interfaces (`Ingredient`, `Recipe`, `Nutrition`, `Pantry`, `User`)

- [x] **Phase 2: Database & Backend Services**
  - [x] Setup Prisma Schema with SQLite database connection
  - [x] Define DB models (`User`, `Pantry`, `Recipe`, `MealPlan`)
  - [x] Implement REST API routes:
    - [x] `/api/pantry` (GET, POST, DELETE)
    - [x] `/api/recipes` (GET, GET by ID via favorites & generate)
    - [x] `/api/recipes/generate` (POST - Gemini generation)
    - [x] `/api/recommendations` (POST)
    - [x] `/api/grocery/generate` (POST)
    - [x] `/api/planner/weekly` (POST - Gemini planner)
    - [x] `/api/favorites` (POST, DELETE)

- [x] **Phase 3: Frontend Component Development**
  - [x] **PantryEditor**: Tag/chip input with autocomplete suggestions
  - [x] **PreferencesPanel**: Dropdowns and chips for Cuisine, Diet, Time, Budget
  - [x] **RecipeCards / RecipeDetails**: Rich UI detailing ingredients, steps, and substitutions
  - [x] **PlannerBoard / WeeklyPlanner**: Calendar dashboard with swap support
  - [x] **GroceryList**: Interactive shopping list of missing ingredients
  - [x] **NutritionCard / Dashboard**: Interactive graphs for macro breakdown
  - [x] **AIChatAssistant**: Floating chat assistant UI for subbing or customizing meals

- [x] **Phase 4: AI Prompt Engineering**
  - [x] Design structured JSON output prompts for Recipe Generator
  - [x] Design structured JSON prompts for 7-Day Weekly Meal Planner
  - [x] Design structured prompts for Ingredient Substitution AI

- [/] **Phase 5: Verification & Testing**
  - [x] Write unit test for Pantry Match Score formula
  - [x] Verify mock vs live Gemini responses (fallback verification)
  - [/] Manual walkthrough testing of all UX screens (browser sandbox connection timed out)
