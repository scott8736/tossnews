export type CategoryId =
  | "politics"
  | "economy"
  | "society"
  | "it"
  | "sports"
  | "entertainment";

export interface Category {
  id: CategoryId;
  label: string;
  initial: string;
  color: "blue" | "teal" | "green" | "red" | "yellow" | "elephant";
}

export type SortOrder = "date" | "sim";

export interface NewsItem {
  id: string;
  category: CategoryId;
  title: string;
  description: string;
  link: string;
  source: string;
  publishedAt: string;
}
