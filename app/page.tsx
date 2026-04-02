'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initDictionary, getDailyStartWord } from '@/lib/dictionary';
import { getTodayDateString } from '@/lib/seededRandom';
import type { DailyRecord, DictEntry } from '@/lib/types';
import StreakBanner from '@/components/StreakBanner';

const DAILY_KEY = 'word-chain-daily';
const HIGHSCORE_KEY = 'word-chain-highscore';

/* ---------- Inline SVG icons ---------- */
function WordIcon() {
  return (
    <svg width={72} height={72} viewBox="0 0 72 72" fill="none" aria-hidden="true">
      <rect x="8" y="14" width="56" height="44" rx="8" stroke="#6366f1" strokeWidth="2" fill="none" />
      <text x="20" y="44" fill="#6366f1" fontSize="20" fontWeight="bold" fontFamily="sans-serif" opacity={0.8}>Aa</text>
      <path d="M44 30h12M44 38h8" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" opacity={0.5} />
      <circle cx="56" cy="20" r="6" fill="#6366f1" opacity={0.3} />
      <path d="M54 18l2 4 4-2" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DailyIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.5" />
      <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="2" fill="currentColor" />
    </svg>
  );
}

function FreePlayIcon() {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Particle field ---------- */
function ParticleField() {
  const particles = [
    { top: "8%", left: "12%", size: 4, delay: "0s", dur: "6s", color: "rgba(99,102,241,0.4)" },
    { top: "22%", left: "85%", size: 5, delay: "1s", dur: "7s", color: "rgba(129,140,248,0.35)" },
    { top: "45%", left: "8%", size: 3, delay: "2s", dur: "5s", color: "rgba(99,102,241,0.3)" },
    { top: "60%", left: "78%", size: 6, delay: "0.5s", dur: "8s", color: "rgba(199,210,254,0.2)" },
    { top: "78%", left: "42%", size: 4, delay: "3s", dur: "6s", color: "rgba(99,102,241,0.3)" },
    { top: "35%", left: "55%", size: 3, delay: "1.5s", dur: "7s", color: "rgba(129,140,248,0.25)" },
    { top: "88%", left: "20%", size: 5, delay: "2.5s", dur: "5.5s", color: "rgba(99,102,241,0.2)" },
  ];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `wfloat ${p.dur} ${p.delay} ease-in-out infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes wfloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-20px) scale(1.4); opacity: 1; }
        }
        @keyframes floatWord {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

export default function TitlePage() {
  const router = useRouter();
  const [dailyWord, setDailyWord] = useState<string>('');
  const [highScore, setHighScore] = useState(0);
  const [dailyRecord, setDailyRecord] = useState<DailyRecord | null>(null);
  const [ready, setReady] = useState(false);
  const todayStr = getTodayDateString();

  useEffect(() => {
    // Load dictionary
    import('@/data/words.json').then((mod) => {
      const entries: DictEntry[] = mod.default as DictEntry[];
      initDictionary(entries);
      const word = getDailyStartWord(todayStr);
      setDailyWord(word);
      setReady(true);
    });

    // Load localStorage
    try {
      const hs = localStorage.getItem(HIGHSCORE_KEY);
      if (hs) setHighScore(parseInt(hs, 10));

      const dr = localStorage.getItem(DAILY_KEY);
      if (dr) {
        const parsed: DailyRecord = JSON.parse(dr);
        if (parsed.date === todayStr) {
          setDailyRecord(parsed);
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, [todayStr]);

  const isDailyCompleted = dailyRecord !== null;

  return (
    <main
      className="flex-1 flex flex-col items-center justify-center px-4 py-8 min-h-dvh relative"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(120,119,198,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,119,198,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(99,179,237,0.1) 0%, transparent 50%), #0F0F1A",
        color: "#e0e0e0",
      }}
    >
      <ParticleField />

      <div className="max-w-sm w-full space-y-8 text-center relative z-10">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex justify-center mb-2">
            <WordIcon />
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #FFD93D, #FF6B6B, #EE5A24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 20px rgba(255,217,61,0.3))",
            }}
          >
            言葉つなぎバトル
          </h1>
          <p className="text-lg text-gray-400 font-medium">Word Chain Arena</p>
        </div>

        {/* Daily word preview */}
        {ready && dailyWord && (
          <div
            className="py-4 px-6 rounded-[20px] mx-auto inline-block"
            style={{
              background: "rgba(255,255,255,0.03)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: "floatWord 3s ease-in-out infinite",
            }}
          >
            <p className="text-sm text-gray-400">今日のお題</p>
            <p className="text-3xl font-extrabold mt-1 text-white">{dailyWord}</p>
          </div>
        )}

        {/* 連続プレイストリークバッジ */}
        <div className="flex justify-center">
          <StreakBanner />
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/play?mode=daily')}
            disabled={isDailyCompleted || !ready}
            aria-label={isDailyCompleted ? '今日のデイリーチャレンジは完了済みです' : '今日のデイリーチャレンジを始める'}
            className="w-full py-4 text-lg font-bold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] text-white flex items-center justify-center gap-2"
            style={{
              background: isDailyCompleted
                ? "rgba(255,255,255,0.05)"
                : "linear-gradient(135deg, #FF6B6B 0%, #EE5A24 100%)",
              boxShadow: isDailyCompleted ? "none" : "0 0 20px rgba(238,90,36,0.4)",
              border: isDailyCompleted ? "1px solid rgba(255,255,255,0.1)" : "none",
            }}
          >
            <DailyIcon />
            {isDailyCompleted ? '完了済み' : '今日の挑戦'}
          </button>
          <button
            onClick={() => router.push('/play?mode=free')}
            disabled={!ready}
            aria-label="フリープレイモードでしりとりを始める"
            className="w-full py-4 text-lg font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px] text-gray-200 flex items-center justify-center gap-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <FreePlayIcon />
            フリープレイ
          </button>
        </div>

        {/* Stats */}
        <div
          className="space-y-1 text-sm px-4 py-3 rounded-[20px] mx-auto inline-block"
          style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {highScore > 0 && (
            <p className="text-gray-300">
              ベスト: <span className="font-bold text-indigo-400">{highScore}語</span>
            </p>
          )}
          {isDailyCompleted && dailyRecord && (
            <p className="text-gray-300">
              今日の結果: <span className="font-bold text-emerald-400">{dailyRecord.chainLength}語</span> / {dailyRecord.score}pt
            </p>
          )}
          {!highScore && !isDailyCompleted && (
            <p className="text-gray-500">まだ記録がありません</p>
          )}
        </div>

        {/* Footer links */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t border-gray-800/50">
          <div className="flex justify-center gap-4">
            <Link href="/legal" className="hover:text-gray-300 min-h-[44px] flex items-center" aria-label="特定商取引法に基づく表記">
              特定商取引法
            </Link>
            <Link href="/privacy" className="hover:text-gray-300 min-h-[44px] flex items-center" aria-label="プライバシーポリシー">
              プライバシーポリシー
            </Link>
            <Link href="/terms" className="hover:text-gray-300 min-h-[44px] flex items-center" aria-label="利用規約">
              利用規約
            </Link>
          </div>
          <div className="mt-1">(C) 2026 ポッコリラボ</div>
        </div>
      </div>
    </main>
  );
}
