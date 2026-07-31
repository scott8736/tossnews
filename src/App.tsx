import { useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { SegmentedControl, Skeleton, Top } from "@toss/tds-mobile";
import "./App.css";
import { BannerAd } from "./ads/BannerAd";
import { safeIsSupported } from "./ads/safeIsSupported";
import { useInterstitialAd } from "./ads/useInterstitialAd";
import { BreakingTicker } from "./components/BreakingTicker";
import { CategoryTabs, type ActiveTab } from "./components/CategoryTabs";
import { NewsDetail } from "./components/NewsDetail";
import { NewsListItem } from "./components/NewsListItem";
import { PointsSheet } from "./components/PointsSheet";
import { PreferenceSheet } from "./components/PreferenceSheet";
import { ScrapSheet } from "./components/ScrapSheet";
import { BookmarkIcon, CoinIcon, SettingsIcon } from "./components/icons";
import { CATEGORIES } from "./data/categories";
import {
  fetchBreakingNews,
  fetchNewsByCategory,
  fetchNewsForCategories,
  isLiveDataEnabled,
} from "./api/naverNews";
import { usePreferredCategories } from "./hooks/usePreferredCategories";
import { useScraps } from "./hooks/useScraps";
import type { NewsItem, SortOrder } from "./types";

const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// 기사를 이만큼 닫을 때마다 전면 광고를 한 번 보여줘요. (너무 자주 노출되지 않도록)
const INTERSTITIAL_EVERY_N_CLOSES = 3;

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [sort, setSort] = useState<SortOrder>("date");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [breakingItems, setBreakingItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [scrapOpen, setScrapOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);

  const { scraps, isScrapped, toggleScrap } = useScraps();
  const { preferred, toggle: togglePreferred } = usePreferredCategories();
  const interstitialAd = useInterstitialAd();
  const detailCloseCountRef = useRef(0);

  function closeSheets() {
    setScrapOpen(false);
    setPreferenceOpen(false);
    setPointsOpen(false);
  }

  function handleCloseDetail() {
    setSelectedNews(null);
    detailCloseCountRef.current += 1;
    if (detailCloseCountRef.current % INTERSTITIAL_EVERY_N_CLOSES === 0) {
      interstitialAd.show();
    }
  }

  useEffect(() => {
    if (safeIsSupported(() => TossAds.initialize.isSupported())) {
      TossAds.initialize({});
    }
  }, []);

  useEffect(() => {
    fetchBreakingNews().then(setBreakingItems).catch(() => setBreakingItems([]));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result =
          activeTab === "all"
            ? await fetchNewsForCategories(
                preferred.length > 0 ? preferred : ALL_CATEGORY_IDS,
                sort,
              )
            : await fetchNewsByCategory(activeTab, sort);

        if (!cancelled) setItems(result);
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setErrorMessage(
            error instanceof Error ? error.message : "뉴스를 불러오지 못했어요.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [activeTab, sort, preferred]);

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
              aria-label="내 코인 보기"
              onClick={() => {
                closeSheets();
                setPointsOpen(true);
              }}
              style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
            >
              <CoinIcon size={22} color="#FFB800" />
            </button>
            <button
              aria-label="스크랩한 뉴스 보기"
              onClick={() => {
                closeSheets();
                setScrapOpen(true);
              }}
              style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
            >
              <BookmarkIcon size={22} filled={scraps.length > 0} color="#333D4B" />
            </button>
            <button
              aria-label="관심 카테고리 설정"
              onClick={() => {
                closeSheets();
                setPreferenceOpen(true);
              }}
              style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
            >
              <SettingsIcon size={22} color="#333D4B" />
            </button>
          </div>
        }
      />

      {!isLiveDataEnabled() && (
        <div
          style={{
            margin: "0 20px 12px",
            padding: "10px 12px",
            borderRadius: 10,
            background: "#F2F4F6",
            fontSize: 12.5,
            color: "#6B7684",
          }}
        >
          지금은 데모 데이터를 보여드리고 있어요. VITE_NEWS_PROXY_URL을 설정하면 실시간 네이버
          뉴스로 자동 전환돼요.
        </div>
      )}

      <BreakingTicker items={breakingItems} onSelect={setSelectedNews} />

      <div style={{ height: 8 }} />

      <CategoryTabs active={activeTab} onChange={setActiveTab} />

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0 20px 8px",
        }}
      >
        <SegmentedControl
          size="small"
          value={sort}
          onChange={(value) => setSort(value as SortOrder)}
        >
          <SegmentedControl.Item value="date">최신순</SegmentedControl.Item>
          <SegmentedControl.Item value="sim">정확도순</SegmentedControl.Item>
        </SegmentedControl>
      </div>

      <div style={{ padding: "0 20px 12px" }}>
        <BannerAd />
      </div>

      <div style={{ paddingBottom: 24 }}>
        {loading && (
          <div style={{ padding: "0 20px" }}>
            <Skeleton pattern="subtitleListWithIcon" repeatLastItemCount={5} />
          </div>
        )}

        {!loading && errorMessage && (
          <div
            style={{
              margin: "24px 20px",
              padding: "20px 16px",
              borderRadius: 12,
              background: "#FFF1F1",
              color: "#F04452",
              fontSize: 14,
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}

        {!loading && !errorMessage && items.length === 0 && (
          <div
            style={{
              margin: "24px 20px",
              padding: "32px 16px",
              textAlign: "center",
              color: "#8B95A1",
              fontSize: 14,
            }}
          >
            보여드릴 소식이 없어요.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          items.map((news) => (
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
          onClose={handleCloseDetail}
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
        items={scraps}
        onClose={() => setScrapOpen(false)}
        onOpenNews={setSelectedNews}
        onToggleScrap={toggleScrap}
      />

      <PointsSheet open={pointsOpen} onClose={() => setPointsOpen(false)} />
    </>
  );
}

export default App;
