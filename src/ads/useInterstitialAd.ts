import { useFullScreenAd } from "./useFullScreenAd";
import { AD_GROUP_IDS } from "./config";

export function useInterstitialAd() {
  return useFullScreenAd(AD_GROUP_IDS.interstitial);
}
