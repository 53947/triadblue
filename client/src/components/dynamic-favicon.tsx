import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";
import { checkAuth } from "@/lib/auth";

export function DynamicFavicon() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth().then(setIsAuthenticated);
  }, []);

  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    enabled: isAuthenticated,
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
      link.type = "image/png";
      document.head.appendChild(link);
    }

    if (activeFavicon) {
      link.href = `/uploads/${activeFavicon.filename}`;
      link.type = activeFavicon.mimeType || "image/png";
    } else {
      link.href = "/favicon.png";
      link.type = "image/png";
    }
  }, [activeFavicon]);

  return null;
}
