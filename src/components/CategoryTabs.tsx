import { Tab } from "@toss/tds-mobile";
import { CATEGORIES } from "../data/categories";
import type { CategoryId } from "../types";

interface CategoryTabsProps {
  active: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const activeIndex = CATEGORIES.findIndex((c) => c.id === active);

  return (
    <div style={{ padding: "4px 20px 12px" }}>
      <Tab
        size="small"
        fluid
        ariaLabel="뉴스 카테고리"
        onChange={(index) => onChange(CATEGORIES[index].id)}
      >
        {CATEGORIES.map((category, index) => (
          <Tab.Item key={category.id} selected={index === activeIndex}>
            {category.label}
          </Tab.Item>
        ))}
      </Tab>
    </div>
  );
}
