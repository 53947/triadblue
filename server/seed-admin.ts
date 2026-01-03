import bcrypt from "bcrypt";
import { db } from "./db";
import { adminUsers } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedAdmin() {
  const email = "53947@triadblue.com";
  const password = "board.Triad$2026";
  
  // Hash password with 12 salt rounds
  const passwordHash = await bcrypt.hash(password, 12);
  
  // Check if user already exists
  const existing = await db.select().from(adminUsers).where(
    eq(adminUsers.email, email)
  );
  
  if (existing.length > 0) {
    console.log("Admin user already exists, updating...");
    await db.update(adminUsers)
      .set({ 
        passwordHash,
        linkblueAccess: true,
        consoleblueAccess: true
      })
      .where(eq(adminUsers.email, email));
  } else {
    await db.insert(adminUsers).values({
      email,
      passwordHash,
      displayName: "TriadBlue Admin",
      linkblueAccess: true,
      consoleblueAccess: true,
    });
  }
  
  console.log("Admin user created/updated successfully!");
  console.log(`Email: ${email}`);
  console.log("Access: LINKBlue Dashboard + ConsoleBlue Panel");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("Error seeding admin:", err);
  process.exit(1);
});
