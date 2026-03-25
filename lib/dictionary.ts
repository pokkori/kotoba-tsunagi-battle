import type { DictEntry } from './types';
import { seededRandom, dateToSeed } from './seededRandom';

// 検索用マップ（初期化時に構築）
let wordMap: Map<string, number> | null = null;
let wordsByStart: Map<string, string[]> | null = null;
let allEntries: DictEntry[] = [];

export function initDictionary(entries: DictEntry[]): void {
  allEntries = entries;
  wordMap = new Map();
  wordsByStart = new Map();
  for (const entry of entries) {
    wordMap.set(entry.w, entry.r);
    const firstChar = entry.w[0];
    if (!wordsByStart.has(firstChar)) {
      wordsByStart.set(firstChar, []);
    }
    wordsByStart.get(firstChar)!.push(entry.w);
  }
}

export function isInDictionary(word: string): boolean {
  return wordMap?.has(word) ?? false;
}

export function getRank(word: string): number {
  return wordMap?.get(word) ?? 0;
}

export function isRareWord(word: string): boolean {
  return getRank(word) >= 4;
}

/**
 * しりとりに適した開始語候補を返す
 * 「ん」で終わらない、ランク1-2の一般的な名詞
 */
export function getStartCandidates(): string[] {
  return allEntries
    .filter(e => e.r <= 2 && !e.w.endsWith('ん'))
    .map(e => e.w);
}

/**
 * 今日のデイリー開始語を返す
 */
export function getDailyStartWord(dateStr: string): string {
  const rng = seededRandom(dateToSeed(dateStr));
  const candidates = getStartCandidates();
  const index = Math.floor(rng() * candidates.length);
  return candidates[index];
}

/**
 * ランダムな開始語を返す（フリーモード用）
 */
export function getRandomStartWord(): string {
  const candidates = getStartCandidates();
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index];
}
