import { BottomSheet, Button, Checkbox, ListRow } from "@toss/tds-mobile";
import { CATEGORIES } from "../data/categories";
import type { CategoryId } from "../types";

interface PreferenceSheetProps {
  open: boolean;
  preferred: CategoryId[];
  onToggle: (id: CategoryId) => void;
  onClose: () => void;
}

export function PreferenceSheet({
  open,
  preferred,
  onToggle,
  onClose,
}: PreferenceSheetProps) {
  const selectable = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      header={<BottomSheet.Header>관심 카테고리 설정</BottomSheet.Header>}
      headerDescription={
        <BottomSheet.HeaderDescription>
          선택한 카테고리의 소식을 홈 화면 위쪽에서 먼저 보여드려요.
        </BottomSheet.HeaderDescription>
      }
      cta={
        <BottomSheet.CTA>
          <Button display="full" onClick={onClose}>
            완료
          </Button>
        </BottomSheet.CTA>
      }
    >
      <div style={{ padding: "4px 0 8px" }}>
        {selectable.map((category) => {
          const checked = preferred.includes(category.id);
          return (
            <ListRow
              key={category.id}
              onClick={() => onToggle(category.id)}
              contents={
                <span style={{ fontSize: 15, color: "#191F28" }}>
                  {category.label}
                </span>
              }
              right={
                <Checkbox.Circle
                  checked={checked}
                  onCheckedChange={() => onToggle(category.id)}
                  aria-label={`${category.label} 관심 카테고리로 설정`}
                />
              }
            />
          );
        })}
      </div>
    </BottomSheet>
  );
}
