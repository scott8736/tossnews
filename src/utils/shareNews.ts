import type { CategoryId, NewsItem } from "../types";

const APP_SCHEME = "intoss://moonlighttarot";

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms));
}

// 공유받은 사람이 링크를 누르면 우리 앱 안에서 그 기사가 바로 열리도록 기사 정보를 경로에 담아요.
// (예전에는 네이버 기사 주소를 그대로 공유해서, 받은 사람이 앱이 아니라 네이버로 갔어요.)
export function buildArticlePath(news: NewsItem): string {
  const params = new URLSearchParams({
    article: news.link,
    title: news.title,
    source: news.source,
    category: news.category,
    at: news.publishedAt,
  });
  return `${APP_SCHEME}?${params.toString()}`;
}

export type ShareResult = "shared" | "copied" | "cancelled";

export async function shareNews(news: NewsItem): Promise<ShareResult> {
  try {
    const { Share } = await import("@apps-in-toss/web-framework");
    const link = await Promise.race([
      Share.createLink({ path: buildArticlePath(news) }),
      timeout(3000),
    ]);
    await Share.sendMessage({
      message: `[오늘의 뉴스속보] ${news.title}\n${link}`,
    });
    return "shared";
  } catch {
    // 토스 앱 밖이거나 공유 링크를 만들지 못했을 때는 기기 공유·복사로 넘어가요.
  }

  try {
    if (navigator.share) {
      await navigator.share({ title: news.title, url: news.link });
      return "shared";
    }
    await navigator.clipboard.writeText(`${news.title}\n${news.link}`);
    return "copied";
  } catch {
    return "cancelled";
  }
}

// 공유 링크나 주요 기능 링크로 들어왔을 때 처음 보여줄 화면을 읽어요.
//   ?tab=economy                → 경제 탭
//   ?article=...&title=...      → 그 기사 상세
export interface EntryParams {
  tab: CategoryId | null;
  article: NewsItem | null;
}

const CATEGORY_IDS: CategoryId[] = [
  "politics",
  "economy",
  "society",
  "it",
  "sports",
  "entertainment",
];

function isCategoryId(value: string | null): value is CategoryId {
  return value !== null && (CATEGORY_IDS as string[]).includes(value);
}

export function readEntryParams(search = window.location.search): EntryParams {
  const params = new URLSearchParams(search);
  const tab = params.get("tab");
  const link = params.get("article");
  const title = params.get("title");

  let article: NewsItem | null = null;
  if (link && title && /^https?:\/\//.test(link)) {
    const category = params.get("category");
    const at = params.get("at");
    article = {
      id: `shared-${link}`,
      title,
      description: "",
      link,
      source: params.get("source") ?? "",
      category: isCategoryId(category) ? category : "society",
      publishedAt: at && !Number.isNaN(Date.parse(at)) ? at : new Date().toISOString(),
    };
  }

  return { tab: isCategoryId(tab) ? tab : null, article };
}
