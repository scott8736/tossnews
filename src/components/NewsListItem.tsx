import { ListRow } from "@toss/tds-mobile";
import { CATEGORY_MAP } from "../data/categories";
import type { NewsItem } from "../types";
import { toRelativeTime } from "../utils/time";
import { BookmarkIcon } from "./icons";

interface NewsListItemProps {
  news: NewsItem;
  scrapped: boolean;
  onOpen: (news: NewsItem) => void;
  onToggleScrap: (news: NewsItem) => void;
  rank?: number;
  // 분야 탭 안에서는 모든 기사가 같은 분야라 분야 이름을 숨겨요.
  showCategory?: boolean;
}

// 분야 이름에 쓰는 글자색이에요. 배지 대신 글자색만 써서 목록을 가볍게 보여줘요.
const CATEGORY_TEXT_COLOR: Record<string, string> = {
  elephant: "#4E5968",
  blue: "#3182F6",
  green: "#03B26C",
  teal: "#18A5A5",
  yellow: "#E5A100",
  red: "#F04452",
};

export function NewsListItem({
  news,
  scrapped,
  onOpen,
  onToggleScrap,
  rank,
  showCategory = true,
}: NewsListItemProps) {
  const category = CATEGORY_MAP[news.category];

  return (
    <ListRow
      onClick={() => onOpen(news)}
      withTouchEffect
      left={
        rank ? (
          <span
            style={{
              display: "inline-block",
              width: 24,
              textAlign: "center",
              fontSize: 19,
              fontWeight: 800,
              color: rank <= 3 ? "#3182F6" : "#8B95A1",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {rank}
          </span>
        ) : undefined
      }
      contents={
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: "#191F28",
              lineHeight: 1.45,
              letterSpacing: -0.2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              wordBreak: "keep-all",
            }}
          >
            {news.title}
          </div>
          <div style={{ fontSize: 14, color: "#8B95A1" }}>
            {showCategory && (
              <>
                <span
                  style={{
                    color: CATEGORY_TEXT_COLOR[category.color] ?? "#4E5968",
                    fontWeight: 600,
                  }}
                >
                  {category.label}
                </span>
                {" · "}
              </>
            )}
            {news.source} · {toRelativeTime(news.publishedAt)}
          </div>
        </div>
      }
      right={
        <button
          aria-label={scrapped ? "스크랩 취소" : "스크랩하기"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleScrap(news);
          }}
          style={{
            border: "none",
            background: "none",
            padding: 8,
            margin: -2,
            cursor: "pointer",
          }}
        >
          <BookmarkIcon
            size={22}
            color={scrapped ? "#3182F6" : "#C5CBD2"}
            filled={scrapped}
          />
        </button>
      }
    />
  );
}
