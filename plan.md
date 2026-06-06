# CookWise AI - Development Plan

This document outlines the step-by-step development plan for building the CookWise AI application based on the [PRD.md](file:///d:/College/Programming/Hack2Skill/PRD.md).

---

## 1. Technical Stack Options

### Frontend
- **Framework**: React + TypeScript + Vite (or Next.js for a monolithic app)
- **Styling**: TailwindCSS + Framer Motion (Theme: Culinary Aurora)
- **State**: Zustand
- **Drag & Drop**: `@dnd-kit/core`
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

### Backend
- **Framework**: Node.js + Express + TypeScript (or Next.js API Routes)
- **Database**: SQLite + Prisma ORM (MVP setup)
- **Authentication**: Clerk or Auth.js (or mock auth for hackathon speed)
- **AI Engine**: Google Gemini API via `@google/genai` or `google-generative-ai`

---

## 2. Phase-wise Implementation Plan

### Phase 1: Setup & Design System
- [ ] Initialize project codebase (Vite or Next.js layout).
- [ ] Configure `tailwind.config.js` and custom themes:
  - Background: `#09090B` (Dark)
  - Surface: `#111827`
  - Primary: `#6C63FF` (Indigo Purple)
  - Secondary: `#8B5CF6`
  - Accent: `#00D4AA` (Teal)
  - Text Primary: `#F9FAFB`
  - Text Secondary: `#9CA3AF`
  - Component Border Radius: `1rem` (16px)
  - Shadows & Glassmorphism filters.
- [ ] Define global types (`Ingredient`, `Recipe`, `Nutrition`, `Pantry`, `User`).

### Phase 2: Database & Backend Services
- [ ] Setup Prisma Schema with SQLite database connection.
- [ ] Implement database models:
  - `User`, `Pantry`, `Recipe`, `MealPlan`
- [ ] Implement backend API endpoints:
  - `GET/POST/DELETE /api/pantry` - Managing ingredients
  - `GET /api/recipes` - Retrieve preloaded recipes or search
  - `POST /api/recipes/generate` - Generate individual recipes using Google Gemini
  - `POST /api/recommendations` - Smart recommendations based on preferences
  - `POST /api/grocery/generate` - Compute missing ingredients
  - `POST /api/planner/weekly` - Generate weekly meal plans using Google Gemini
  - `POST/DELETE /api/favorites` - Bookmark/favorite recipes

### Phase 3: Frontend Component Development
- [ ] **Pantry Manager**: Adding tags, deleting tags, manual ingredient inputs.
- [ ] **Preference Selectors**: Visual controls for Cuisine, Diet, Cooking Time, and Budget.
- [ ] **Recipe Exploration**: Grid layout with recipe cards, matching score displays, and filtering capabilities.
- [ ] **Weekly Planner**: 7-day calendar board displaying Breakfast, Lunch, and Dinner with drag-and-drop capability.
- [ ] **Grocery Shopping Checklist**: Auto-generated shopping lists from the active meal planner.
- [ ] **Nutrition Panel**: Charts summarizing nutritional targets (calories, protein, carbs, fats).
- [ ] **AI Substitutions & Assistant**: Chat drawer or floating popup asking Gemini for recipe substitutions or custom cooking help.

### Phase 4: AI Prompt Engineering
- [ ] Develop prompts for recipe generation.
- [ ] Develop prompts for weekly 7-day plan generation.
- [ ] Develop prompts for ingredient substitution engine.
- [ ] Ensure responses return structured JSON schemas for seamless frontend parsing.

### Phase 5: Verification & Testing
- [ ] Run unit tests for score calculation logic: `(Available Ingredients / Total Ingredients) * 100`.
- [ ] Run validation tests on structured JSON outputs from Gemini.
- [ ] Verify state synchronization between the Pantry and Recipe Match Score.
- [ ] Validate responsive design across desktop and mobile screen layouts.
