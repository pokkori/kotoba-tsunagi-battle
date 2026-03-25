'use client';

import { useRef, useEffect } from 'react';

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  lastChar: string;     // 前の単語の末尾文字（ヒント表示用）
  errorMessage: string | null;
}

export default function InputArea({ value, onChange, onSubmit, disabled, lastChar, errorMessage }: InputAreaProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !disabled) {
      onSubmit();
    }
  };

  return (
    <div className="px-4 py-3 space-y-2">
      {errorMessage && (
        <p className="text-red-500 text-sm text-center font-semibold animate-shake">
          {errorMessage}
        </p>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          inputMode="kana"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={`「${lastChar}」から始まる言葉...`}
          className={`flex-1 px-4 py-3 text-lg border-2 rounded-xl outline-none transition-colors ${
            errorMessage
              ? 'border-red-400 bg-red-50 animate-error-flash'
              : 'border-gray-300 focus:border-blue-500'
          }`}
        />
        <button
          onClick={onSubmit}
          disabled={disabled || value.trim().length === 0}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700 active:scale-95 transition-all"
        >
          決定
        </button>
      </div>
    </div>
  );
}
