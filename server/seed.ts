import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDefaultUser() {
  try {
    // Check if default user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.id, "default-user"));
    
    if (!existingUser) {
      // Create default user
      await db.insert(users).values({
        id: "default-user",
        username: "owner",
        password: "not-used", // Password not used in this version
        role: "owner",
      });
      console.log("✓ Default user seeded");
    }
  } catch (error) {
    console.error("Error seeding default user:", error);
  }
}
