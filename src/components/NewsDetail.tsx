import { useState } from "react";
import { Badge, CTAButton, FixedBottomCTA, Toast } from "@toss/tds-mobile";
import { CATEGORY_MAP } from "../data/categories";
import type { NewsItem } from "../types";
import { openExternalUrl } from "../utils/openExternalUrl";
import { toRelativeTime } from "../utils/time";
import { BackIcon, BookmarkIcon, ShareIcon } from "./icons";

interface NewsDetailProps {
  news: NewsItem;
  scrapped: boolean;
  onClose: () => void;
  onToggleScrap: (news: NewsItem) => void;
}

export function NewsDetail({
  news,
  scrapped,
  onClose,
  onToggleScrap,
}: NewsDetailProps) {
  const [toastOpen, setToastOpen] = useState(false);
  const category = CATEGORY_MAP[news.category];

  async function handleShare() {
    const shareData = {
      title: news.title,
      text: news.description,
      url: news.link,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${news.title}\n${news.link}`);
      setToastOpen(true);
    } catch {
      // 사용자가 공유를 취소한 경우에는 별도 처리를 하지 않아요.
    }
  }

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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 12px",
          flexShrink: 0,
        }}
      >
        <button
          aria-label="뒤로 가기"
          onClick={onClose}
          style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
        >
          <BackIcon />
        </button>
        <button
          aria-label={scrapped ? "스크랩 취소" : "스크랩하기"}
          onClick={() => onToggleScrap(news)}
          style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
        >
          <BookmarkIcon color={scrapped ? "#3182F6" : "#191F28"} filled={scrapped} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        <Badge size="small" variant="weak" color={category.color}>
          {category.label}
        </Badge>

        <h1
          style={{
            fontSize: 21,
            lineHeight: 1.4,
            fontWeight: 700,
            color: "#191F28",
            margin: "12px 0 8px",
          }}
        >
          {news.title}
        </h1>

        <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 20 }}>
          {news.source} · {toRelativeTime(news.publishedAt)}
        </div>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "#333D4B",
            whiteSpace: "pre-line",
            marginBottom: 24,
          }}
        >
          {news.description}
        </p>

        <button
          onClick={() => openExternalUrl(news.link)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            border: "none",
            background: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 13,
            color: "#8B95A1",
          }}
        >
          {news.source} 원문 보기
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <FixedBottomCTA.Double
        leftButton={
          <CTAButton color="dark" variant="weak" onClick={() => onToggleScrap(news)}>
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
              공유하기
            </span>
          </CTAButton>
        }
      />

      <Toast
        position="bottom"
        open={toastOpen}
        text="링크를 복사했어요"
        duration={2000}
        onClose={() => setToastOpen(false)}
      />
    </div>
  );
}
