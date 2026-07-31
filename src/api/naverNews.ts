import { MOCK_NEWS_ITEMS } from "../data/newsData";
import type { CategoryId, NewsItem, SortOrder } from "../types";

const PROXY_URL = (import.meta.env.VITE_NEWS_PROXY_URL ?? "").trim();

interface NaverNewsApiItem {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
}

interface NaverNewsApiResponse {
  items: NaverNewsApiItem[];
}

function stripHtml(text: string): string {
  return text
    .replace(/<\/?b>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function extractSource(link: string): string {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return "news.naver.com";
  }
}

function hashId(link: string): string {
  let hash = 0;
  for (let i = 0; i < link.length; i += 1) {
    hash = (hash * 31 + link.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

async function fetchCategory(
  category: CategoryId | "breaking",
  sort: SortOrder,
  display: number,
): Promise<Omit<NewsItem, "category">[]> {
  const url = new URL("/news", PROXY_URL);
  url.searchParams.set("category", category);
  url.searchParams.set("sort", sort);
  url.searchParams.set("display", String(display));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`뉴스를 불러오지 못했어요. (${res.status})`);
  }

  const data = (await res.json()) as NaverNewsApiResponse;

  return data.items.map((item) => ({
    id: hashId(item.link || item.originallink),
    title: stripHtml(item.title),
    description: stripHtml(item.description),
    link: item.link || item.originallink,
    source: extractSource(item.originallink || item.link),
    publishedAt: new Date(item.pubDate).toISOString(),
  }));
}

export function isLiveDataEnabled(): boolean {
  return PROXY_URL.length > 0;
}

export async function fetchNewsByCategory(
  category: CategoryId,
  sort: SortOrder,
  display = 20,
): Promise<NewsItem[]> {
  if (!isLiveDataEnabled()) {
    return MOCK_NEWS_ITEMS.filter((item) => item.category === category);
  }

  const items = await fetchCategory(category, sort, display);
  return items.map((item) => ({ ...item, category }));
}

export async function fetchNewsForCategories(
  categories: CategoryId[],
  sort: SortOrder,
  perCategory = 6,
): Promise<NewsItem[]> {
  if (!isLiveDataEnabled()) {
    return MOCK_NEWS_ITEMS.filter((item) => categories.includes(item.category));
  }

  const results = await Promise.all(
    categories.map(async (category) => {
      const items = await fetchCategory(category, sort, perCategory);
      return items.map((item) => ({ ...item, category }));
    }),
  );

  return results
    .flat()
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export async function fetchBreakingNews(limit = 6): Promise<NewsItem[]> {
  if (!isLiveDataEnabled()) {
    return [...MOCK_NEWS_ITEMS]
      .sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, limit);
  }

  const items = await fetchCategory("breaking", "date", limit);
  // 속보 쿼리는 특정 카테고리에 매이지 않으니 목록 표시용으로만 사용해요.
  return items.map((item) => ({ ...item, category: "society" as CategoryId }));
}
