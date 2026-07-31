import { useCallback, useEffect, useRef, useState } from "react";
import { loadFullScreenAd, showFullScreenAd } from "@apps-in-toss/web-framework";
import { safeIsSupported } from "./safeIsSupported";

interface UseFullScreenAdOptions {
  onReward?: () => void;
}

export function useFullScreenAd(adGroupId: string, options: UseFullScreenAdOptions = {}) {
  const { onReward } = options;
  const [isReady, setIsReady] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);
  const supported = safeIsSupported(() => loadFullScreenAd.isSupported());

  const load = useCallback(() => {
    if (!supported) return;
    unregisterRef.current?.();
    setIsReady(false);
    unregisterRef.current = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "loaded") setIsReady(true);
      },
      onError: () => setIsReady(false),
    });
  }, [adGroupId, supported]);

  useEffect(() => {
    load();
    return () => unregisterRef.current?.();
  }, [load]);

  // 광고를 표시해요. 준비되지 않았으면 아무 일도 일어나지 않아요(false 반환).
  const show = useCallback(() => {
    if (!supported || !isReady) return false;
    setIsReady(false);
    showFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        if (event.type === "userEarnedReward") onReward?.();
        if (event.type === "dismissed" || event.type === "failedToShow") load();
      },
      onError: load,
    });
    return true;
  }, [adGroupId, isReady, load, onReward, supported]);

  return { isReady, isSupported: supported, show };
}
