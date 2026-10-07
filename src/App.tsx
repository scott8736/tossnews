import { useCallback, useEffect, useRef, useState } from "react";
import { TossAds } from "@apps-in-toss/web-framework";
import { ListHeader, SegmentedControl, Skeleton, Toast, Top } from "@toss/tds-mobile";
import "./App.css";
import { BannerAd } from "./ads/BannerAd";
import { safeIsSupported } from "./ads/safeIsSupported";
import { useInterstitialAd } from "./ads/useInterstitialAd";
import { readEntryParams } from "./utils/shareNews";
import { BreakingTicker } from "./components/BreakingTicker";
import { CategoryTabs, type ActiveTab } from "./components/CategoryTabs";
import { MorningAlertCard } from "./components/MorningAlertCard";
import { NewsDetail } from "./components/NewsDetail";
import { NewsListItem } from "./components/NewsListItem";
import { PreferenceSheet } from "./components/PreferenceSheet";
import { ScrapSheet } from "./components/ScrapSheet";
import { BookmarkIcon, SettingsIcon } from "./components/icons";
import { CATEGORIES, CATEGORY_MAP } from "./data/categories";
import {
  fetchBreakingNews,
  fetchNewsByCategory,
  fetchHomeFeed,
  isLiveDataEnabled,
  type HomeFeed,
} from "./api/naverNews";
import { useMorningAlert } from "./hooks/useMorningAlert";
import { usePreferredCategories } from "./hooks/usePreferredCategories";
import { useScraps } from "./hooks/useScraps";
import type { CategoryId, NewsItem, SortOrder } from "./types";

const ALL_CATEGORY_IDS = CATEGORIES.map((c) => c.id);

