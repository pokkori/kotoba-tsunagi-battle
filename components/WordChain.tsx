'use client';

import { useEffect, useRef } from 'react';
import type { ChainWord } from '@/lib/types';
import WordCard from './WordCard';

interface WordChainProps {
  chain: ChainWord[];
  startWord: string;
}

export default function WordChain({ chain, startWord }: WordChainProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chain.length]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto space-y-2 px-4 py-2"
    >
      {/* 開始語 */}
      <WordCard
        word={startWord}
        isRare={false}
        isStart={true}
        index={0}
      />

      {/* チェーン */}
      {chain.map((item, i) => (
        <WordCard
          key={`${item.word}-${i}`}
          word={item.word}
          isRare={item.isRare}
          isStart={false}
          index={i + 1}
          score={10 + (item.isRare ? 3 : 0)}
        />
      ))}

      <div ref={bottomRef} />
    </div>
  );
}
