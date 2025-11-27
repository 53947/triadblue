import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import type { InsertProjectRoute } from "@shared/schema";

export interface ScannedRoute {
  name: string;
  path: string;
  filePath: string;
  routeType: "static" | "dynamic" | "layout";
  component?: string;
}

/**
 * Scans The Blue Link's routes from App.tsx and pages directory
 * Returns routes in the format expected by the database
 */
export async function scanTheBlueLinkRoutes(projectId: string): Promise<InsertProjectRoute[]> {
  const routes: InsertProjectRoute[] = [];
  
  try {
    // Read App.tsx to extract route paths
    const appTsxPath = join(process.cwd(), "client/src/App.tsx");
    const appTsxContent = readFileSync(appTsxPath, "utf-8");
    
    // Parse routes from ProtectedRouter function
    const protectedRouterMatch = appTsxContent.match(/function ProtectedRouter\(\) \{[\s\S]*?<Switch>([\s\S]*?)<\/Switch>/);
    
    if (protectedRouterMatch) {
      const routesContent = protectedRouterMatch[1];
      
      // Match each <Route> tag
      const routeMatches = Array.from(routesContent.matchAll(/<Route\s+path="([^"]+)"\s+component=\{([^}]+)\}/g));
      
      for (const match of routeMatches) {
        const path = match[1];
        const component = match[2];
        
        // Determine route type based on path
        const routeType: "static" | "dynamic" = path.includes(":") ? "dynamic" : "static";
        
        // Convert component name to readable name
        const name = componentToName(component);
        
        // Try to find the component file
        const filePath = findComponentFile(component);
        
        routes.push({
          projectId,
          name,
          path,
          filePath,
          routeType,
          framework: "wouter",
          source: "scan",
          meta: { component } as any,
        });
      }
      
      // Also match inline routes (like /github and /settings)
      const inlineRouteMatches = Array.from(routesContent.matchAll(/<Route\s+path="([^"]+)">\s*<div[^>]*>([\s\S]*?)<\/div>/g));
      
      for (const match of inlineRouteMatches) {
        const path = match[1];
        const content = match[2].trim();
        
        // Extract name from content
        const name = path.replace("/", "").replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Home";
        
        routes.push({
          projectId,
          name,
          path,
          filePath: "client/src/App.tsx (inline)",
          routeType: "static",
          framework: "wouter",
          source: "scan",
          meta: { inline: "true" } as any,
        });
      }
    }
    
    // Parse public routes from PublicRouter
    const publicRouterMatch = appTsxContent.match(/function PublicRouter\(\) \{[\s\S]*?<Switch>([\s\S]*?)<\/Switch>/);
    
    if (publicRouterMatch) {
      const routesContent = publicRouterMatch[1];
      const routeMatches = Array.from(routesContent.matchAll(/<Route\s+path="([^"]+)"\s+component=\{([^}]+)\}/g));
      
      for (const match of routeMatches) {
        const path = match[1];
        const component = match[2];
        const name = componentToName(component);
        const filePath = findComponentFile(component);
        
        routes.push({
          projectId,
          name: `${name} (Public)`,
          path,
          filePath,
          routeType: "static",
          framework: "wouter",
          source: "scan",
          meta: { component, public: "true" } as any,
        });
      }
    }
    
  } catch (error) {
    console.error("Error scanning The Blue Link routes:", error);
    throw error;
  }
  
  return routes;
}

/**
 * Convert component name to readable route name
 * e.g., "Dashboard" -> "Dashboard", "ProjectDetail" -> "Project Detail"
 */
function componentToName(component: string): string {
  // Handle special cases
  if (component === "NotFound") return "Not Found";
  
  // Add space before capital letters
  return component.replace(/([A-Z])/g, " $1").trim();
}

/**
 * Find the file path for a component
 */
function findComponentFile(component: string): string {
  const pagesDir = join(process.cwd(), "client/src/pages");
  
  try {
    const files = readdirSync(pagesDir);
    
    // Convert component name to kebab-case or lowercase
    const possibleNames = [
      `${component.toLowerCase()}.tsx`,
      `${component.replace(/([A-Z])/g, "-$1").toLowerCase().slice(1)}.tsx`,
    ];
    
    for (const possibleName of possibleNames) {
      if (files.includes(possibleName)) {
        return `client/src/pages/${possibleName}`;
      }
    }
  } catch (error) {
    console.error("Error finding component file:", error);
  }
  
  // Default fallback
  return `client/src/pages/${component.toLowerCase()}.tsx`;
}
