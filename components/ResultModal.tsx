'use client';

import type { ChainWord } from '@/lib/types';
import { generateShareText, getDayNumber } from '@/lib/share';

interface ResultProps {
  chain: ChainWord[];
  score: number;
  mode: 'daily' | 'free';
  startWord: string;
  rank: number;
  errorMessage: string | null;
  onRestart: () => void;
  onTitle: () => void;
}

export default function ResultModal({
  chain,
  score,
  mode,
  rank,
  errorMessage,
  onRestart,
  onTitle,
}: ResultProps) {
  const rareCount = chain.filter((w) => w.isRare).length;
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const dayNumber = getDayNumber(todayStr);

  const shareText = generateShareText(chain, score, mode, dayNumber);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('結果をコピーしました！');
    }
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 p-6 animate-scale-in">
        <h2 className="text-2xl font-extrabold text-center mb-1">
          {mode === 'daily' ? '今日の結果' : '結果発表'}
        </h2>
        {errorMessage && (
          <p className="text-red-500 text-sm text-center mb-3">{errorMessage}</p>
        )}

        <div className="grid grid-cols-3 gap-3 my-4">
          <div className="text-center">
            <p className="text-3xl font-extrabold text-blue-600">{chain.length}</p>
            <p className="text-xs text-gray-500">チェーン語数</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-yellow-600">{rareCount}</p>
            <p className="text-xs text-gray-500">レアワード</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-extrabold text-purple-600">{score}</p>
            <p className="text-xs text-gray-500">スコア</p>
          </div>
        </div>

        <div className="text-center py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl mb-4">
          <p className="text-sm text-gray-600">全国ランキング</p>
          <p className="text-2xl font-extrabold">
            約 <span className="text-blue-600">{rank.toLocaleString()}</span> 位
          </p>
          <p className="text-xs text-gray-400">/ 10,000人中</p>
        </div>

        <div className="text-center mb-4 font-mono text-lg leading-relaxed tracking-wider">
          {chain.map((w) => (w.isRare ? '🟨' : '🟩')).join('')}💀
        </div>

        <div className="space-y-2 mb-4">
          <button
            onClick={handleShare}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 transition-all"
          >
            結果をシェア
          </button>
          <button
            onClick={handleTwitterShare}
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 active:scale-95 transition-all"
          >
            X (Twitter) でシェア
          </button>
        </div>

        <div className="flex gap-2">
          {mode === 'free' && (
            <button
              onClick={onRestart}
              className="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              もう1回
            </button>
          )}
          <button
            onClick={onTitle}
            className={`${mode === 'free' ? 'flex-1' : 'w-full'} py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 active:scale-95 transition-all`}
          >
            タイトルへ
          </button>
        </div>

        {mode === 'daily' && (
          <p className="text-center text-sm text-gray-400 mt-3">
            明日もチャレンジしよう！
          </p>
        )}
      </div>
    </div>
  );
}
