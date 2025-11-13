import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";

export function DynamicFavicon() {
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activeFavicon = assets.find(
    (asset) => asset.type === "favicon" && asset.isActive
  );

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    if (activeFavicon) {
      link.href = `/uploads/${activeFavicon.filename}`;
    } else {
      link.href = "/favicon.ico";
    }
  }, [activeFavicon]);

  return null;
}
