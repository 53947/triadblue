/**
 * TriadBlue Ecosystem Configuration
 * 
 * This file contains hard-coded standard URLs for all TriadBlue projects.
 * These URLs are pre-filled throughout ConsoleBlue but remain editable
 * in case of deployment changes or custom domains.
 */

export interface ProjectEndpoints {
  name: string;
  code: string;
  color: string;
  icon: string;
  agentApiUrl: string;
  metadataApiUrl: string;
  primaryDomain?: string;
}

export const TRIADBLUE_PROJECTS: ProjectEndpoints[] = [
  {
    name: "Site Inspector",
    code: "siteinspector",
    color: "#10B981", // emerald-500
    icon: "Microscope",
    agentApiUrl: "https://siteinspector.replit.app/api/agent",
    metadataApiUrl: "https://siteinspector.replit.app/api/metadata",
    primaryDomain: "siteinspector.dev",
  },
  {
    name: "BusinessBlueprint",
    code: "businessblueprint",
    color: "#8B5CF6", // violet-500
    icon: "Briefcase",
    agentApiUrl: "https://businessblueprint.replit.app/api/agent",
    metadataApiUrl: "https://businessblueprint.replit.app/api/metadata",
    primaryDomain: "businessblueprint.io",
  },
  {
    name: "HostsBlue",
    code: "hostsblue",
    color: "#06B6D4", // cyan-500
    icon: "Server",
    agentApiUrl: "https://hostsblue.replit.app/api/agent",
    metadataApiUrl: "https://hostsblue.replit.app/api/metadata",
  },
  {
    name: "SwipesBlue",
    code: "swipesblue",
    color: "#EC4899", // pink-500
    icon: "Heart",
    agentApiUrl: "https://swipesblue.replit.app/api/agent",
    metadataApiUrl: "https://swipesblue.replit.app/api/metadata",
  },
  {
    name: "List It",
    code: "listit",
    color: "#F59E0B", // amber-500
    icon: "List",
    agentApiUrl: "https://listit.replit.app/api/agent",
    metadataApiUrl: "https://listit.replit.app/api/metadata",
  },
];

/**
 * Get standard agent API URL for a project by code
 */
export function getAgentApiUrl(projectCode: string): string | null {
  const project = TRIADBLUE_PROJECTS.find(p => p.code === projectCode);
  return project?.agentApiUrl || null;
}

/**
 * Get standard metadata API URL for a project by code
 */
export function getMetadataApiUrl(projectCode: string): string | null {
  const project = TRIADBLUE_PROJECTS.find(p => p.code === projectCode);
  return project?.metadataApiUrl || null;
}

/**
 * Get project configuration by code
 */
export function getProjectConfig(projectCode: string): ProjectEndpoints | null {
  return TRIADBLUE_PROJECTS.find(p => p.code === projectCode) || null;
}
