'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { initDictionary, getDailyStartWord } from '@/lib/dictionary';
import { getTodayDateString } from '@/lib/seededRandom';
import type { DailyRecord, DictEntry } from '@/lib/types';

const DAILY_KEY = 'word-chain-daily';
const HIGHSCORE_KEY = 'word-chain-highscore';

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
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <div className="max-w-sm w-full space-y-8 text-center">
        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold tracking-tight">
            言葉つなぎバトル
          </h1>
          <p className="text-lg text-gray-500 font-medium">Word Chain Arena</p>
        </div>

        {/* Daily word preview */}
        {ready && dailyWord && (
          <div className="animate-float">
            <p className="text-sm text-gray-500">今日のお題</p>
            <p className="text-3xl font-extrabold mt-1">{dailyWord}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => router.push('/play?mode=daily')}
            disabled={isDailyCompleted || !ready}
            aria-label={isDailyCompleted ? '今日のデイリーチャレンジは完了済みです' : '今日のデイリーチャレンジを始める'}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            {isDailyCompleted ? '完了済み' : '今日の挑戦'}
          </button>
          <button
            onClick={() => router.push('/play?mode=free')}
            disabled={!ready}
            aria-label="フリープレイモードでしりとりを始める"
            className="w-full py-4 border-2 border-gray-300 text-gray-700 text-lg font-bold rounded-2xl hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            フリープレイ
          </button>
        </div>

        {/* Stats */}
        <div className="space-y-1 text-sm text-gray-500">
          {highScore > 0 && (
            <p>ベスト: <span className="font-bold text-blue-600">{highScore}語</span></p>
          )}
          {isDailyCompleted && dailyRecord && (
            <p>今日の結果: <span className="font-bold text-green-600">{dailyRecord.chainLength}語</span> / {dailyRecord.score}pt</p>
          )}
        </div>

        {/* Footer links */}
        <div className="text-xs text-gray-400 text-center pt-4 border-t border-gray-100">
          <Link href="/legal" className="hover:underline" aria-label="特定商取引法に基づく表記">特定商取引法</Link>
          {' / '}
          <Link href="/privacy" className="hover:underline" aria-label="プライバシーポリシー">プライバシーポリシー</Link>
          {' / '}
          <Link href="/terms" className="hover:underline" aria-label="利用規約">利用規約</Link>
          <div className="mt-1">© 2026 ポッコリラボ</div>
        </div>
      </div>
    </main>
  );
}
