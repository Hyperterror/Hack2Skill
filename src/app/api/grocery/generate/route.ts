import { NextResponse } from "next/server";
import { getOrCreateMockUser } from "@/lib/user";

export async function POST(request: Request) {
  try {
    const { recipes } = await request.json();
    if (!Array.isArray(recipes)) {
      return NextResponse.json(
        { success: false, error: "recipes must be an array" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();
    const pantryItems = user.pantry ? JSON.parse(user.pantry.ingredients) : [];
    const pantrySet = new Set<string>(pantryItems.map((item: any) => item.name.toLowerCase()));

    const missingIngredients: { name: string; category: string; quantity: number; unit: string }[] = [];

    // Map to combine duplicate missing ingredients
    const missingMap = new Map<string, { name: string; category: string; quantity: number; unit: string }>();

    recipes.forEach((recipe: any) => {
      const ingredients = recipe.ingredients || [];
      ingredients.forEach((ing: any) => {
        const nameLower = ing.name.toLowerCase();
        // Check if ingredient name is present in pantry
        const isAvailable = Array.from(pantrySet).some(
          pantryName => nameLower.includes(pantryName) || pantryName.includes(nameLower)
        );

        if (!isAvailable) {
          const key = ing.name.toLowerCase();
          const existing = missingMap.get(key);
          if (existing) {
            // Combine quantities if they have the same unit
            if (existing.unit === ing.unit) {
              existing.quantity += ing.quantity || 0;
            }
          } else {
            missingMap.set(key, {
              name: ing.name,
              category: ing.category || "Other",
              quantity: ing.quantity || 1,
              unit: ing.unit || "pcs",
            });
          }
        }
      });
    });

    return NextResponse.json({
      success: true,
      groceryList: Array.from(missingMap.values()),
    });
  } catch (error: any) {
    console.error("Error generating grocery list:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
