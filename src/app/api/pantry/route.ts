import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateMockUser } from "@/lib/user";

export async function GET() {
  try {
    const user = await getOrCreateMockUser();
    const ingredients = user.pantry ? JSON.parse(user.pantry.ingredients) : [];
    return NextResponse.json({ success: true, ingredients });
  } catch (error: any) {
    console.error("Error fetching pantry:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { ingredients } = await request.json();
    if (!Array.isArray(ingredients)) {
      return NextResponse.json(
        { success: false, error: "ingredients must be an array" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();

    const updatedPantry = await prisma.pantry.update({
      where: { userId: user.id },
      data: {
        ingredients: JSON.stringify(ingredients),
      },
    });

    return NextResponse.json({
      success: true,
      ingredients: JSON.parse(updatedPantry.ingredients),
    });
  } catch (error: any) {
    console.error("Error updating pantry:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
