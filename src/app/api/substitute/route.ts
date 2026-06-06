import { NextResponse } from "next/server";
import { generateAISubstitution } from "@/lib/gemini";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredient = searchParams.get("ingredient");
    const recipe = searchParams.get("recipe") || undefined;

    if (!ingredient) {
      return NextResponse.json(
        { success: false, error: "ingredient parameter is required" },
        { status: 400 }
      );
    }

    const substitutes = await generateAISubstitution(ingredient, recipe);
    return NextResponse.json({ success: true, substitutes });
  } catch (error: any) {
    console.error("Substitution API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
