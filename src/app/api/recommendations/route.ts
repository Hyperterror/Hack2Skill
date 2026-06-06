import { NextResponse } from "next/server";
import { getOrCreateMockUser } from "@/lib/user";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    const user = await getOrCreateMockUser();
    const preferences = JSON.parse(user.preferences);
    const cuisines = preferences.cuisine || [];
    const diets = preferences.diet || [];

    if (!ai) {
      // Return custom static recommendations matching preferences
      let recommendations = ["Paneer Bhurji", "Vegetable Pulao", "Masala Oats"];
      if (cuisines.includes("Italian")) {
        recommendations = ["Caprese Salad", "Spinach Penne Pasta", "Margherita Flatbread"];
      } else if (cuisines.includes("Mexican")) {
        recommendations = ["Vegetarian Quesadilla", "Bean and Cheese Burrito", "Guacamole Salad"];
      }
      return NextResponse.json({ success: true, recommendations });
    }

    const prompt = `
Based on the following user preferences:
- Cuisines: ${cuisines.join(", ") || "Any"}
- Diets: ${diets.join(", ") || "Any"}

Return a list of exactly 5 recipe titles that would be easy to cook.
Return only a JSON array of strings. Do not include markdown \`\`\`json. Return raw JSON.
Example:
["Dish 1", "Dish 2", "Dish 3", "Dish 4", "Dish 5"]
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "[]";
    const recommendations = JSON.parse(text);

    return NextResponse.json({ success: true, recommendations });
  } catch (error: any) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { success: true, recommendations: ["Spinach Egg Fried Rice", "Creamy Tomato Spinach Risotto", "Paneer Bhurji"] }
    );
  }
}
