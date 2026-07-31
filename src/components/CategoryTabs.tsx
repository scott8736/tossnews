import { Tab } from "@toss/tds-mobile";
import { CATEGORIES } from "../data/categories";
import type { CategoryId } from "../types";

export type ActiveTab = CategoryId | "all";

interface CategoryTabsProps {
  active: ActiveTab;
  onChange: (id: ActiveTab) => void;
}

const TAB_IDS: ActiveTab[] = ["all", ...CATEGORIES.map((c) => c.id)];
const TAB_LABELS: Record<ActiveTab, string> = {
  all: "전체",
  ...Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])),
} as Record<ActiveTab, string>;

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const activeIndex = TAB_IDS.indexOf(active);

  return (
    <div style={{ padding: "4px 20px 12px" }}>
      <Tab
        size="small"
        fluid
        ariaLabel="뉴스 카테고리"
        onChange={(index) => onChange(TAB_IDS[index])}
      >
        {TAB_IDS.map((id, index) => (
          <Tab.Item key={id} selected={index === activeIndex}>
            {TAB_LABELS[id]}
          </Tab.Item>
        ))}
      </Tab>
    </div>
  );
}
