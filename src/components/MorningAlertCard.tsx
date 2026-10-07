import { Button } from "@toss/tds-mobile";

interface MorningAlertCardProps {
  onRequest: () => void;
  onDismiss: () => void;
}

export function MorningAlertCard({ onRequest, onDismiss }: MorningAlertCardProps) {
  return (
    <div
      style={{
        margin: "20px 20px 4px",
        padding: "20px 20px 16px",
        borderRadius: 16,
        background: "#F2F7FF",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: "#191F28", lineHeight: 1.4 }}>
        매일 아침 9시에
        <br />
        주요 뉴스를 알려드릴까요?
      </div>
      <div style={{ fontSize: 15, color: "#4E5968", marginTop: 6, lineHeight: 1.5 }}>
        신청하면 토스 알림으로 하루 한 번만 보내드려요.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <Button display="full" size="medium" color="dark" variant="weak" onClick={onDismiss}>
            닫기
          </Button>
        </div>
        <div style={{ flex: 2 }}>
          <Button display="full" size="medium" color="primary" onClick={onRequest}>
            아침 뉴스 알림 받기
          </Button>
        </div>
      </div>
    </div>
  );
}
