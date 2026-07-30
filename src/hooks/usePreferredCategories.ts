import { useCallback, useEffect, useState } from "react";
import type { CategoryId } from "../types";

const STORAGE_KEY = "ntn:preferred-categories";

function readPreferred(): CategoryId[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CategoryId[]) : [];
  } catch {
    return [];
  }
}

export function usePreferredCategories() {
  const [preferred, setPreferred] = useState<CategoryId[]>(() =>
    readPreferred(),
  );

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferred));
  }, [preferred]);

  const toggle = useCallback((id: CategoryId) => {
    setPreferred((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }, []);

  return { preferred, toggle };
}
