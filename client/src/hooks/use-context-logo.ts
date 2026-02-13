import { useLocation } from "wouter";
import triadBlueLogo from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import blueRedLinkLogo from "@assets/Blue Favicon_1763756571815.png";

/**
 * Determines which logo to show on the right side of the header based on the current page context:
 * - On consoleblue subdomain: ConsoleBlue logo (or link logo for third-party pages)
 * - On root/dev: TriadBlue logo (or link logo for third-party pages)
 */
export function useContextLogo() {
  const [location] = useLocation();
  const hostname = window.location.hostname;
  const isConsoleBlue = hostname.startsWith("consoleblue.");

  // Pages that pull data from external/third-party sources
  const thirdPartyPages = [
    '/site-map',      // Pulls routes from external projects
    '/github',        // GitHub activity from external repos
    '/agent-chat',    // Pulls from external agents
    '/timeline',      // Aggregates data from multiple sources
    '/embeds',        // Third-party project embeds
  ];

  // Check if current page is a third-party data page
  const isThirdPartyPage = thirdPartyPages.some(page => location.startsWith(page));

  if (isThirdPartyPage) {
    return { logo: blueRedLinkLogo, alt: "Blue Link" };
  }

  return {
    logo: isConsoleBlue ? consoleBlueLogo : triadBlueLogo,
    alt: isConsoleBlue ? "ConsoleBlue" : "TriadBlue",
  };
}
