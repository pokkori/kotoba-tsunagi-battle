import type { WordChainState, WordChainAction } from './types';
import { validateWord, toHiragana } from './validator';
import { isRareWord } from './dictionary';
import { getDailyStartWord, getRandomStartWord } from './dictionary';
import { getTodayDateString } from './seededRandom';
import { calculatePseudoRank } from './share';

export function wordChainReducer(state: WordChainState, action: WordChainAction): WordChainState {
  switch (action.type) {
    case 'START': {
      const seed = getTodayDateString(); // YYYYMMDD
      const startWord = action.mode === 'daily'
        ? getDailyStartWord(seed)
        : getRandomStartWord();
      return {
        ...state,
        phase: 'playing',
        mode: action.mode,
        startWord,
        chain: [],
        currentInput: '',
        timeLeft: 15000,
        usedWords: new Set([startWord]),
        score: 0,
        dailySeed: seed,
        errorMessage: null,
        rank: 0,
      };
    }

    case 'SET_INPUT':
      return { ...state, currentInput: action.value, errorMessage: null };

    case 'SUBMIT': {
      const previousWord = state.chain.length > 0
        ? state.chain[state.chain.length - 1].word
        : state.startWord;

      const result = validateWord(state.currentInput, previousWord, state.usedWords);

      if (!result.valid) {
        // しりとりルール違反 → ゲームオーバー
        // ただし空入力は無視
        if (result.error === 'empty') return state;
        return {
          ...state,
          phase: 'game-over',
          errorMessage: result.errorMessage || null,
          rank: calculatePseudoRank(state.chain.length),
        };
      }

      const normalized = toHiragana(state.currentInput.trim());
      const isRare = isRareWord(normalized);
      const wordScore = 10 + (isRare ? 3 : 0);

      const newChain = [
        ...state.chain,
        { word: normalized, isRare, timestamp: Date.now() },
      ];

      return {
        ...state,
        chain: newChain,
        currentInput: '',
        timeLeft: 15000, // タイマーリセット
        usedWords: new Set([...state.usedWords, normalized]),
        score: state.score + wordScore,
        errorMessage: null,
      };
    }

    case 'TICK':
      return {
        ...state,
        timeLeft: Math.max(0, state.timeLeft - action.elapsed),
      };

    case 'TIME_UP':
      return {
        ...state,
        phase: 'game-over',
        rank: calculatePseudoRank(state.chain.length),
      };

    case 'RESTART':
      return { ...state, phase: 'title' };

    default:
      return state;
  }
}
