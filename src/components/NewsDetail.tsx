import { useEffect, useRef, useState } from "react";
import { Button, CTAButton, FixedBottomCTA, Toast } from "@toss/tds-mobile";
import { BannerAd } from "../ads/BannerAd";
import { CATEGORY_MAP } from "../data/categories";
import type { NewsItem } from "../types";
import { openExternalUrl } from "../utils/openExternalUrl";
import { shareNews } from "../utils/shareNews";
import { toRelativeTime } from "../utils/time";
import { BookmarkIcon, ShareIcon } from "./icons";
import { NewsListItem } from "./NewsListItem";

interface NewsDetailProps {
  news: NewsItem;
  scrapped: boolean;
  related: NewsItem[];
  isScrapped: (id: string) => boolean;
  onOpenNews: (news: NewsItem) => void;
  onToggleScrap: (news: NewsItem) => void;
}

export function NewsDetail({
  news,
  scrapped,
  related,
  isScrapped,
  onOpenNews,
  onToggleScrap,
}: NewsDetailProps) {
  const [toastText, setToastText] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const category = CATEGORY_MAP[news.category];

  // 아래 "다른 소식"을 눌러 기사가 바뀌면 맨 위부터 보여줘요.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [news.id]);

  async function handleShare() {
    const result = await shareNews(news);
    if (result === "copied") setToastText("링크를 복사했어요");
  }

  function handleToggleScrap() {
    onToggleScrap(news);
    setToastText(scrapped ? "스크랩을 취소했어요" : "스크랩했어요");
  }

  const others = related.filter((item) => item.id !== news.id).slice(0, 5);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#fff",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단 헤더·뒤로가기 버튼은 두지 않아요. 토스 내비게이션 바의 뒤로가기가 popstate로
          상세를 닫아요. (2026-10-07 검수 반려: 뒤로가기 버튼 중복) */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 120 }}>
        <article style={{ padding: "24px 20px 8px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#3182F6" }}>
            {category.label}
          </div>

          <h1
            style={{
              fontSize: 24,
              lineHeight: 1.42,
              fontWeight: 700,
              letterSpacing: -0.4,
              color: "#191F28",
              margin: "8px 0 12px",
              wordBreak: "keep-all",
            }}
          >
            {news.title}
          </h1>

          <div style={{ fontSize: 15, color: "#8B95A1" }}>
            {news.source && `${news.source} · `}
            {toRelativeTime(news.publishedAt)}
          </div>

          {news.description && (
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.75,
                color: "#333D4B",
                margin: "24px 0 0",
                wordBreak: "keep-all",
              }}
            >
              {news.description}
            </p>
          )}

          <div style={{ marginTop: 28 }}>
            <Button
              display="full"
              size="large"
              color="primary"
              variant="weak"
              onClick={() => openExternalUrl(news.link)}
            >
              {news.source ? `${news.source}에서 기사 전체 보기` : "기사 전체 보기"}
            </Button>
          </div>
        </article>

        <div style={{ padding: "16px 20px 8px" }}>
          <BannerAd />
        </div>

        {others.length > 0 && (
          <section>
            <div style={{ height: 12, background: "#F2F4F6", margin: "12px 0 8px" }} />
            <h2
              style={{
                fontSize: 19,
                fontWeight: 700,
                color: "#191F28",
                margin: 0,
                padding: "16px 20px 4px",
              }}
            >
              {category.label} 다른 소식
            </h2>
            {others.map((item) => (
              <NewsListItem
                key={item.id}
                news={item}
                showCategory={false}
                scrapped={isScrapped(item.id)}
                onOpen={onOpenNews}
                onToggleScrap={onToggleScrap}
              />
            ))}
          </section>
        )}
      </div>

      <FixedBottomCTA.Double
        leftButton={
          <CTAButton color="dark" variant="weak" onClick={handleToggleScrap}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <BookmarkIcon size={18} color="#333D4B" filled={scrapped} />
              {scrapped ? "스크랩 취소" : "스크랩"}
            </span>
          </CTAButton>
        }
        rightButton={
          <CTAButton color="primary" variant="fill" onClick={handleShare}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ShareIcon size={18} color="#fff" />
              친구에게 공유
            </span>
          </CTAButton>
        }
      />

      <Toast
        position="bottom"
        open={toastText !== null}
        text={toastText ?? ""}
        duration={2000}
        onClose={() => setToastText(null)}
      />
    </div>
  );
}
