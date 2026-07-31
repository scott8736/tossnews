import { BottomSheet, Button } from "@toss/tds-mobile";
import { useRewardedAd } from "../ads/useRewardedAd";
import { usePoints } from "../hooks/usePoints";
import { CoinIcon } from "./icons";

interface PointsSheetProps {
  open: boolean;
  onClose: () => void;
}

export function PointsSheet({ open, onClose }: PointsSheetProps) {
  const { points, rewardPerAd, addPointsForAd } = usePoints();
  const { isReady, isSupported, show } = useRewardedAd(addPointsForAd);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      header={<BottomSheet.Header>내 코인</BottomSheet.Header>}
      headerDescription={
        <BottomSheet.HeaderDescription>
          광고를 보면 코인을 모을 수 있어요.
        </BottomSheet.HeaderDescription>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "8px 20px 28px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CoinIcon size={28} color="#FFB800" />
          <span style={{ fontSize: 28, fontWeight: 700, color: "#191F28" }}>
            {points.toLocaleString()}
          </span>
        </div>

        <Button
          display="full"
          color="primary"
          disabled={!isSupported || !isReady}
          onClick={() => show()}
        >
          {isSupported ? `광고 보고 코인 ${rewardPerAd}개 받기` : "토스 앱에서만 볼 수 있어요"}
        </Button>

        {isSupported && !isReady && (
          <span style={{ fontSize: 12.5, color: "#8B95A1" }}>
            광고를 준비하고 있어요. 잠시 후 다시 시도해 주세요.
          </span>
        )}
      </div>
    </BottomSheet>
  );
}
