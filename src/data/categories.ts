import type { Category, CategoryId } from "../types";

export const CATEGORIES: Category[] = [
  { id: "politics", label: "정치", initial: "정", color: "elephant" },
  { id: "economy", label: "경제", initial: "경", color: "blue" },
  { id: "society", label: "사회", initial: "사", color: "green" },
  { id: "it", label: "IT·과학", initial: "IT", color: "teal" },
  { id: "sports", label: "스포츠", initial: "스", color: "yellow" },
  { id: "entertainment", label: "연예", initial: "연", color: "red" },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;
