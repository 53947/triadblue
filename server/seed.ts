import { db } from "./db";
import { users, projects, agentConnections, emailGithubConfigs } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { TRIADBLUE_PROJECTS } from "./triadblue-config";
import { randomUUID } from "crypto";

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

export async function seedLocalPlatformBuilderAgent() {
  try {
    // Check if local Platform Builder agent already exists (no projectId)
    const [existing] = await db.select().from(agentConnections).where(
      and(
        eq(agentConnections.name, "Platform Builder"),
        eq(agentConnections.agentEndpointUrl, "local")
      )
    );
    
    if (existing) {
      return existing;
    }
    
    // Create local Platform Builder agent
    const [agent] = await db.insert(agentConnections).values({
      projectId: null as any, // Local agent, no project association
      name: "Platform Builder",
      agentEndpointUrl: "local", // Special marker for local agent
      agentApiKey: "", // Not needed for local agent
      isActive: true,
    }).returning();
    
    console.log("✓ Local Platform Builder agent seeded");
    return agent;
  } catch (error) {
    console.error("Error seeding local Platform Builder agent:", error);
    throw error;
  }
}

export async function seedTriadBlueProjects() {
  try {
    const defaultUser = await seedDefaultUser();
    let seededCount = 0;
    let skippedCount = 0;

    for (const projectConfig of TRIADBLUE_PROJECTS) {
      // Check if project already exists by name
      const [existingProject] = await db
        .select()
        .from(projects)
        .where(eq(projects.name, projectConfig.name));

      if (existingProject) {
        skippedCount++;
        
        // Update existing project with standard metadata URL if different
        if (existingProject.metadataApiUrl !== projectConfig.metadataApiUrl) {
          await db.update(projects)
            .set({ metadataApiUrl: projectConfig.metadataApiUrl })
            .where(eq(projects.id, existingProject.id));
          console.log(`  ✓ Updated metadata URL for existing project: ${projectConfig.name}`);
        }
        
        // Update ALL agent connections for this project to use standard URL and name
        const existingConnections = await db
          .select()
          .from(agentConnections)
          .where(eq(agentConnections.projectId, existingProject.id));

        if (existingConnections.length === 0) {
          // No connections exist - create the canonical one
          await db.insert(agentConnections).values({
            projectId: existingProject.id,
            name: `${projectConfig.name} Agent`,
            agentEndpointUrl: projectConfig.agentApiUrl,
            agentApiKey: "", // Empty initially - can be added later if needed
            isActive: true,
          });
          console.log(`  ✓ Agent connection created for existing project: ${projectConfig.name}`);
        } else {
          // Update all existing connections to use standard URL and name
          for (const connection of existingConnections) {
            const needsUpdate = 
              connection.agentEndpointUrl !== projectConfig.agentApiUrl ||
              connection.name !== `${projectConfig.name} Agent`;
            
            if (needsUpdate) {
              await db.update(agentConnections)
                .set({
                  agentEndpointUrl: projectConfig.agentApiUrl,
                  name: `${projectConfig.name} Agent`,
                })
                .where(eq(agentConnections.id, connection.id));
              console.log(`  ✓ Updated agent connection to standard URL and name for: ${projectConfig.name}`);
            }
          }
        }
        continue;
      }

      // Create new project
      const [newProject] = await db.insert(projects).values({
        name: projectConfig.name,
        description: `${projectConfig.name} - TriadBlue Ecosystem Project`,
        color: projectConfig.color,
        icon: projectConfig.icon,
        createdById: defaultUser.id,
        metadataApiUrl: projectConfig.metadataApiUrl,
      }).returning();

      // Create agent connection for this project
      await db.insert(agentConnections).values({
        projectId: newProject.id,
        name: `${projectConfig.name} Agent`,
        agentEndpointUrl: projectConfig.agentApiUrl,
        agentApiKey: "", // Empty initially - can be added later if needed
        isActive: true,
      });

      seededCount++;
      console.log(`  ✓ Created project and agent connection: ${projectConfig.name}`);
    }

    if (seededCount > 0) {
      console.log(`✓ Seeded ${seededCount} TriadBlue project(s) with agent connections`);
    }
    if (skippedCount > 0) {
      console.log(`  (${skippedCount} project(s) already existed)`);
    }
  } catch (error) {
    console.error("Error seeding TriadBlue projects:", error);
    throw error;
  }
}

export async function seedSharedEmailInboxes() {
  try {
    // Email inbox seeding is deferred until database schema is fully synced
    // This avoids conflicts with existing session table during schema migrations
    console.log("  ℹ Email inbox seeding deferred (schema sync required)");
    return;
  } catch (error) {
    console.error("Error with email inbox seeding:", error);
  }
}
