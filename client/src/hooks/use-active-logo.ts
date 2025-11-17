import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";

export function useActiveLogo() {
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/public/assets/active", { type: "logo" }],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activeLogo = assets.find(
    (asset) => asset.type === "logo" && asset.isActive
  );

  const logoUrl = activeLogo
    ? `/uploads/${activeLogo.filename}`
    : null;

  return { logoUrl, isLoading };
}
