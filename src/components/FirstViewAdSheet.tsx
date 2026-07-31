import { BottomSheet, Button } from "@toss/tds-mobile";

interface FirstViewAdSheetProps {
  open: boolean;
  isSupported: boolean;
  isReady: boolean;
  onWatch: () => void;
  onSkip: () => void;
}

export function FirstViewAdSheet({
  open,
  isSupported,
  isReady,
  onWatch,
  onSkip,
}: FirstViewAdSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onSkip}
      header={<BottomSheet.Header>첫 뉴스 보기</BottomSheet.Header>}
      headerDescription={
        <BottomSheet.HeaderDescription>
          광고 한 번 보고 첫 뉴스를 확인해 보세요.
        </BottomSheet.HeaderDescription>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          padding: "8px 20px 28px",
        }}
      >
        <Button
          display="full"
          color="primary"
          disabled={!isSupported || !isReady}
          onClick={onWatch}
        >
          {isSupported ? "광고 보고 뉴스 보기" : "뉴스 보기"}
        </Button>

        {isSupported && !isReady && (
          <span style={{ fontSize: 12.5, color: "#8B95A1", textAlign: "center" }}>
            광고를 준비하고 있어요. 잠시 후 다시 시도해 주세요.
          </span>
        )}
      </div>
    </BottomSheet>
  );
}
