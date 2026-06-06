import { NextResponse } from "next/server";
import { generateAIWeeklyPlan } from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { getOrCreateMockUser } from "@/lib/user";

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return monday.toISOString().split("T")[0];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const weekStartDate = searchParams.get("weekStartDate") || getMondayOfCurrentWeek();
    const user = await getOrCreateMockUser();

    const mealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId: user.id,
        weekStartDate,
      },
    });

    return NextResponse.json({
      success: true,
      mealPlan: mealPlan ? JSON.parse(mealPlan.plan) : null,
      budgetLimit: mealPlan ? mealPlan.budgetLimit : 1000.0,
      weekStartDate,
    });
  } catch (error: any) {
    console.error("Error fetching weekly planner:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { weekStartDate = getMondayOfCurrentWeek(), budgetLimit = 1000.0, regenerate = false } = body;
    const user = await getOrCreateMockUser();

    // Check if we already have a meal plan for this week
    if (!regenerate) {
      const existingPlan = await prisma.mealPlan.findFirst({
        where: {
          userId: user.id,
          weekStartDate,
        },
      });

      if (existingPlan) {
        return NextResponse.json({
          success: true,
          mealPlan: JSON.parse(existingPlan.plan),
          budgetLimit: existingPlan.budgetLimit,
          weekStartDate,
          message: "Loaded existing plan.",
        });
      }
    }

    // Generate new weekly plan using Gemini
    const pantryItems = user.pantry ? JSON.parse(user.pantry.ingredients) : [];
    const availableIngredients = pantryItems.map((i: any) => i.name);
    const preferences = JSON.parse(user.preferences);

    const weeklyPlan = await generateAIWeeklyPlan(availableIngredients, {
      ...preferences,
      budget: budgetLimit,
    });

    // Upsert the meal plan in the database
    const mealPlanRecord = await prisma.mealPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: user.id,
          weekStartDate,
        },
      },
      update: {
        plan: JSON.stringify(weeklyPlan),
        budgetLimit,
      },
      create: {
        userId: user.id,
        weekStartDate,
        plan: JSON.stringify(weeklyPlan),
        budgetLimit,
      },
    });

    return NextResponse.json({
      success: true,
      mealPlan: JSON.parse(mealPlanRecord.plan),
      budgetLimit: mealPlanRecord.budgetLimit,
      weekStartDate,
    });
  } catch (error: any) {
    console.error("Error generating weekly planner:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { weekStartDate = getMondayOfCurrentWeek(), plan, budgetLimit } = await request.json();
    const user = await getOrCreateMockUser();

    if (!plan) {
      return NextResponse.json(
        { success: false, error: "plan is required" },
        { status: 400 }
      );
    }

    const updateData: any = { plan: JSON.stringify(plan) };
    if (typeof budgetLimit === "number") {
      updateData.budgetLimit = budgetLimit;
    }

    const mealPlanRecord = await prisma.mealPlan.upsert({
      where: {
        userId_weekStartDate: {
          userId: user.id,
          weekStartDate,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        weekStartDate,
        plan: JSON.stringify(plan),
        budgetLimit: budgetLimit ?? 1000.0,
      },
    });

    return NextResponse.json({
      success: true,
      mealPlan: JSON.parse(mealPlanRecord.plan),
      budgetLimit: mealPlanRecord.budgetLimit,
      weekStartDate,
    });
  } catch (error: any) {
    console.error("Error updating weekly planner:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

