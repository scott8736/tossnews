interface IconProps {
  size?: number;
  color?: string;
}

export function BackIcon({ size = 24, color = "#191F28" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M15 5L8 12L15 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CloseIcon({ size = 24, color = "#191F28" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsIcon({ size = 24, color = "#191F28" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={2} />
      <path
        d="M19.4 13a7.97 7.97 0 0 0 0-2l2-1.4-2-3.4-2.3.9a8 8 0 0 0-1.7-1L15 4h-4l-.4 2.1a8 8 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.97 7.97 0 0 0 0 2l-2 1.4 2 3.4 2.3-.9a8 8 0 0 0 1.7 1L11 20h4l.4-2.1a8 8 0 0 0 1.7-1l2.3.9 2-3.4-2-1.4Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BookmarkIcon({
  size = 24,
  color = "#191F28",
  filled = false,
}: IconProps & { filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M6 4.5C6 3.67 6.67 3 7.5 3h9c.83 0 1.5.67 1.5 1.5V21l-6-3.6L6 21V4.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </svg>
  );
}

export function ShareIcon({ size = 24, color = "#191F28" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15V4M12 4L8.5 7.5M12 4l3.5 3.5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 13v5.5C5 19.9 6.1 21 7.5 21h9c1.4 0 2.5-1.1 2.5-2.5V13"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckCircleIcon({
  size = 24,
  checked = false,
}: IconProps & { checked?: boolean }) {
  if (checked) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#3182F6" />
        <path
          d="M7.5 12.5L10.3 15.3L16.5 9"
          stroke="#fff"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.25" stroke="#D1D6DB" strokeWidth={1.5} />
    </svg>
  );
}

export function FlameIcon({ size = 14, color = "#F04452" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 2.5 2 4.5A5 5 0 0 1 7 14.5C7 9 12 7 12 2Z"
        fill={color}
      />
    </svg>
  );
}
