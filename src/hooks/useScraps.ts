import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ntn:scraps";

function readScraps(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function useScraps() {
  const [scrapIds, setScrapIds] = useState<string[]>(() => readScraps());

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scrapIds));
  }, [scrapIds]);

  const isScrapped = useCallback(
    (id: string) => scrapIds.includes(id),
    [scrapIds],
  );

  const toggleScrap = useCallback((id: string) => {
    setScrapIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [id, ...prev],
    );
  }, []);

  return { scrapIds, isScrapped, toggleScrap };
}
