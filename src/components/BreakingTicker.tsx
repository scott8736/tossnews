import { useEffect, useState } from "react";
import type { NewsItem } from "../types";
import { FlameIcon } from "./icons";

interface BreakingTickerProps {
  items: NewsItem[];
  onSelect: (item: NewsItem) => void;
}

export function BreakingTicker({ items, onSelect }: BreakingTickerProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index % items.length];

  return (
    <button
      onClick={() => onSelect(current)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        width: "calc(100% - 40px)",
        boxSizing: "border-box",
        margin: "0 20px",
        padding: "12px 14px",
        borderRadius: 12,
        border: "none",
        background: "#FFF1F1",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexShrink: 0,
          color: "#F04452",
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        <FlameIcon />
        속보
      </span>
      <span
        key={current.id}
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: 16,
          fontWeight: 600,
          color: "#191F28",
        }}
      >
        {/* 앞에 "속보" 표시가 이미 있어서 제목 머리의 [속보]는 떼고 보여줘요. */}
        {current.title.replace(/^\s*\[속보\]\s*/, "")}
      </span>
    </button>
  );
}
