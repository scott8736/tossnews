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
        width: "100%",
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
          fontSize: 13,
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
          fontSize: 14,
          fontWeight: 600,
          color: "#191F28",
        }}
      >
        {current.title}
      </span>
    </button>
  );
}
