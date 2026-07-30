export type CategoryId =
  | "all"
  | "politics"
  | "economy"
  | "society"
  | "it"
  | "sports"
  | "entertainment";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface NewsItem {
  id: string;
  category: Exclude<CategoryId, "all">;
  title: string;
  source: string;
  publishedAt: string;
  thumbnail: string;
  breaking?: boolean;
  summaryLine: string;
  summaryShort: string;
  summaryLong: string;
}
