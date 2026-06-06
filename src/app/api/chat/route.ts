import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getOrCreateMockUser } from "@/lib/user";

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message) {
      return NextResponse.json(
        { success: false, error: "message is required" },
        { status: 400 }
      );
    }

    const user = await getOrCreateMockUser();
    const pantryItems = user.pantry ? JSON.parse(user.pantry.ingredients) : [];
    const pantryList = pantryItems.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(", ");
    const preferences = JSON.parse(user.preferences);

    if (!ai) {
      // Mock response if no API key
      const lower = message.toLowerCase();
      let reply = "I'm here to help you cook! You can ask me about substitutions, recipes, or nutrition.";
      
      if (lower.includes("egg")) {
        reply = "Since you have eggs in your pantry, you could make a quick Spinach Egg Fried Rice or a Spinach Cheese Omelette. Both can be completed in under 15 minutes!";
      } else if (lower.includes("substitute") || lower.includes("replace")) {
        reply = "Sure! If you run out of butter, olive oil or Greek yogurt are excellent healthy substitutes. For eggs, applesauce or chia seeds work well depending on the dish.";
      } else if (lower.includes("diet") || lower.includes("vegetarian")) {
        reply = "I see your preferences are set to Vegetarian. All suggestions I generate will adhere to this. Would you like me to suggest a specific vegetarian lunch idea?";
      }
      
      return NextResponse.json({ success: true, reply });
    }

    const systemPrompt = `
You are the CookWise AI Assistant, a professional culinary expert, nutritionist, and cooking companion.
Help the user with recipe recommendations, cooking advice, nutritional questions, ingredient substitutions, and meal planning.

The user's current context:
- Available Pantry Ingredients: ${pantryList || "None"}
- Dietary Preferences: ${preferences.diet?.join(", ") || "Vegetarian"}
- Cuisine Preferences: ${preferences.cuisine?.join(", ") || "Any"}
- Cooking Time Cap: ${preferences.time || "Under 30 min"}
- Budget Cap: Under ₹${preferences.budget || 300} per meal

Rules:
1. Be concise, warm, and structured (use bullet points if listing steps).
2. Recommend recipes they can actually cook with their available pantry.
3. Adhere strictly to their dietary preferences.
`;

    // Map history to Google Gen AI format
    // In @google/genai SDK, chat history can be constructed or passed
    // For simplicity, we can concatenate the message history in a single prompt block
    const prompt = `
System Context: ${systemPrompt}

Conversation:
${history.map((h: any) => `${h.role === "user" ? "User" : "Assistant"}: ${h.content}`).join("\n")}
User: ${message}
Assistant:
`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      success: true,
      reply: response.text?.trim() || "I'm sorry, I couldn't process that.",
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({
      success: true,
      reply: "Oops, my culinary brain hit a snag. Let's try that again! (Gemini API fallback active)",
    });
  }
}
