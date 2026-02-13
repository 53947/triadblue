import { useEffect } from "react";
import { detectPlatform, getBranding } from "@shared/branding";

/** Sets document.title and theme-color meta tag based on the current subdomain */
export function usePlatformBranding() {
  useEffect(() => {
    const platform = detectPlatform(window.location.hostname);
    const branding = getBranding(platform);

    document.title = branding.title;

    let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }
    meta.content = branding.themeColor;
  }, []);
}
