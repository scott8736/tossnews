import { useState } from "react";
import {
  Badge,
  CTAButton,
  FixedBottomCTA,
  SegmentedControl,
  Toast,
} from "@toss/tds-mobile";
import { CATEGORY_LABEL } from "../data/categories";
import type { NewsItem } from "../types";
import { toRelativeTime } from "../utils/time";
import { BackIcon, BookmarkIcon, ShareIcon } from "./icons";

type SummaryDepth = "line" | "short" | "long";

interface NewsDetailProps {
  news: NewsItem;
  scrapped: boolean;
  onClose: () => void;
  onToggleScrap: (id: string) => void;
}

const SUMMARY_LABEL: Record<SummaryDepth, string> = {
  line: "한 줄",
  short: "짧게",
  long: "자세히",
};

export function NewsDetail({
  news,
  scrapped,
  onClose,
  onToggleScrap,
}: NewsDetailProps) {
  const [depth, setDepth] = useState<SummaryDepth>("short");
  const [toastOpen, setToastOpen] = useState(false);

  const summaryText =
    depth === "line"
      ? news.summaryLine
      : depth === "short"
        ? news.summaryShort
        : news.summaryLong;

  async function handleShare() {
    const shareData = {
      title: news.title,
      text: news.summaryLine,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${news.title}\n${window.location.href}`);
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
          onClick={() => onToggleScrap(news.id)}
          style={{ border: "none", background: "none", padding: 8, cursor: "pointer" }}
        >
          <BookmarkIcon color={scrapped ? "#3182F6" : "#191F28"} filled={scrapped} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 32px" }}>
        <Badge
          size="small"
          variant="weak"
          color="blue"
        >
          {CATEGORY_LABEL[news.category]}
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

        <div style={{ fontSize: 13, color: "#8B95A1", marginBottom: 16 }}>
          {news.source} · {toRelativeTime(news.publishedAt)}
        </div>

        <img
          src={news.thumbnail}
          alt=""
          style={{ width: "100%", borderRadius: 16, display: "block", marginBottom: 20 }}
        />

        <div style={{ marginBottom: 12 }}>
          <SegmentedControl
            size="small"
            value={depth}
            onChange={(value) => setDepth(value as SummaryDepth)}
          >
            {(Object.keys(SUMMARY_LABEL) as SummaryDepth[]).map((key) => (
              <SegmentedControl.Item key={key} value={key}>
                {SUMMARY_LABEL[key]}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl>
        </div>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "#333D4B",
            whiteSpace: "pre-line",
          }}
        >
          {summaryText}
        </p>
      </div>

      <FixedBottomCTA.Double
        leftButton={
          <CTAButton color="dark" variant="weak" onClick={() => onToggleScrap(news.id)}>
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
