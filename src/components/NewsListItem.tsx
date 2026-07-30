import { Badge, ListRow } from "@toss/tds-mobile";
import { CATEGORY_LABEL } from "../data/categories";
import type { NewsItem } from "../types";
import { toRelativeTime } from "../utils/time";
import { BookmarkIcon } from "./icons";

const CATEGORY_BADGE_COLOR: Record<
  string,
  "blue" | "teal" | "green" | "red" | "yellow" | "elephant"
> = {
  politics: "elephant",
  economy: "blue",
  society: "green",
  it: "teal",
  sports: "yellow",
  entertainment: "red",
};

interface NewsListItemProps {
  news: NewsItem;
  scrapped: boolean;
  onOpen: (news: NewsItem) => void;
  onToggleScrap: (id: string) => void;
}

export function NewsListItem({
  news,
  scrapped,
  onOpen,
  onToggleScrap,
}: NewsListItemProps) {
  return (
    <ListRow
      onClick={() => onOpen(news)}
      withTouchEffect
      left={<ListRow.AssetImage src={news.thumbnail} size="small" shape="squircle" />}
      contents={
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Badge
            size="xsmall"
            variant="weak"
            color={CATEGORY_BADGE_COLOR[news.category] ?? "blue"}
          >
            {CATEGORY_LABEL[news.category]}
          </Badge>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#191F28",
              lineHeight: 1.35,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {news.title}
          </div>
          <div style={{ fontSize: 12.5, color: "#8B95A1" }}>
            {news.source} · {toRelativeTime(news.publishedAt)}
          </div>
        </div>
      }
      right={
        <button
          aria-label={scrapped ? "스크랩 취소" : "스크랩하기"}
          onClick={(event) => {
            event.stopPropagation();
            onToggleScrap(news.id);
          }}
          style={{
            border: "none",
            background: "none",
            padding: 6,
            cursor: "pointer",
          }}
        >
          <BookmarkIcon
            size={20}
            color={scrapped ? "#3182F6" : "#B0B8C1"}
            filled={scrapped}
          />
        </button>
      }
    />
  );
}
