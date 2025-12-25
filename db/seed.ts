import { db } from "./index";
import { teachers, reviews } from "./schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Add teachers
  const insertedTeachers = await db
    .insert(teachers)
    .values([
      {
        name: "Dr. Sarah Johnson",
        subject: "Computer Science",
        department: "Engineering",
      },
      {
        name: "Prof. Michael Chen",
        subject: "Mathematics",
        department: "Sciences",
      },
      {
        name: "Ms. Emily Davis",
        subject: "English Literature",
        department: "Humanities",
      },
    ])
    .returning();

  console.log(`✅ Added ${insertedTeachers.length} teachers`);

  // Add sample reviews
  await db.insert(reviews).values([
    {
      teacherId: insertedTeachers[0].id,
      rating: 5,
      comment: "Amazing professor! Really knows the subject well.",
      reviewerName: "Anonymous",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 4,
      comment: "Great teacher, but assignments are tough.",
      reviewerName: "Student123",
    },
    {
      teacherId: insertedTeachers[1].id,
      rating: 5,
      comment: "Best math teacher ever!",
      reviewerName: "MathLover",
    },
  ]);

  console.log("✅ Added sample reviews");
  console.log("🎉 Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
