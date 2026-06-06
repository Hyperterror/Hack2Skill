import { NextResponse } from "next/server";
import { generateAIModelRecipe } from "@/lib/gemini";
import { getOrCreateMockUser } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ingredients, preferences } = body;

    // Fetch user context if parameters not provided directly
    let activeIngredients = ingredients;
    let activePreferences = preferences;

    if (!activeIngredients || !activePreferences) {
      const user = await getOrCreateMockUser();
      if (!activeIngredients) {
        const pantryItems = user.pantry ? JSON.parse(user.pantry.ingredients) : [];
        activeIngredients = pantryItems.map((i: any) => i.name);
      }
      if (!activePreferences) {
        activePreferences = JSON.parse(user.preferences);
      }
    }

    if (!Array.isArray(activeIngredients) || activeIngredients.length === 0) {
      return NextResponse.json(
        { success: false, error: "Pantry is empty. Please add ingredients to your pantry first!" },
        { status: 400 }
      );
    }

    const recipe = await generateAIModelRecipe(activeIngredients, activePreferences);

    // Compute match score
    const normalize = (name: string) => {
      return name
        .toLowerCase()
        .split(/\s+/)
        .map(w => w.replace(/s$/, "").trim())
        .filter(w => w.length > 2);
    };

    const availableWords = activeIngredients.flatMap((i: string) => normalize(i));
    let matchedCount = 0;
    const recipeIngredients = recipe.ingredients || [];
    
    recipeIngredients.forEach((ing: any) => {
      const ingWords = normalize(ing.name);
      const isMatch = ingWords.some(ingWord =>
        availableWords.some(avWord => avWord.includes(ingWord) || ingWord.includes(avWord))
      );
      if (isMatch) {
        matchedCount++;
      }
    });

    const totalCount = recipeIngredients.length || 1;
    const matchScore = Math.round((matchedCount / totalCount) * 100);

    return NextResponse.json({
      success: true,
      recipe: {
        ...recipe,
        matchScore: Math.max(matchScore, 30), // ensure a baseline
      },
    });
  } catch (error: any) {
    console.error("Error generating recipe:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
