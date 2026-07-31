import { useCallback, useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { ListHeader, SegmentedControl, Skeleton, Top } from "@toss/tds-mobile";
import "./App.css";
import { BannerAd } from "./ads/BannerAd";
import { safeIsSupported } from "./ads/safeIsSupported";
import { useInterstitialAd } from "./ads/useInterstitialAd";
import { useRewardedAd } from "./ads/useRewardedAd";
import { BreakingTicker } from "./components/BreakingTicker";
import { CategoryTabs, type ActiveTab } from "./components/CategoryTabs";
import { FirstViewAdSheet } from "./components/FirstViewAdSheet";
import { NewsDetail } from "./components/NewsDetail";
import { NewsListItem } from "./components/NewsListItem";
import { PointsSheet } from "./components/PointsSheet";
import { PreferenceSheet } from "./components/PreferenceSheet";
import { ScrapSheet } from "./components/ScrapSheet";
import { BookmarkIcon, CoinIcon, SettingsIcon } from "./components/icons";
import { CATEGORIES, CATEGORY_MAP } from "./data/categories";
import {
  fetchBreakingNews,
  fetchNewsByCategory,
  fetchHomeFeed,
  isLiveDataEnabled,
  type HomeFeed,
} from "./api/naverNews";
import { useFirstViewReward } from "./hooks/useFirstViewReward";
import { usePreferredCategories } from "./hooks/usePreferredCategories";
import { useScraps } from "./hooks/useScraps";
import type { CategoryId, NewsItem, SortOrder } from "./types";

const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// 기사를 이만큼 닫을 때마다 전면 광고를 한 번 보여줘요. (너무 자주 노출되지 않도록)
const INTERSTITIAL_EVERY_N_CLOSES = 3;

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("all");
  const [sort, setSort] = useState<SortOrder>("date");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [homeFeed, setHomeFeed] = useState<HomeFeed | null>(null);
  const [breakingItems, setBreakingItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [pendingNews, setPendingNews] = useState<NewsItem | null>(null);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [scrapOpen, setScrapOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);

  const { scraps, isScrapped, toggleScrap } = useScraps();
  const { preferred, toggle: togglePreferred } = usePreferredCategories();
  const interstitialAd = useInterstitialAd();
  const firstViewReward = useFirstViewReward();
  const pendingNewsRef = useRef<NewsItem | null>(null);
  const detailCloseCountRef = useRef(0);

  useEffect(() => {
    pendingNewsRef.current = pendingNews;
  }, [pendingNews]);

  // 첫 뉴스 보기 광고를 끝까지 시청하면 대기 중이던 기사를 열어줘요.
  const handleFirstViewRewardEarned = useCallback(() => {
    const news = pendingNewsRef.current;
    if (!news) return;
    firstViewReward.markShown();
    setSelectedNews(news);
    setPendingNews(null);
  }, [firstViewReward]);

  const rewardedAd = useRewardedAd(handleFirstViewRewardEarned);

  function closeSheets() {
    setScrapOpen(false);
    setPreferenceOpen(false);
    setPointsOpen(false);
  }

  // 처음 기사를 열 때만 리워드 광고 시청을 안내하고, 이후엔 바로 열어요.
  function handleOpenNews(news: NewsItem) {
    if (!firstViewReward.alreadyShown && rewardedAd.isSupported) {
      setPendingNews(news);
      return;
    }
    setSelectedNews(news);
  }

  function handleSkipFirstViewAd() {
    firstViewReward.markShown();
    setSelectedNews(pendingNewsRef.current);
    setPendingNews(null);
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
        if (activeTab === "all") {
          const feed = await fetchHomeFeed(ALL_CATEGORY_IDS);
          if (!cancelled) {
            setHomeFeed(feed);
            setItems([]);
          }
        } else {
          const result = await fetchNewsByCategory(activeTab, sort);
          if (!cancelled) {
            setItems(result);
            setHomeFeed(null);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setItems([]);
          setHomeFeed(null);
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
  }, [activeTab, sort]);

  const orderedCategoryIds: CategoryId[] = [
    ...preferred,
    ...ALL_CATEGORY_IDS.filter((id) => !preferred.includes(id)),
  ];

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

      <BreakingTicker items={breakingItems} onSelect={handleOpenNews} />

      <div style={{ height: 8 }} />

      <CategoryTabs active={activeTab} onChange={setActiveTab} />

      {activeTab !== "all" && (
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
      )}

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

        {!loading && !errorMessage && activeTab === "all" && homeFeed && (
          <>
            <ListHeader
              title={
                <ListHeader.TitleParagraph typography="t5" fontWeight="bold">
                  지금 가장 빠른 소식 TOP 10
                </ListHeader.TitleParagraph>
              }
            />
            {homeFeed.top.map((news, index) => (
              <NewsListItem
                key={news.id}
                news={news}
                rank={index + 1}
                scrapped={isScrapped(news.id)}
                onOpen={handleOpenNews}
                onToggleScrap={toggleScrap}
              />
            ))}

            {orderedCategoryIds.map((categoryId) => {
              const categoryItems = homeFeed.byCategory[categoryId] ?? [];
              if (categoryItems.length === 0) return null;
              const category = CATEGORY_MAP[categoryId];

              return (
                <div key={categoryId} style={{ marginTop: 20 }}>
                  <ListHeader
                    title={
                      <ListHeader.TitleParagraph typography="t5" fontWeight="bold">
                        {category.label}
                      </ListHeader.TitleParagraph>
                    }
                    right={
                      <ListHeader.RightArrow
                        typography="t7"
                        onClick={() => setActiveTab(categoryId)}
                      >
                        더보기
                      </ListHeader.RightArrow>
                    }
                  />
                  {categoryItems.slice(0, 5).map((news) => (
                    <NewsListItem
                      key={news.id}
                      news={news}
                      scrapped={isScrapped(news.id)}
                      onOpen={handleOpenNews}
                      onToggleScrap={toggleScrap}
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}

        {!loading && !errorMessage && activeTab !== "all" && items.length === 0 && (
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
          activeTab !== "all" &&
          items.map((news) => (
            <NewsListItem
              key={news.id}
              news={news}
              scrapped={isScrapped(news.id)}
              onOpen={handleOpenNews}
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
        onOpenNews={handleOpenNews}
        onToggleScrap={toggleScrap}
      />

      <FirstViewAdSheet
        open={pendingNews !== null}
        isSupported={rewardedAd.isSupported}
        isReady={rewardedAd.isReady}
        onWatch={rewardedAd.show}
        onSkip={handleSkipFirstViewAd}
      />

      <PointsSheet open={pointsOpen} onClose={() => setPointsOpen(false)} />
    </>
  );
}

export default App;