// 기사를 이만큼 닫았을 때 전면 광고를 보여줘요. 노출 정책(같은 행동마다 반복 금지)에 맞춰
// 한 번 들어온 동안에는 한 번만 보여주고, 나오기 전에 안내 문구를 먼저 띄워요.
const INTERSTITIAL_AFTER_CLOSES = 3;
const INTERSTITIAL_NOTICE_MS = 1200;

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function formatToday(date = new Date()): string {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAYS[date.getDay()]}요일`;
}

function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function SectionDivider() {
  return <div style={{ height: 12, background: "#F2F4F6", margin: "16px 0 4px" }} />;
}

function App() {
  // 공유 링크나 주요 기능 링크로 들어오면 그 탭·기사로 바로 보여줘요.
  const [entry] = useState(() => readEntryParams());
  const [activeTab, setActiveTab] = useState<ActiveTab>(entry.tab ?? "all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [sort, setSort] = useState<SortOrder>("date");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [homeFeed, setHomeFeed] = useState<HomeFeed | null>(null);
  const [breakingItems, setBreakingItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(entry.article);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [scrapOpen, setScrapOpen] = useState(false);

  const { scraps, isScrapped, toggleScrap } = useScraps();
  const { preferred, toggle: togglePreferred } = usePreferredCategories();
  const interstitialAd = useInterstitialAd();
  const [alertToastOpen, setAlertToastOpen] = useState(false);
  const showAlertToast = useCallback(() => setAlertToastOpen(true), []);
  const morningAlert = useMorningAlert(showAlertToast);
  const detailCloseCountRef = useRef(0);
  const interstitialShownRef = useRef(false);
  const [adNoticeOpen, setAdNoticeOpen] = useState(false);
  const detailOpenRef = useRef(false);

  // 기사 상세를 열 때 히스토리를 하나 쌓아둬요. 그래야 기기/토스 앱의 최상단
  // 뒤로가기를 눌렀을 때 미니앱이 통째로 종료되지 않고 상세만 닫혀요.
  useEffect(() => {
    const isOpen = selectedNews !== null;
    if (isOpen && !detailOpenRef.current) {
      window.history.pushState({ ntnView: "newsDetail" }, "");
    }
    detailOpenRef.current = isOpen;
  }, [selectedNews]);

  useEffect(() => {
    let noticeTimer: ReturnType<typeof setTimeout> | undefined;

    function handlePopState() {
      if (!detailOpenRef.current) return;
      setSelectedNews(null);
      detailCloseCountRef.current += 1;

      if (
        !interstitialShownRef.current &&
        detailCloseCountRef.current >= INTERSTITIAL_AFTER_CLOSES &&
        interstitialAd.isReady
      ) {
        interstitialShownRef.current = true;
        setAdNoticeOpen(true);
        noticeTimer = setTimeout(() => {
          setAdNoticeOpen(false);
          interstitialAd.show();
        }, INTERSTITIAL_NOTICE_MS);
      }
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(noticeTimer);
    };
  }, [interstitialAd]);

  function closeSheets() {
    setScrapOpen(false);
    setPreferenceOpen(false);
  }

  // 기사는 광고 없이 바로 열어요. 처음 온 사람이 첫 기사에서 광고에 막히면 돌아오지 않아요.
  // 광고는 기사를 여러 번 닫았을 때의 전면 광고와 코인 시트의 리워드 광고만 남겨요.
  function handleOpenNews(news: NewsItem) {
    setSelectedNews(news);
  }

  useEffect(() => {
    if (safeIsSupported(() => TossAds.initialize.isSupported())) {
      TossAds.initialize({});
    }
  }, []);

  useEffect(() => {
    fetchBreakingNews().then(setBreakingItems).catch(() => setBreakingItems([]));
  }, [refreshKey]);

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
            setUpdatedAt(new Date());
          }
        } else {
          const result = await fetchNewsByCategory(activeTab, sort);
          if (!cancelled) {
            setItems(result);
            setHomeFeed(null);
            setUpdatedAt(new Date());
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
  }, [activeTab, sort, refreshKey]);

  // 상세 화면 아래 "다른 소식"에 쓸 같은 분야 기사예요. 이미 불러온 것만 써서 추가 호출이 없어요.
  function relatedOf(news: NewsItem): NewsItem[] {
    const pool = [...(homeFeed?.byCategory[news.category] ?? []), ...items];
    const seen = new Set<string>();
    return pool.filter((item) => {
      if (item.category !== news.category || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  }

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
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {formatToday()}
              {updatedAt && (
                <>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => setRefreshKey((key) => key + 1)}
                    aria-label="새 소식 불러오기"
                    style={{
                      border: "none",
                      background: "none",
                      padding: 0,
                      font: "inherit",
                      color: "#3182F6",
                      cursor: "pointer",
                    }}
                  >
                    {formatClock(updatedAt)} 기준 ↻
                  </button>
                </>
              )}
            </span>
          </Top.SubtitleParagraph>
        }
        right={
          <div style={{ display: "flex", gap: 4 }}>
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

      {/* 상세 화면에도 배너가 있어서, 상세가 열려 있는 동안 홈 배너는 내려둬요.
          (같은 화면에 같은 형식 광고 2개 금지) */}
      {selectedNews === null && (
        <div style={{ padding: "0 20px 12px" }}>
          <BannerAd />
        </div>
      )}

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

            {morningAlert.visible && (
              <MorningAlertCard
                onRequest={morningAlert.request}
                onDismiss={morningAlert.dismiss}
              />
            )}

            {orderedCategoryIds.map((categoryId) => {
              const categoryItems = homeFeed.byCategory[categoryId] ?? [];
              if (categoryItems.length === 0) return null;
              const category = CATEGORY_MAP[categoryId];

              return (
                <div key={categoryId}>
                  <SectionDivider />
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
                      showCategory={false}
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
            지금은 이 분야에 새로 올라온 소식이 없어요.
            <br />
            잠시 후 위의 시각을 눌러 다시 불러와 주세요.
          </div>
        )}

        {!loading &&
          !errorMessage &&
          activeTab !== "all" &&
          items.map((news) => (
            <NewsListItem
              key={news.id}
              news={news}
              showCategory={false}
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
          related={relatedOf(selectedNews)}
          isScrapped={isScrapped}
          onOpenNews={setSelectedNews}
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

      <Toast
        position="bottom"
        open={alertToastOpen}
        text="매일 아침 9시에 알려드릴게요"
        duration={2500}
        onClose={() => setAlertToastOpen(false)}
      />

      {adNoticeOpen && (
        <div
          role="status"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 40,
            transform: "translateX(-50%)",
            padding: "12px 18px",
            borderRadius: 999,
            background: "rgba(25, 31, 40, 0.9)",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            whiteSpace: "nowrap",
            zIndex: 200,
          }}
        >
          잠시 후 광고가 나와요
        </div>
      )}
    </>
  );
}

export default App;
