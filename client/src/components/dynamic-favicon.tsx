import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Asset } from "@shared/schema";

export function DynamicFavicon() {
  const { data: assets = [] } = useQuery<Asset[]>({
    queryKey: ["/api/public/assets/active?type=favicon"],
    retry: false,
    refetchOnWindowFocus: false,
  });

  const activeFavicon = assets.find(
    (asset) => asset.type === "favicon" && asset.isActive
  );

  useEffect(() => {
    const relativeFaviconUrl = activeFavicon 
      ? `/uploads/${activeFavicon.filename}`
      : "/favicon.png";
    const absoluteFaviconUrl = window.location.origin + relativeFaviconUrl;
    const mimeType = activeFavicon?.mimeType || "image/png";

    const iconSelectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']"
    ];

    iconSelectors.forEach(selector => {
      const links = document.querySelectorAll<HTMLLinkElement>(selector);
      links.forEach(link => {
        link.href = relativeFaviconUrl;
        link.type = mimeType;
      });
    });

    const ogImage = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    if (ogImage) {
      ogImage.content = absoluteFaviconUrl;
    }

    const twitterImage = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
    if (twitterImage) {
      twitterImage.content = absoluteFaviconUrl;
    }
  }, [activeFavicon]);

  return null;
}
