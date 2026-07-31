import { BottomSheet } from "@toss/tds-mobile";
import type { NewsItem } from "../types";
import { NewsListItem } from "./NewsListItem";

interface ScrapSheetProps {
  open: boolean;
  items: NewsItem[];
  onClose: () => void;
  onOpenNews: (news: NewsItem) => void;
  onToggleScrap: (news: NewsItem) => void;
}

export function ScrapSheet({
  open,
  items,
  onClose,
  onOpenNews,
  onToggleScrap,
}: ScrapSheetProps) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      header={<BottomSheet.Header>스크랩한 뉴스</BottomSheet.Header>}
      headerDescription={
        <BottomSheet.HeaderDescription>
          {items.length > 0
            ? `${items.length}개의 소식을 모아뒀어요.`
            : "아직 스크랩한 소식이 없어요."}
        </BottomSheet.HeaderDescription>
      }
      expandBottomSheet
      maxHeight={520}
    >
      <div style={{ padding: "4px 0 24px" }}>
        {items.map((news) => (
          <NewsListItem
            key={news.id}
            news={news}
            scrapped
            onOpen={(item) => {
              onOpenNews(item);
              onClose();
            }}
            onToggleScrap={onToggleScrap}
          />
        ))}
      </div>
    </BottomSheet>
  );
}
