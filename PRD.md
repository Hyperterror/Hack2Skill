# CookWise AI

### AI-Powered Meal Planning & Cooking Assistant

**PromptWars 2026 – Complete Product Requirements Document (PRD) + Technical Requirements Document (TRD)**

---

# 1. Product Vision

## Problem Statement

People often struggle with:

* Deciding what to cook every day
* Managing pantry ingredients efficiently
* Avoiding food waste
* Staying within budget
* Following dietary restrictions
* Creating balanced meal plans

## Solution

**CookWise AI** is an AI-powered meal planning web application that transforms available ingredients into personalized meal plans, recipes, shopping lists, and cooking schedules.

The application acts as an intelligent cooking companion capable of:

* Understanding pantry inventory
* Recommending dishes
* Generating recipes
* Creating grocery lists
* Suggesting substitutions
* Building weekly meal plans
* Maintaining budget awareness

---

# 2. Core User Journey

## Step 1: User Adds Pantry

Example:

```text
Tomatoes
Onions
Rice
Eggs
Milk
Cheese
Spinach
```

Can be added through:

* Manual entry
* Tags
* Multi-select chips
* Voice input (future)

---

## Step 2: User Preferences

Select:

### Cuisine

* Indian
* Italian
* Chinese
* Mexican
* Mediterranean
* Japanese

### Dietary

* Vegetarian
* Vegan
* Gluten Free
* Keto
* High Protein

### Time

* Under 15 min
* Under 30 min
* Under 1 hour

### Budget

* ₹100
* ₹300
* ₹500
* Custom

---

## Step 3: AI Generates

### Breakfast

Spinach Cheese Omelette

### Lunch

Tomato Rice Bowl

### Dinner

Creamy Vegetable Risotto

---

## Step 4: Outputs

### Meal Plan

### Recipes

### Grocery List

### Missing Ingredients

### Budget Estimate

### Nutritional Summary

### Substitutions

---

# 3. Feature Breakdown

---

# Feature 1: Pantry-Based Recipe Generator

### Input

```json
{
  "ingredients": [
    "rice",
    "egg",
    "spinach"
  ]
}
```

### AI Output

```json
{
  "recipeName": "Spinach Egg Fried Rice",
  "matchScore": 95
}
```

### Logic

Score recipes based on:

```text
Available Ingredients / Total Ingredients
```

Example:

```text
9 available out of 10 = 90%
```

Only show:

```text
Match > 70%
```

---

# Feature 2: AI Recipe Generator

Generate complete recipe from ingredient list.

### Output

```json
{
  "title":"Creamy Spinach Pasta",
  "ingredients":[],
  "steps":[],
  "nutrition":{}
}
```

Includes:

* Calories
* Protein
* Carbs
* Fat

---

# Feature 3: Smart Recommendations

Inputs:

```json
{
  "cuisine":"Indian",
  "diet":"Vegetarian",
  "time":"30"
}
```

Returns:

```json
[
  "Paneer Bhurji",
  "Vegetable Pulao",
  "Masala Oats"
]
```

---

# Feature 4: Recipe Search

Filters:

### Cuisine

### Time

### Ingredients

### Dietary Tags

### Calories

### Protein

### Rating

### Difficulty

---

# Feature 5: Meal Planner

Drag-and-drop planner.

```text
Monday
 ├ Breakfast
 ├ Lunch
 └ Dinner

Tuesday
 ...
```

Built using:

```bash
@dnd-kit/core
```

---

# Feature 6: Favorites

Save recipes.

```typescript
User
 └ Favorite Recipes[]
```

---

# Feature 7: Shopping List Generator

Recipe requires:

```text
Rice
Eggs
Milk
Butter
```

User has:

```text
Rice
Eggs
```

Generated:

```text
Milk
Butter
```

---

# Feature 8: Ingredient Substitution AI

Example:

```text
No Butter?
```

Suggestions:

```text
Olive Oil
Greek Yogurt
Coconut Oil
```

---

# Feature 9: Budget Feasibility Engine

User Budget:

```text
₹300
```

Meal Plan Cost:

```text
₹260
```

Status:

```text
Within Budget ✓
```

---

# Feature 10: Weekly Meal Planner

Generates:

```text
7 Days
3 Meals / Day
21 Meals
```

Rules:

* No duplicate meals
* Balanced nutrition
* Budget compliance

---

# 4. Modern UI / UX Design System

---

# Design Language

Inspired by:

* Shadcn/UI
* Vercel
* Linear
* Notion AI
* Google Gemini

---

# Theme Name

## Culinary Aurora

Professional + Modern + AI First

---

# Color Palette

### Primary

```css
#6C63FF
```

Indigo Purple

---

### Secondary

```css
#8B5CF6
```

---

### Accent

```css
#00D4AA
```

---

### Background

```css
#09090B
```

---

### Surface

```css
#111827
```

---

### Card

```css
#1F2937
```

---

### Border

```css
#374151
```

---

### Text Primary

```css
#F9FAFB
```

---

### Text Secondary

```css
#9CA3AF
```

---

### Success

```css
#22C55E
```

---

### Warning

