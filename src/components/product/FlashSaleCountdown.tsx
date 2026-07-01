"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "Đã kết thúc";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
}

export default function FlashSaleCountdown({ endsAt }: { endsAt: Date }) {
  const [remaining, setRemaining] = useState(() => endsAt.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(endsAt.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  return (
    <span className="w-fit rounded bg-flash-orange px-2 py-0.5 text-xs font-medium text-white">
      ⏱ {formatRemaining(remaining)}
    </span>
  );
}
