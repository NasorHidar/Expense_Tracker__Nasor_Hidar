const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "INCOME" },
  { name: "Freelance", type: "INCOME" },
  { name: "Investment", type: "INCOME" },
  { name: "Business", type: "INCOME" },
  { name: "Other Income", type: "INCOME" },
  { name: "Food & Dining", type: "EXPENSE" },
  { name: "Transportation", type: "EXPENSE" },
  { name: "Housing & Rent", type: "EXPENSE" },
  { name: "Utilities", type: "EXPENSE" },
  { name: "Healthcare", type: "EXPENSE" },
  { name: "Entertainment", type: "EXPENSE" },
  { name: "Shopping", type: "EXPENSE" },
  { name: "Education", type: "EXPENSE" },
  { name: "Other Expense", type: "EXPENSE" },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      fullName: "Demo User",
      email: "demo@example.com",
      password: hashedPassword,
    },
  });
  console.log(`✅ Demo user created: ${demoUser.email}`);

  // Create default categories for the demo user
  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        name_type_userId: {
          name: category.name,
          type: category.type,
          userId: demoUser.id,
        },
      },
      update: {},
      create: {
        name: category.name,
        type: category.type,
        userId: demoUser.id,
      },
    });
  }
  console.log(`✅ ${DEFAULT_CATEGORIES.length} default categories created`);

  console.log("🎉 Seeding completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
