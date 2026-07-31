import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ntn:points";
const REWARD_PER_AD = 10;

function readPoints(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

export function usePoints() {
  const [points, setPoints] = useState<number>(() => readPoints());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(points));
  }, [points]);

  const addPointsForAd = useCallback(() => {
    setPoints((prev) => prev + REWARD_PER_AD);
  }, []);

  return { points, rewardPerAd: REWARD_PER_AD, addPointsForAd };
}
