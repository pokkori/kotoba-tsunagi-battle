/** 辞書エントリ */
export interface DictionaryEntry {
  word: string;       // ひらがな表記
  rank: number;       // 頻度ランク 1-5（1=最頻出、5=最レア）
}

/** チェーン内の単語 */
export interface ChainWord {
  word: string;
  isRare: boolean;    // rank >= 4
  timestamp: number;  // 回答時刻
}

/** バリデーション結果 */
export interface ValidationResult {
  valid: boolean;
  error?: 'not-in-dictionary' | 'wrong-start' | 'ends-with-n' | 'already-used' | 'empty';
  errorMessage?: string;
}

/** ゲーム状態 */
export interface WordChainState {
  phase: 'title' | 'playing' | 'game-over';
  mode: 'daily' | 'free';
  startWord: string;
  chain: ChainWord[];
  currentInput: string;
  timeLeft: number;          // ms（15000から減少）
  usedWords: Set<string>;
  score: number;
  dailyCompleted: boolean;   // 今日既にプレイ済みか
  dailySeed: string;         // YYYYMMDD
  errorMessage: string | null;
  rank: number;              // 擬似ランキング順位
}

/** アクション */
export type WordChainAction =
  | { type: 'START'; mode: 'daily' | 'free' }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'TICK'; elapsed: number }
  | { type: 'TIME_UP' }
  | { type: 'RESTART' };

/** デイリー記録 */
export interface DailyRecord {
  date: string;       // YYYYMMDD
  chainLength: number;
  score: number;
}

/** 辞書JSON形式 */
export interface DictEntry {
  w: string;   // ひらがな単語
  r: number;   // ランク 1-5
}
