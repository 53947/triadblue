export type Platform = "consoleblue" | "linkblue" | "unknown";

export interface PlatformBranding {
  title: string;
  description: string;
  themeColor: string;
}

const brandingMap: Record<Platform, PlatformBranding> = {
  consoleblue: {
    title: "ConsoleBlue",
    description: "App Building Console for the TriadBlue Ecosystem",
    themeColor: "#10b981",
  },
  linkblue: {
    title: "LINKBlue",
    description: "TriadBlue Operations Center for monitoring and managing all platforms",
    themeColor: "#3b82f6",
  },
  unknown: {
    title: "TriadBlue",
    description: "Multi-platform business management ecosystem",
    themeColor: "#0066FF",
  },
};

export function getBranding(platform: Platform): PlatformBranding {
  return brandingMap[platform] || brandingMap.unknown;
}

/** Detect platform from a hostname string (works on both server and client) */
export function detectPlatform(hostname: string): Platform {
  if (hostname.startsWith("consoleblue.")) return "consoleblue";
  if (hostname.startsWith("linkblue.")) return "linkblue";
  return "unknown";
}
