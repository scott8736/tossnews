import { useFullScreenAd } from "./useFullScreenAd";
import { AD_GROUP_IDS } from "./config";

export function useRewardedAd(onReward: () => void) {
  return useFullScreenAd(AD_GROUP_IDS.rewarded, { onReward });
}
