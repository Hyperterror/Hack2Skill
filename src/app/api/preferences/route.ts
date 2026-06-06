import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getOrCreateMockUser } from "@/lib/user";

export async function GET() {
  try {
    const user = await getOrCreateMockUser();
    const preferences = JSON.parse(user.preferences);
    return NextResponse.json({ success: true, preferences });
  } catch (error: any) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { preferences } = await request.json();
    if (!preferences) {
      return NextResponse.json(
        { success: false, error: "preferences is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        preferences: JSON.stringify(preferences),
      },
    });

    return NextResponse.json({
      success: true,
      preferences: JSON.parse(updatedUser.preferences),
    });
  } catch (error: any) {
    console.error("Error updating preferences:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
