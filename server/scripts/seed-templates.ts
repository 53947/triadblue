#!/usr/bin/env tsx

import { seedDocumentationTemplates } from "../seed-documentation-templates";
import { storage } from "../storage";

async function main() {
  console.log("🌱 Seeding documentation templates...\n");
  
  // Get or create a system user for seeding
  let systemUser = await storage.getUserByUsername("system");
  
  if (!systemUser) {
    console.log("Creating system user...");
    systemUser = await storage.createUser({
      username: "system",
      password: "system", // This won't be used for login
      role: "admin",
    });
    console.log(`System user created with ID: ${systemUser.id}\n`);
  }
  
  await seedDocumentationTemplates(systemUser.id);
  
  console.log("\n✅ Seeding complete!");
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
