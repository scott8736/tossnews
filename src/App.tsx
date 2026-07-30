import { useMemo, useState } from "react";
import { Top } from "@toss/tds-mobile";
import "./App.css";
import { BreakingTicker } from "./components/BreakingTicker";
import { CategoryTabs } from "./components/CategoryTabs";
import { NewsDetail } from "./components/NewsDetail";
import { NewsListItem } from "./components/NewsListItem";
import { PreferenceSheet } from "./components/PreferenceSheet";
import { ScrapSheet } from "./components/ScrapSheet";
import { BookmarkIcon, SettingsIcon } from "./components/icons";
import { NEWS_ITEMS } from "./data/newsData";
import { usePreferredCategories } from "./hooks/usePreferredCategories";
import { useScraps } from "./hooks/useScraps";
import type { CategoryId, NewsItem } from "./types";

function App() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [scrapOpen, setScrapOpen] = useState(false);

  const { scrapIds, isScrapped, toggleScrap } = useScraps();
  const { preferred, toggle: togglePreferred } = usePreferredCategories();

  const breakingItems = useMemo(
    () => NEWS_ITEMS.filter((item) => item.breaking),
    [],
  );

  const visibleItems = useMemo(() => {
    const filtered =
      activeCategory === "all"
        ? NEWS_ITEMS
        : NEWS_ITEMS.filter((item) => item.category === activeCategory);

    if (activeCategory !== "all" || preferred.length === 0) {
      return filtered;
    }

    const preferredItems = filtered.filter((item) =>
      preferred.includes(item.category),
    );
    const restItems = filtered.filter(
      (item) => !preferred.includes(item.category),
    );
    return [...preferredItems, ...restItems];
  }, [activeCategory, preferred]);

  const scrappedItems = useMemo(
    () => NEWS_ITEMS.filter((item) => scrapIds.includes(item.id)),
    [scrapIds],
  );

  return (
    <>
      <Top
        upperGap={12}
        lowerGap={16}
        title={
          <Top.TitleParagraph size={22}>오늘의 뉴스속보</Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={15}>
            지금 이 순간, 가장 중요한 소식만 골라봤어요.
          </Top.SubtitleParagraph>
        }
        right={
          <div style={{ display: "flex", gap: 4 }}>
            <button
              aria-label="스크랩한 뉴스 보기"
              onClick={() => setScrapOpen(true)}
              style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
            >
              <BookmarkIcon size={22} filled={scrapIds.length > 0} color="#333D4B" />
            </button>
            <button
              aria-label="관심 카테고리 설정"
              onClick={() => setPreferenceOpen(true)}
              style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
            >
              <SettingsIcon size={22} color="#333D4B" />
            </button>
          </div>
        }
      />

      <BreakingTicker items={breakingItems} onSelect={setSelectedNews} />

      <div style={{ height: 8 }} />

      <CategoryTabs active={activeCategory} onChange={setActiveCategory} />

      <div style={{ paddingBottom: 24 }}>
        {visibleItems.map((news) => (
          <NewsListItem
            key={news.id}
            news={news}
            scrapped={isScrapped(news.id)}
            onOpen={setSelectedNews}
            onToggleScrap={toggleScrap}
          />
        ))}
      </div>

      {selectedNews && (
        <NewsDetail
          news={selectedNews}
          scrapped={isScrapped(selectedNews.id)}
          onClose={() => setSelectedNews(null)}
          onToggleScrap={toggleScrap}
        />
      )}

      <PreferenceSheet
        open={preferenceOpen}
        preferred={preferred}
        onToggle={togglePreferred}
        onClose={() => setPreferenceOpen(false)}
      />

      <ScrapSheet
        open={scrapOpen}
        items={scrappedItems}
        onClose={() => setScrapOpen(false)}
        onOpenNews={setSelectedNews}
        onToggleScrap={toggleScrap}
      />
    </>
  );
}

export default App;
