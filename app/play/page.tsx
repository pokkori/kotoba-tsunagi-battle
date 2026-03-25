'use client';

import { useEffect, useReducer, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { wordChainReducer } from '@/lib/wordChainReducer';
import { initDictionary } from '@/lib/dictionary';
import { getLastChar } from '@/lib/validator';
import { playCorrectSound, playRareSound, playGameOverSound, playTickSound } from '@/lib/sound';
import type { WordChainState, DictEntry } from '@/lib/types';
import WordChain from '@/components/WordChain';
import TimerBar from '@/components/TimerBar';
import InputArea from '@/components/InputArea';
import FeedbackToast from '@/components/FeedbackToast';
import ResultModal from '@/components/ResultModal';

const DAILY_KEY = 'word-chain-daily';
const HIGHSCORE_KEY = 'word-chain-highscore';

const initialState: WordChainState = {
  phase: 'title',
  mode: 'daily',
  startWord: '',
  chain: [],
  currentInput: '',
  timeLeft: 15000,
  usedWords: new Set(),
  score: 0,
  dailyCompleted: false,
  dailySeed: '',
  errorMessage: null,
  rank: 0,
};

function PlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') as 'daily' | 'free') || 'free';
  const [state, dispatch] = useReducer(wordChainReducer, initialState);
  const [ready, setReady] = useState(false);
  const prevChainLenRef = useRef(0);
  const tickSoundRef = useRef(0);

  // Load dictionary and start game
  useEffect(() => {
    import('@/data/words.json').then((mod) => {
      const entries: DictEntry[] = mod.default as DictEntry[];
      initDictionary(entries);
      setReady(true);
      dispatch({ type: 'START', mode });
    });
  }, [mode]);

  // Timer
  useEffect(() => {
    if (state.phase !== 'playing') return;

    const interval = setInterval(() => {
      dispatch({ type: 'TICK', elapsed: 100 });
    }, 100);

    return () => clearInterval(interval);
  }, [state.phase]);

  // Time up check
  useEffect(() => {
    if (state.timeLeft <= 0 && state.phase === 'playing') {
      dispatch({ type: 'TIME_UP' });
    }
  }, [state.timeLeft, state.phase]);

  // Sound effects on chain change
  useEffect(() => {
    if (state.chain.length > prevChainLenRef.current) {
      const lastWord = state.chain[state.chain.length - 1];
      if (lastWord.isRare) {
        playRareSound();
      } else {
        playCorrectSound();
      }
    }
    prevChainLenRef.current = state.chain.length;
  }, [state.chain.length, state.chain]);

  // Tick sound when < 3s
  useEffect(() => {
    if (state.phase === 'playing' && state.timeLeft <= 3000 && state.timeLeft > 0) {
      const sec = Math.ceil(state.timeLeft / 1000);
      if (sec !== tickSoundRef.current) {
        tickSoundRef.current = sec;
        playTickSound();
      }
    } else {
      tickSoundRef.current = 0;
    }
  }, [state.timeLeft, state.phase]);

  // Game over sound
  useEffect(() => {
    if (state.phase === 'game-over') {
      playGameOverSound();

      // Save results
      try {
        if (state.mode === 'daily') {
          const record = {
            date: state.dailySeed,
            chainLength: state.chain.length,
            score: state.score,
          };
          localStorage.setItem(DAILY_KEY, JSON.stringify(record));
        }

        const currentHigh = parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10);
        if (state.chain.length > currentHigh) {
          localStorage.setItem(HIGHSCORE_KEY, state.chain.length.toString());
        }
      } catch {
        // localStorage unavailable
      }
    }
  }, [state.phase, state.mode, state.dailySeed, state.chain.length, state.score, state.chain]);

  const handleSubmit = () => {
    dispatch({ type: 'SUBMIT' });
  };

  const handleRestart = () => {
    dispatch({ type: 'START', mode: 'free' });
  };

  const handleTitle = () => {
    router.push('/');
  };

  if (!ready) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-lg text-gray-400">読み込み中...</p>
      </main>
    );
  }

  if (state.phase === 'title') {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-lg text-gray-400">読み込み中...</p>
      </main>
    );
  }

  const previousWord = state.chain.length > 0
    ? state.chain[state.chain.length - 1].word
    : state.startWord;
  const lastChar = getLastChar(previousWord);

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {state.mode === 'daily' ? '今日のお題' : 'フリープレイ'}
            </p>
            <p className="text-lg font-bold">{state.startWord}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">チェーン: <span className="font-bold text-blue-600">{state.chain.length}語</span></p>
            <p className="text-sm text-gray-500">スコア: <span className="font-bold text-purple-600">{state.score}pt</span></p>
          </div>
        </div>
      </div>

      {/* Word Chain */}
      <WordChain chain={state.chain} startWord={state.startWord} />

      {/* Timer */}
      {state.phase === 'playing' && (
        <TimerBar timeLeft={state.timeLeft} maxTime={15000} />
      )}

      {/* Input */}
      {state.phase === 'playing' && (
        <InputArea
          value={state.currentInput}
          onChange={(v) => dispatch({ type: 'SET_INPUT', value: v })}
          onSubmit={handleSubmit}
          disabled={state.phase !== 'playing'}
          lastChar={lastChar}
          errorMessage={state.errorMessage}
        />
      )}

      {/* Feedback Toast */}
      <FeedbackToast message={state.phase === 'playing' ? state.errorMessage : null} />

      {/* Result Modal */}
      {state.phase === 'game-over' && (
        <ResultModal
          chain={state.chain}
          score={state.score}
          mode={state.mode}
          startWord={state.startWord}
          rank={state.rank}
          errorMessage={state.errorMessage}
          onRestart={handleRestart}
          onTitle={handleTitle}
        />
      )}
    </main>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center">
        <p className="text-lg text-gray-400">読み込み中...</p>
      </main>
    }>
      <PlayContent />
    </Suspense>
  );
}
