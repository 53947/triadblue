import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";
import consoleBlueLogo from "@assets/ConsoleBlue-logo_1763756605648.png";
import triadBlueLogo from "@assets/TriadBlue-Logo-Lockup_1763606084811.png";

export function useActiveLogo() {
  const hostname = window.location.hostname;
  const isConsoleBlue = hostname.startsWith("consoleblue.");

  // Always call the hook (React rules), but skip on known subdomains
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/public/assets/active?type=logo"],
    enabled: !isConsoleBlue,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // On ConsoleBlue subdomain, always use the static ConsoleBlue logo
  if (isConsoleBlue) {
    return { logoUrl: consoleBlueLogo, isLoading: false };
  }

  // On root/dev, use the database-driven active logo with TriadBlue fallback
  const activeLogo = assets.find(
    (asset) => asset.type === "logo" && asset.isActive
  );

  const cacheBust = activeLogo?.uploadedAt
    ? new Date(activeLogo.uploadedAt).getTime()
    : Date.now();

  const logoUrl = activeLogo
    ? `/uploads/${activeLogo.filename}?v=${cacheBust}`
    : triadBlueLogo;

  return { logoUrl, isLoading };
}
