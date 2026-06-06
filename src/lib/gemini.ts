import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini client if API key is provided
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Mock Recipe data for fallback
const MOCK_RECIPES = [
  {
    title: "Spinach Egg Fried Rice",
    cuisine: "Chinese",
    cookingTime: 15,
    ingredients: [
      { name: "Rice", category: "Grains", quantity: 1, unit: "cup" },
      { name: "Eggs", category: "Protein", quantity: 2, unit: "pcs" },
      { name: "Spinach", category: "Vegetables", quantity: 50, unit: "g" },
      { name: "Onions", category: "Vegetables", quantity: 1, unit: "pcs" },
      { name: "Soy Sauce", category: "Pantry", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Cook the rice beforehand and let it cool.",
      "Heat a pan with oil, sauté chopped onions until soft.",
      "Add fresh spinach and sauté until wilted.",
      "Push the veggies to the side, crack eggs in the pan, and scramble them.",
      "Add the cooked rice, pour soy sauce, and stir-fry everything on high heat for 3 minutes.",
      "Serve hot garnished with spring onions."
    ],
    nutrition: {
      calories: 420,
      protein: 18,
      carbs: 55,
      fats: 12
    },
    tags: ["High Protein", "Under 15 min"]
  },
  {
    title: "Creamy Tomato Spinach Risotto",
    cuisine: "Italian",
    cookingTime: 25,
    ingredients: [
      { name: "Rice", category: "Grains", quantity: 1, unit: "cup" },
      { name: "Tomatoes", category: "Vegetables", quantity: 2, unit: "pcs" },
      { name: "Spinach", category: "Vegetables", quantity: 100, unit: "g" },
      { name: "Cheese", category: "Dairy", quantity: 50, unit: "g" },
      { name: "Milk", category: "Dairy", quantity: 0.5, unit: "cup" },
      { name: "Onions", category: "Vegetables", quantity: 1, unit: "pcs" }
    ],
    instructions: [
      "Sauté chopped onions and blended tomatoes in a pot.",
      "Add rice and stir to toast slightly.",
      "Slowly add warm milk and water, stirring constantly until rice absorbs the liquid.",
      "Fold in fresh spinach and let it wilt in the hot rice.",
      "Stir in grated cheese until creamy and thick.",
      "Season with salt and black pepper before serving."
    ],
    nutrition: {
      calories: 510,
      protein: 14,
      carbs: 72,
      fats: 16
    },
    tags: ["Vegetarian", "Under 30 min"]
  },
  {
    title: "Paneer Bhurji (Scrambled Cottage Cheese)",
    cuisine: "Indian",
    cookingTime: 20,
    ingredients: [
      { name: "Cheese", category: "Dairy", quantity: 150, unit: "g" },
      { name: "Onions", category: "Vegetables", quantity: 1, unit: "pcs" },
      { name: "Tomatoes", category: "Vegetables", quantity: 1, unit: "pcs" },
      { name: "Spinach", category: "Vegetables", quantity: 30, unit: "g" },
      { name: "Butter", category: "Dairy", quantity: 1, unit: "tbsp" }
    ],
    instructions: [
      "Crumble the paneer/cheese into small pieces.",
      "Heat butter in a pan, sauté finely chopped onions until golden brown.",
      "Add chopped tomatoes and cook until soft and mushy.",
      "Add chopped spinach and cook for 2 minutes.",
      "Stir in the crumbled cheese, salt, turmeric, and chili powder.",
      "Cook on medium heat for 5 minutes. Serve hot with bread or flatbread."
    ],
    nutrition: {
      calories: 320,
      protein: 18,
      carbs: 8,
      fats: 24
    },
    tags: ["Vegetarian", "High Protein", "Under 30 min"]
  }
];

export async function generateAIModelRecipe(
  availableIngredients: string[],
  preferences: { cuisine?: string[]; diet?: string[]; time?: string; budget?: number }
) {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not defined. Using mock recipe fallbacks.");
    // Filter mock recipes based on simple heuristics to simulate intelligence
    const matches = MOCK_RECIPES.filter(recipe => {
      // Check how many ingredients match
      const recipeIngredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
      const availableNames = availableIngredients.map(i => i.toLowerCase());
      const intersect = recipeIngredientNames.filter(name =>
        availableNames.some(av => av.includes(name) || name.includes(av))
      );
      return intersect.length > 0;
    });

    const chosen = matches.length > 0 
      ? matches[Math.floor(Math.random() * matches.length)] 
      : MOCK_RECIPES[Math.floor(Math.random() * MOCK_RECIPES.length)];
      
    return chosen;
  }

  const prompt = `
Generate a single healthy recipe that matches the following constraints:
- Available ingredients: ${availableIngredients.join(", ")}
- Target cuisines: ${preferences.cuisine?.join(", ") || "Any"}
- Dietary restrictions: ${preferences.diet?.join(", ") || "None"}
- Prep/Cooking time: ${preferences.time || "Any"}
- Budget context: Maximum recipe ingredient cost under ${preferences.budget ? `₹${preferences.budget}` : "flexible"}

Requirements:
1. Maximize the use of the available ingredients.
2. The response must be a single JSON object matching the JSON schema below.
3. Do not include any markdown format blocks like \`\`\`json. Just return raw JSON.
4. If some essential ingredients are missing, include them in the ingredient list with proper quantities.

JSON Schema:
{
  "title": "Name of the dish",
  "cuisine": "The specific cuisine type",
  "cookingTime": 30, // integer representing total minutes
  "ingredients": [
    {
      "name": "Ingredient Name",
      "category": "Vegetables | Grains | Protein | Dairy | Pantry | Other",
      "quantity": 100, // number
      "unit": "g | ml | pcs | cup | tbsp | tsp"
    }
  ],
  "instructions": [
    "Step 1 description",
    "Step 2 description"
  ],
  "nutrition": {
    "calories": 450,
    "protein": 20, // in grams
    "carbs": 50,   // in grams
    "fats": 15     // in grams
  },
  "tags": ["Vegetarian", "High Protein", "Under 30 min"]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini recipe generation error:", error);
    // Return mock fallback
    return MOCK_RECIPES[0];
  }
}

export async function generateAIWeeklyPlan(
  availableIngredients: string[],
  preferences: { cuisine?: string[]; diet?: string[]; time?: string; budget?: number }
) {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not defined. Using mock weekly plan fallback.");
    
    // Construct a beautiful mock plan mapping days to meals
    const plan: Record<string, { Breakfast: any; Lunch: any; Dinner: any }> = {};
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    days.forEach((day, index) => {
      // Rotate mock recipes
      plan[day] = {
        Breakfast: MOCK_RECIPES[index % 3],
        Lunch: MOCK_RECIPES[(index + 1) % 3],
        Dinner: MOCK_RECIPES[(index + 2) % 3]
      };
    });
    
    return plan;
  }

  const prompt = `
Generate a weekly meal plan (7 days, 3 meals per day: Breakfast, Lunch, Dinner) based on:
- Available ingredients: ${availableIngredients.join(", ")}
- Preferred cuisines: ${preferences.cuisine?.join(", ") || "Any"}
- Dietary restrictions: ${preferences.diet?.join(", ") || "None"}
- Maximum time limit per meal: ${preferences.time || "Any"}
- Weekly budget context: Total meal cost should fit ₹${preferences.budget || 1000}.

Rules:
1. Maximize the use of the available ingredients.
2. The response must be a single JSON object matching the JSON schema below.
3. No duplicate meals. Use variety.
4. Ensure balanced nutrition per day.
5. Do not include markdown \`\`\`json. Return raw JSON.

JSON Schema:
{
  "Monday": {
    "Breakfast": { "title": "Meal Title", "cuisine": "Cuisine", "cookingTime": 15, "ingredients": [{"name":"Tomatoes","category":"Vegetables","quantity":2,"unit":"pcs"}], "instructions":["step 1"], "nutrition":{"calories":300,"protein":10,"carbs":30,"fats":10}, "tags":["Vegetarian"] },
    "Lunch": { ... },
    "Dinner": { ... }
  },
  "Tuesday": { ... },
  "Wednesday": { ... },
  "Thursday": { ... },
  "Friday": { ... },
  "Saturday": { ... },
  "Sunday": { ... }
}
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini weekly plan error:", error);
    // Mock recovery
    const plan: Record<string, any> = {};
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].forEach((day, idx) => {
      plan[day] = {
        Breakfast: MOCK_RECIPES[idx % 3],
        Lunch: MOCK_RECIPES[(idx + 1) % 3],
        Dinner: MOCK_RECIPES[(idx + 2) % 3]
      };
    });
    return plan;
  }
}

export async function generateAISubstitution(
  missingIngredient: string,
  recipeTitle?: string
) {
  if (!ai) {
    const mockSubs: Record<string, string[]> = {
      "butter": ["Olive Oil", "Greek Yogurt", "Coconut Oil", "Margarine"],
      "eggs": ["Applesauce", "Mashed Bananas", "Chia Seeds + Water", "Flaxseed Meal + Water"],
      "milk": ["Almond Milk", "Oat Milk", "Soy Milk", "Coconut Milk"],
      "cheese": ["Nutritional Yeast", "Vegan Cheese", "Cashew Cream", "Tofu Scramble"],
      "tomatoes": ["Red Bell Peppers", "Tamarind Paste", "Tomato Paste", "Pumpkin Puree"]
    };
    const key = missingIngredient.toLowerCase().trim();
    return mockSubs[key] || ["Water/Broth", "Coconut Milk", "Applesauce", "Yogurt"];
  }

  const prompt = `
Give a list of 4 best ingredients to substitute for "${missingIngredient}" ${recipeTitle ? `in a recipe for "${recipeTitle}"` : ""}.
The response must be a JSON array of strings. Do not include markdown \`\`\`json. Return raw JSON.
Example:
["Substitute 1", "Substitute 2", "Substitute 3", "Substitute 4"]
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini substitution error:", error);
    return ["Olive Oil", "Applesauce", "Greek Yogurt", "Coconut Oil"];
  }
}
