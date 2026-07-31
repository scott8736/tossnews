import { useEffect, useRef } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { AD_GROUP_IDS } from "./config";
import { safeIsSupported } from "./safeIsSupported";

// 토스 앱 밖(일반 브라우저)에서는 조용히 아무것도 렌더링하지 않아요.
export function BannerAd() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!safeIsSupported(() => TossAds.attachBanner.isSupported()) || !containerRef.current) {
      return;
    }

    const attached = TossAds.attachBanner(AD_GROUP_IDS.banner, containerRef.current, {
      theme: "auto",
      tone: "blackAndWhite",
      variant: "expanded",
    });

    return () => attached.destroy();
  }, []);

  return <div ref={containerRef} style={{ width: "100%", minHeight: 96 }} />;
}
