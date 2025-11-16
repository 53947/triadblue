import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDefaultUser() {
  try {
    // Check if default user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, "default-user"));
    
    if (existingUser) {
      return existingUser;
    }
    
    // Create default user
    const [newUser] = await db.insert(users).values({
      id: "default-user",
      username: "owner",
      password: "not-used", // Password not used in this version
      role: "owner",
    }).returning();
    console.log("✓ Default user seeded");
    return newUser;
  } catch (error) {
    console.error("Error seeding default user:", error);
    throw error;
  }
}
