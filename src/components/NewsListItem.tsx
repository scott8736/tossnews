import { Badge, ListRow } from "@toss/tds-mobile";
import { CATEGORY_MAP } from "../data/categories";
import type { NewsItem } from "../types";
import { toRelativeTime } from "../utils/time";
import { BookmarkIcon } from "./icons";

interface NewsListItemProps {
  news: NewsItem;
  scrapped: boolean;
  onOpen: (news: NewsItem) => void;
  onToggleScrap: (news: NewsItem) => void;
}

export function NewsListItem({
  news,
  scrapped,
  onOpen,
  onToggleScrap,
}: NewsListItemProps) {
  const category = CATEGORY_MAP[news.category];

  return (
    <ListRow
      onClick={() => onOpen(news)}
      withTouchEffect
      left={
        <ListRow.AssetText shape="squircle" size="small">
          {category.initial}
        </ListRow.AssetText>
      }
      contents={
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Badge size="xsmall" variant="weak" color={category.color}>
            {category.label}
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
            onToggleScrap(news);
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
