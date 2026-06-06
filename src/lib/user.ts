import prisma from "./prisma";

export const MOCK_USER_ID = "mock-user-123";

export async function getOrCreateMockUser() {
  let user = await prisma.user.findUnique({
    where: { id: MOCK_USER_ID },
    include: { pantry: true },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: MOCK_USER_ID,
        name: "Chef Guest",
        email: "guest@cookwise.ai",
        preferences: JSON.stringify({
          cuisine: ["Indian", "Italian"],
          diet: ["Vegetarian"],
          time: "Under 30 min",
          budget: 300,
        }),
        pantry: {
          create: {
            ingredients: JSON.stringify([
              { id: "1", name: "Tomatoes", category: "Vegetables" },
              { id: "2", name: "Onions", category: "Vegetables" },
              { id: "3", name: "Rice", category: "Grains" },
              { id: "4", name: "Eggs", category: "Protein" },
              { id: "5", name: "Milk", category: "Dairy" },
              { id: "6", name: "Cheese", category: "Dairy" },
              { id: "7", name: "Spinach", category: "Vegetables" },
            ]),
          },
        },
      },
      include: { pantry: true },
    });
  }

  return user;
}
