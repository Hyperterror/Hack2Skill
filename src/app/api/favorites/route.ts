import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateMockUser } from "@/lib/user";

export async function GET() {
  try {
    const user = await getOrCreateMockUser();
    const favorites = await prisma.recipe.findMany({
      where: {
        users: {
          some: { id: user.id },
        },
      },
    });

    // Parse JSON strings back to structures
    const parsedFavorites = favorites.map((rec) => ({
      ...rec,
      ingredients: JSON.parse(rec.ingredients),
      instructions: JSON.parse(rec.instructions),
      nutrition: JSON.parse(rec.nutrition),
      tags: JSON.parse(rec.tags),
    }));

    return NextResponse.json({ success: true, favorites: parsedFavorites });
  } catch (error: any) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const recipe = await request.json();
    if (!recipe || !recipe.title) {
      return NextResponse.json(
        { success: false, error: "Invalid recipe payload" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();

    // Check if recipe already exists in DB by id or title
    let dbRecipe = null;
    if (recipe.id) {
      dbRecipe = await prisma.recipe.findUnique({ where: { id: recipe.id } });
    }

    if (!dbRecipe) {
      // Create new recipe entry
      dbRecipe = await prisma.recipe.create({
        data: {
          id: recipe.id || undefined,
          title: recipe.title,
          cuisine: recipe.cuisine || "Other",
          cookingTime: Number(recipe.cookingTime) || 30,
          ingredients: JSON.stringify(recipe.ingredients || []),
          instructions: JSON.stringify(recipe.instructions || []),
          nutrition: JSON.stringify(recipe.nutrition || {}),
          tags: JSON.stringify(recipe.tags || []),
        },
      });
    }

    // Connect user to recipe
    await prisma.user.update({
      where: { id: user.id },
      data: {
        favoriteRecipes: {
          connect: { id: dbRecipe.id },
        },
      },
    });

    return NextResponse.json({ success: true, recipe: dbRecipe });
  } catch (error: any) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get("recipeId");

    if (!recipeId) {
      return NextResponse.json(
        { success: false, error: "recipeId is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();

    // Disconnect user from recipe
    await prisma.user.update({
      where: { id: user.id },
      data: {
        favoriteRecipes: {
          disconnect: { id: recipeId },
        },
      },
    });

    return NextResponse.json({ success: true, message: "Removed from favorites." });
  } catch (error: any) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
