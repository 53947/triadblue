import { useLocation } from "wouter";
import triadBlueLogo from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";
import blueRedLinkLogo from "@assets/Blue Favicon_1763756571815.png";

/**
 * Determines which logo to show on the right side of the header based on the current page context:
 * - TriadBlue logo: Pages with company information and internal dashboard pages
 * - Blue/Red link logo: Pages pulling data from external/third-party sources
 */
export function useContextLogo() {
  const [location] = useLocation();

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

  return {
    logo: isThirdPartyPage ? blueRedLinkLogo : triadBlueLogo,
    alt: isThirdPartyPage ? "Blue Link" : "TriadBlue",
  };
}
