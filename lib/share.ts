import type { ChainWord } from './types';

/**
 * Wordle風絵文字グリッドを生成
 */
export function generateShareGrid(chain: ChainWord[]): string {
  return chain.map(w => w.isRare ? '🟨' : '🟩').join('') + '💀';
}

/**
 * シェアテキスト生成
 */
export function generateShareText(
  chain: ChainWord[],
  score: number,
  mode: 'daily' | 'free',
  dayNumber?: number
): string {
  const grid = generateShareGrid(chain);
  const rareCount = chain.filter(w => w.isRare).length;
  const header = mode === 'daily'
    ? `言葉つなぎ Day.${dayNumber}`
    : `言葉つなぎ フリープレイ`;

  return `${header}\n${grid}\n${chain.length}語 (レア${rareCount}個) ${score}pt\n#言葉つなぎバトル`;
}

/**
 * スコアから擬似的な全国順位を計算
 */
export function calculatePseudoRank(chainLength: number): number {
  const mean = 8;
  const std = 4;
  const totalPlayers = 10000;

  // 正規分布のCDF近似（erf近似）
  const z = (chainLength - mean) / std;
  const cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));

  const rank = Math.max(1, Math.floor(totalPlayers * (1 - cdf)));
  return rank;
}

/**
 * 誤差関数の近似
 */
function erf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

/**
 * デイリーの日数（基準日からの経過日数）
 */
export function getDayNumber(dateStr: string): number {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  const target = new Date(year, month, day);
  const base = new Date(2026, 0, 1); // 2026-01-01を基準日
  const diff = target.getTime() - base.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}
