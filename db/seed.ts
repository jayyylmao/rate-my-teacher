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

  // Add sample reviews with diverse ratings
  await db.insert(reviews).values([
    // Reviews for Dr. Sarah Johnson (Computer Science)
    {
      teacherId: insertedTeachers[0].id,
      rating: 5,
      comment: "Amazing professor! Really knows the subject well and explains complex algorithms in a way that's easy to understand. Her coding examples are practical and relevant.",
      reviewerName: "Alex M.",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 5,
      comment: "Best CS professor I've had! She's patient, knowledgeable, and genuinely cares about student success. Office hours are super helpful.",
      reviewerName: "Jordan K.",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 4,
      comment: "Great teacher, but assignments are tough. You'll learn a lot if you put in the work. Lectures are well-organized and she provides excellent resources.",
      reviewerName: "Sam P.",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 5,
      comment: "Dr. Johnson is amazing! Her passion for CS is contagious and she makes learning fun. Highly recommend taking her class.",
      reviewerName: "Taylor R.",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 4,
      comment: "Very knowledgeable and approachable. Sometimes goes a bit fast in lectures, but always willing to clarify during office hours.",
      reviewerName: "Casey L.",
    },
    {
      teacherId: insertedTeachers[0].id,
      rating: 3,
      comment: "Good professor overall, but the workload is quite heavy. Make sure you have good time management skills.",
      reviewerName: "Morgan W.",
    },

    // Reviews for Prof. Michael Chen (Mathematics)
    {
      teacherId: insertedTeachers[1].id,
      rating: 5,
      comment: "Best math teacher ever! Makes calculus actually make sense. His step-by-step approach is perfect for learning.",
      reviewerName: "Riley D.",
    },
    {
      teacherId: insertedTeachers[1].id,
      rating: 5,
      comment: "Professor Chen is phenomenal! His enthusiasm for mathematics is inspiring. Tests are fair and he provides great practice problems.",
      reviewerName: "Jamie H.",
    },
    {
      teacherId: insertedTeachers[1].id,
      rating: 4,
      comment: "Excellent teacher with clear explanations. Homework can be challenging but it really helps you understand the material.",
      reviewerName: "Avery S.",
    },
    {
      teacherId: insertedTeachers[1].id,
      rating: 5,
      comment: "I used to hate math, but Prof. Chen changed that! He's patient, explains things multiple ways, and genuinely wants everyone to succeed.",
      reviewerName: "Quinn B.",
    },
    {
      teacherId: insertedTeachers[1].id,
      rating: 2,
      comment: "The material is difficult and the pace is fast. Needs more examples in class.",
      reviewerName: "Anonymous",
    },

    // Reviews for Ms. Emily Davis (English Literature)
    {
      teacherId: insertedTeachers[2].id,
      rating: 5,
      comment: "Ms. Davis brings literature to life! Her discussions are thought-provoking and she creates a welcoming classroom environment.",
      reviewerName: "Drew C.",
    },
    {
      teacherId: insertedTeachers[2].id,
      rating: 4,
      comment: "Really engaging teacher. The reading load is substantial but the discussions make it worthwhile. Great feedback on essays.",
      reviewerName: "Skyler F.",
    },
    {
      teacherId: insertedTeachers[2].id,
      rating: 5,
      comment: "Absolutely love this class! Ms. Davis is passionate about literature and it shows. Best English teacher I've ever had.",
      reviewerName: "River N.",
    },
    {
      teacherId: insertedTeachers[2].id,
      rating: 1,
      comment: "Too much reading and the grading is harsh. Not my favorite class.",
      reviewerName: "Anonymous",
    },
    {
      teacherId: insertedTeachers[2].id,
      rating: 4,
      comment: "Great teacher who really knows her subject. Essay assignments are challenging but you learn a lot about critical analysis.",
      reviewerName: "Blake T.",
    },
  ]);

  console.log("✅ Added sample reviews with diverse ratings");
  console.log("🎉 Database seeded successfully!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
