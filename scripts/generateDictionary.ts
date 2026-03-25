/**
 * 辞書生成スクリプト（開発用）
 *
 * しりとり用日本語辞書を生成する
 * 実行: npx ts-node scripts/generateDictionary.ts
 *
 * 注意: 実際の辞書データは data/words.json に直接配置済み
 * このスクリプトは参考用
 */

// ランク判定ロジック
// ランク1: 3文字以下の超一般語 (30%)
// ランク2: 4文字の一般語 (25%)
// ランク3: 5文字の普通語 (20%)
// ランク4: 6文字以上 or やや専門的 (15%)
// ランク5: 7文字以上 or 専門的 (10%)
function assignRank(word: string): number {
  const len = word.length;
  if (len <= 3) return 1;
  if (len === 4) return 2;
  if (len === 5) return 3;
  if (len === 6) return 4;
  return 5;
}

console.log('辞書生成スクリプト - 参考用');
console.log('assignRank example:', assignRank('いぬ'), assignRank('さくらもち'));
