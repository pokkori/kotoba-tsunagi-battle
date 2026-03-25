'use client';

interface TimerBarProps {
  timeLeft: number;    // ms (0-15000)
  maxTime: number;     // 15000
}

export default function TimerBar({ timeLeft, maxTime }: TimerBarProps) {
  const percentage = (timeLeft / maxTime) * 100;
  const seconds = Math.ceil(timeLeft / 1000);

  // 色変化: 緑(>10s) → 黄(5-10s) → 赤(<5s)
  const barColor = seconds > 10
    ? 'bg-green-500'
    : seconds > 5
      ? 'bg-yellow-500'
      : 'bg-red-500';

  const isPulsing = seconds <= 3 && timeLeft > 0;

  return (
    <div className="px-4 py-2">
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} ${isPulsing ? 'animate-pulse-fast' : ''}`}
          style={{
            width: `${percentage}%`,
            transition: 'width 0.1s linear',
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
          {seconds}秒
        </span>
      </div>
    </div>
  );
}
