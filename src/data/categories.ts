import type { Category } from "../types";

export const CATEGORIES: Category[] = [
  { id: "all", label: "전체" },
  { id: "politics", label: "정치" },
  { id: "economy", label: "경제" },
  { id: "society", label: "사회" },
  { id: "it", label: "IT·과학" },
  { id: "sports", label: "스포츠" },
  { id: "entertainment", label: "연예" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
);
