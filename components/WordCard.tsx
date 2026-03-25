'use client';

interface WordCardProps {
  word: string;
  isRare: boolean;
  isStart: boolean;    // 開始語か
  index: number;       // アニメーション遅延用
  score?: number;      // 獲得ポイント
}

export default function WordCard({ word, isRare, isStart, index, score }: WordCardProps) {
  const borderColor = isStart
    ? 'border-gray-400 bg-gray-50'
    : isRare
      ? 'border-yellow-500 bg-yellow-50'
      : 'border-green-500 bg-green-50';

  const shadowStyle = isRare && !isStart
    ? { boxShadow: '0 0 10px rgba(234, 179, 8, 0.25)' }
    : {};

  return (
    <div
      className={`flex items-center justify-between border-2 rounded-xl px-4 py-3 ${borderColor} animate-slide-in`}
      style={{
        animationDelay: `${index * 0.05}s`,
        ...shadowStyle,
      }}
    >
      <span className="text-xl font-bold">{word}</span>
      {score !== undefined && (
        <span className={`text-sm font-semibold ${isRare ? 'text-yellow-600' : 'text-green-600'}`}>
          +{score}{isRare && '✨'}
        </span>
      )}
    </div>
  );
}
