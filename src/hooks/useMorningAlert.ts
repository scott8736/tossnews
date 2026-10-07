import { useCallback, useEffect, useRef, useState } from "react";
import { Notification } from "@apps-in-toss/web-framework";

// 콘솔 정기 발송 템플릿 "매일 아침 뉴스"의 발송 코드예요. (알림동의문: 일일 뉴스속보 알림, 매일 09:01)
const TEMPLATE_CODE = "moonlighttarot-morning_news";
const STORAGE_KEY = "ntn:morningAlert";

type Stored = "agreed" | "dismissed" | null;

function readStored(): Stored {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "agreed" || value === "dismissed" ? value : null;
  } catch {
    return null;
  }
}

function writeStored(value: Exclude<Stored, null>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // 저장할 수 없어도 이번 실행 동안은 상태로 기억해요.
  }
}

function isSupported(): boolean {
  try {
    return Notification.requestAgreement.isSupported();
  } catch {
    return false;
  }
}

// "매일 아침 뉴스 받기" 알림 신청이에요. 사용자가 직접 누를 때만 동의 화면을 열어요.
// (앱에 들어오자마자 동의 화면을 띄우는 것은 앱인토스 체크리스트 위반이에요.)
export function useMorningAlert(onAgreed: () => void) {
  const [stored, setStored] = useState<Stored>(() => readStored());
  const cleanupRef = useRef<(() => void) | null>(null);
  const supported = isSupported();

  useEffect(() => () => cleanupRef.current?.(), []);

  const request = useCallback(() => {
    if (!supported) return;
    cleanupRef.current?.();
    cleanupRef.current = Notification.requestAgreement({
      options: { templateCode: TEMPLATE_CODE },
      onEvent: (result) => {
        if (result.type === "newAgreement" || result.type === "alreadyAgreed") {
          writeStored("agreed");
          setStored("agreed");
          onAgreed();
        }
      },
      onError: () => {
        // 동의 화면을 열지 못하면 카드를 그대로 둬요. 다음에 다시 누를 수 있어요.
      },
    });
  }, [onAgreed, supported]);

  const dismiss = useCallback(() => {
    writeStored("dismissed");
    setStored("dismissed");
  }, []);

  return {
    // 토스 앱 밖이거나 이미 신청·닫기를 했으면 카드를 보여주지 않아요.
    visible: supported && stored === null,
    request,
    dismiss,
  };
}