```css
#F59E0B
```

---

# Typography

### Heading

```text
Satoshi
```

Fallback:

```css
Inter
```

---

### Body

```text
Inter
```

---

### Code

```text
JetBrains Mono
```

---

# Component Radius

```css
1rem
```

16px

---

# Shadows

```css
box-shadow:
0 10px 30px rgba(0,0,0,0.25);
```

---

# Glass Effect

```css
backdrop-filter: blur(12px);
```

---

# 5. Application Architecture

```text
Frontend (React)

 ├ Pantry Module
 ├ Recipe Module
 ├ AI Module
 ├ Meal Planner
 ├ Grocery Module

        ↓

 API Layer

        ↓

Backend

 ├ Recipes
 ├ Pantry
 ├ User
 ├ Recommendations
 ├ AI Services

        ↓

Database
```

---

# 6. Data Models

## Ingredient

```typescript
interface Ingredient {
 id: string;
 name: string;
 category: string;
 quantity?: number;
 unit?: string;
}
```

---

## Recipe

```typescript
interface Recipe {
 id: string;
 title: string;
 cuisine: string;
 ingredients: Ingredient[];
 instructions: string[];
 cookingTime: number;
 nutrition: Nutrition;
 tags: string[];
}
```

---

## Nutrition

```typescript
interface Nutrition {
 calories:number;
 protein:number;
 carbs:number;
 fats:number;
}
```

---

## Pantry

```typescript
interface Pantry {
 userId:string;
 ingredients:Ingredient[];
}
```

---

## User

```typescript
interface User {
 id:string;
 name:string;
 email:string;
 preferences:Preferences;
}
```

---

# 7. API Design

## Pantry

```http
GET /api/pantry

POST /api/pantry

DELETE /api/pantry/:id
```

---

## Recipes

```http
GET /api/recipes

GET /api/recipes/:id

POST /api/recipes/generate
```

---

## Recommendations

```http
POST /api/recommendations
```

---

## Grocery

```http
POST /api/grocery/generate
```

---

## Planner

```http
POST /api/planner/weekly
```

---

## Favorites

```http
POST /api/favorites

DELETE /api/favorites/:id
```

---

# 8. Frontend Structure

```text
src/

├ app/
├ pages/

├ components/
│
├ PantryEditor
├ RecipeCard
├ RecipeDetails
├ PlannerBoard
├ WeeklyPlanner
├ GroceryList
├ NutritionCard
├ AIChatAssistant
├ RecommendationGrid

├ hooks/
├ services/
├ types/
├ utils/

├ store/
```

---

# 9. Recommended Tech Stack

## Frontend

```bash
React
TypeScript
Vite
```

---

## UI

```bash
Shadcn/UI
TailwindCSS
Framer Motion
```

---

## State

```bash
Zustand
```

---

## Drag & Drop

```bash
@dnd-kit/core
```

---

## Charts

```bash
Recharts
```

---

## Forms

```bash
React Hook Form
Zod
```

---

## Backend

```bash
Node.js
Express
```

or

```bash
NestJS
```

---

## Database

MVP:

```bash
SQLite
```

Production:

```bash
PostgreSQL
```

---

## ORM

```bash
Prisma
```

---

## Authentication

```bash
Clerk
```

or

```bash
Auth.js
```

---

# 10. AI Integration

### Google Gemini

Best fit because PromptWars is Google-focused.

Features:

* Recipe generation
* Recommendations
* Ingredient substitutions
* Weekly planning

Prompt Template:

```text
Generate a healthy recipe using only:

Rice
Eggs
Spinach

Requirements:
- Vegetarian
- Under 30 mins
- Include nutrition
- Include steps
```

---

# 11. Future Enhancements

### Barcode Scanner

Add pantry by scanning groceries.

---

### Voice Assistant

"What's for dinner today?"

---

### Image Recognition

Upload fridge image.

AI detects ingredients.

---

### Family Profiles

Meal planning for:

* Kids
* Adults
* Seniors

---

### Smart Budgeting

Regional grocery prices.

---

### Food Waste Tracking

Predict expiration.

---

# 12. Hackathon Judging Advantages

This directly satisfies:

### Meal Planning Flow ✓

Breakfast/Lunch/Dinner

### Grocery List ✓

Auto-generated

### Substitutions ✓

AI-powered

### Budget Feasibility ✓

Cost engine

### Strong AI Usage ✓

Gemini-powered recommendations

### Great UX ✓

Planner + Pantry + Recipes

### Extendable ✓

Future-ready architecture

---

# Suggested Landing Page Hero

**Headline**

> "Turn Your Pantry Into Perfect Meals."

**Subheading**

> AI-powered meal planning that creates recipes, grocery lists, substitutions, and weekly plans in seconds.

**CTA Buttons**

```text
Generate Meals
View Demo
```

**Hero Visual**

A glassmorphic dashboard showing:

* Pantry items on left
* AI-generated recipes center
* Weekly planner right
* Floating nutrition cards
* Animated gradient background

This design will look modern, premium, and hackathon-winning while remaining achievable within a 24–48 hour PromptWars build sprint.
