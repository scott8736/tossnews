import { useCallback, useState } from "react";

const STORAGE_KEY = "ntn:firstViewRewardShown";

function readShown(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useFirstViewReward() {
  const [alreadyShown, setAlreadyShown] = useState<boolean>(() => readShown());

  const markShown = useCallback(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // localStorage 접근 불가 시에도 이번 세션 동안은 다시 묻지 않도록 상태만 갱신해요.
    }
    setAlreadyShown(true);
  }, []);

  return { alreadyShown, markShown };
}
