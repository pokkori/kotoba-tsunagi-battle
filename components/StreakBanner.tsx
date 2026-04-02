"use client";

import { useEffect, useState } from "react";
import { loadStreak, type StreakData } from "@/lib/streak";

const STREAK_KEY = "kotoba";

/* Flame SVG */
function FlameSvg({ color = "#FF6B6B" }: { color?: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 24 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="kotobaFlameGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#EE5A24" />
          <stop offset="100%" stopColor={color} />
        </linearGradient>
      </defs>
      <path
        d="M12 2 C12 2 18 10 18 17 C18 23.627 15.314 26 12 26 C8.686 26 6 23.627 6 17 C6 10 12 2 12 2Z"
        fill="url(#kotobaFlameGrad)"
      />
      <path
        d="M12 12 C12 12 15 16 15 20 C15 22.761 13.657 24 12 24 C10.343 24 9 22.761 9 20 C9 16 12 12 12 12Z"
        fill="rgba(255,220,100,0.8)"
      />
    </svg>
  );
}

/* Shield SVG */
function ShieldSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L3 7v6c0 5.25 3.75 10.15 9 11.25C17.25 23.15 21 18.25 21 13V7L12 2z" fill="#6366f1" opacity="0.85" />
    </svg>
  );
}

export default function StreakBanner() {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = loadStreak(STREAK_KEY);
    setStreakData(data);
    setMounted(true);
  }, []);

  if (!mounted || !streakData || streakData.count < 2) return null;

  const streak = streakData.count;
  const isWeekComplete = streak >= 7;
  const flameColor = streak >= 30 ? "#FFD93D" : streak >= 7 ? "#FF8C42" : "#FF6B6B";

  return (
    <div
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold min-h-[44px]"
      style={{
        background: isWeekComplete
          ? "linear-gradient(135deg, rgba(255,107,107,0.2) 0%, rgba(99,102,241,0.2) 100%)"
          : "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        border: isWeekComplete
          ? "1px solid rgba(255,107,107,0.45)"
          : "1px solid rgba(255,255,255,0.1)",
        color: flameColor,
        boxShadow: isWeekComplete
          ? "0 0 20px rgba(255,107,107,0.35)"
          : "0 0 12px rgba(255,107,107,0.15)",
      }}
      aria-label={`${streak}日連続プレイ中`}
    >
      <FlameSvg color={flameColor} />
      {isWeekComplete ? (
        <span>{streak}日連続 — 今週クリア！</span>
      ) : (
        <span>{streak}日連続プレイ中！</span>
      )}
      {streakData.shieldCount > 0 && (
        <span
          className="flex items-center gap-0.5 text-xs opacity-75"
          aria-label={`シールド残${streakData.shieldCount}回`}
        >
          <ShieldSvg />
          {streakData.shieldCount}
        </span>
      )}
    </div>
  );
}
