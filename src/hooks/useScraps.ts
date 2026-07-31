import { useCallback, useEffect, useState } from "react";
import type { NewsItem } from "../types";

const STORAGE_KEY = "ntn:scraps:v2";

function readScraps(): NewsItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as NewsItem[]) : [];
  } catch {
    return [];
  }
}

export function useScraps() {
  const [scraps, setScraps] = useState<NewsItem[]>(() => readScraps());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scraps));
  }, [scraps]);

  const isScrapped = useCallback(
    (id: string) => scraps.some((item) => item.id === id),
    [scraps],
  );

  const toggleScrap = useCallback((news: NewsItem) => {
    setScraps((prev) =>
      prev.some((item) => item.id === news.id)
        ? prev.filter((item) => item.id !== news.id)
        : [news, ...prev],
    );
  }, []);

  return { scraps, isScrapped, toggleScrap };
}
