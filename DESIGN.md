# 言葉つなぎバトル（Word Chain Arena） 詳細設計書

## 概要
しりとりゲーム。15秒以内に次の単語を入力し、チェーンを伸ばす。
デイリーモードで全プレイヤー同一の開始語。Wordle風絵文字シェア。

---

## 1. 技術スタック

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- localStorage でデイリー完了状態+ハイスコア永続化
- Web Audio API で効果音
- @vercel/og でOGP動的生成
- 内蔵辞書JSON（約5000語）

---

## 2. 画面遷移

```
タイトル画面 → [今日の挑戦] → ゲームプレイ画面(daily) → [ゲームオーバー] → 結果画面（シェア）
              → [フリープレイ] → ゲームプレイ画面(free) → [ゲームオーバー] → 結果画面
```

---

## 3. ファイル構成

```
言葉つなぎバトル/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # タイトル画面
│   ├── globals.css
│   ├── play/page.tsx         # ゲーム本体（?mode=daily|free）
│   └── api/og/route.tsx      # OGP動的生成
├── components/
│   ├── WordChain.tsx         # チェーン表示（カードリスト、縦スクロール）
│   ├── WordCard.tsx          # 個別単語カード（緑枠/金枠/赤枠）
│   ├── InputArea.tsx         # テキスト入力+決定ボタン
│   ├── TimerBar.tsx          # 15秒カウントダウンバー
│   ├── FeedbackToast.tsx     # エラーメッセージ表示
│   └── ResultModal.tsx       # 結果画面（シェアボタン付き）
├── lib/
│   ├── wordChainReducer.ts   # useReducer用reducer
│   ├── dictionary.ts         # 辞書検索・頻度ランク判定
│   ├── validator.ts          # しりとりルール判定
│   ├── seededRandom.ts       # シード付きランダム
│   ├── sound.ts              # 効果音
│   └── share.ts              # シェアテキスト生成
├── data/
│   └── words.json            # 5000語辞書
├── scripts/
│   └── generateDictionary.ts # 辞書生成スクリプト（開発用）
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── DESIGN.md
```

---

## 4. 型定義

```typescript
// lib/types.ts

/** 辞書エントリ */
interface DictionaryEntry {
  word: string;       // ひらがな表記
  rank: number;       // 頻度ランク 1-5（1=最頻出、5=最レア）
}

/** チェーン内の単語 */
interface ChainWord {
  word: string;
  isRare: boolean;    // rank >= 4
  timestamp: number;  // 回答時刻
}

/** バリデーション結果 */
interface ValidationResult {
  valid: boolean;
  error?: 'not-in-dictionary' | 'wrong-start' | 'ends-with-n' | 'already-used' | 'empty';
  errorMessage?: string;
}

/** ゲーム状態 */
interface WordChainState {
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
type WordChainAction =
  | { type: 'START'; mode: 'daily' | 'free' }
  | { type: 'SET_INPUT'; value: string }
  | { type: 'SUBMIT' }
  | { type: 'TICK'; elapsed: number }
  | { type: 'TIME_UP' }
  | { type: 'RESTART' };
```

---

## 5. コンポーネント詳細設計

### 5.1 app/page.tsx（タイトル画面）

**レイアウト:**
```
┌────────────────────────┐
│   言葉つなぎバトル      │  ← タイトル（筆文字風フォント）
│   Word Chain Arena     │  ← サブタイトル
│                        │
│   今日のお題: りんご 🍎  │  ← デイリーの開始語プレビュー
│                        │
│  ┌──────────────────┐  │
│  │  今日の挑戦       │  │  ← プライマリボタン
│  └──────────────────┘  │
│  ┌──────────────────┐  │
│  │  フリープレイ     │  │  ← セカンダリボタン
│  └──────────────────┘  │
│                        │
│  ベスト: 23語          │  ← ハイスコア
│  今日の結果: 14語 ✅   │  ← デイリー完了済みの場合
└────────────────────────┘
```

**実装:**
- デイリー完了済みの場合、「今日の挑戦」ボタンをdisabledにし「完了済み ✅」表示
- 開始語のプレビューは `seededRandom(今日の日付)` で計算

### 5.2 app/play/page.tsx

**レイアウト:**
```
┌────────────────────────┐
│ 今日のお題: りんご 🍎   │  ← ヘッダー
│ チェーン: 5語 | ⭐ 120pt │
├────────────────────────┤
│ ┌──────────────────┐   │
│ │ りんご           │   │  ← 開始語（灰色枠）
│ └──────────────────┘   │
│ ┌──────────────────┐   │
│ │ ごりら      +10  │   │  ← 普通の単語（緑枠）
│ └──────────────────┘   │
│ ┌──────────────────┐   │
│ │ らっきょう  +13✨│   │  ← レア単語（金枠）
│ └──────────────────┘   │
│         ...            │  ← スクロール
├────────────────────────┤
│ ████████░░░░ 8秒       │  ← タイマーバー
├────────────────────────┤
│ [ひらがな入力______]   │
│      [決定]            │
└────────────────────────┘
```

**実装:**
- `useReducer(wordChainReducer, initialState)`
- タイマーは `useEffect` + `setInterval(100ms)` で管理
- 入力はcontrolled input (`value={state.currentInput}`)
- 決定ボタン or Enterキーで `SUBMIT` dispatch
- チェーン表示は `useRef` でスクロール位置を最下部に自動スクロール

### 5.3 WordChain.tsx
```typescript
interface WordChainProps {
  chain: ChainWord[];
  startWord: string;
}
```
- `overflow-y: auto` の縦スクロールコンテナ
- 新しい単語追加時に `scrollIntoView({ behavior: 'smooth' })` で最下部にスクロール
- 各単語はWordCardコンポーネントで描画

### 5.4 WordCard.tsx
```typescript
interface WordCardProps {
  word: string;
  isRare: boolean;
  isStart: boolean;    // 開始語か
  index: number;       // アニメーション遅延用
  score?: number;      // 獲得ポイント
}
```

**CSS:**
- 開始語: `border: 2px solid #9CA3AF; bg-gray-50`（灰色）
- 普通: `border: 2px solid #22C55E; bg-green-50`（緑）
- レア: `border: 2px solid #EAB308; bg-yellow-50; box-shadow: 0 0 10px #EAB30840`（金）
- 追加アニメーション: `animate-slide-in`（左からスライドイン、0.2s）
- フォント: 大きめ（text-xl）、ひらがな表示

### 5.5 InputArea.tsx
```typescript
interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  lastChar: string;     // 前の単語の末尾文字（ヒント表示用）
  errorMessage: string | null;
}
```

**実装:**
- `<input type="text" inputMode="kana" />` でひらがなキーボード誘導
- プレースホルダー: `「${lastChar}」から始まる言葉...`
- エラー時: 入力欄が赤く光る（0.3s）+ エラーメッセージ表示
- 決定ボタン: 入力が空なら disabled

### 5.6 TimerBar.tsx
```typescript
interface TimerBarProps {
  timeLeft: number;    // ms (0-15000)
  maxTime: number;     // 15000
}
```
- 横幅が `timeLeft / maxTime * 100%` で減少
- 色変化: 緑(>10s) → 黄(5-10s) → 赤(<5s)
- 残り3秒: パルスアニメーション
- `transition: width 0.1s linear`

### 5.7 ResultModal.tsx
```typescript
interface ResultProps {
  chain: ChainWord[];
  score: number;
  mode: 'daily' | 'free';
  startWord: string;
  onRestart: () => void;
  onTitle: () => void;
}
```

**表示内容:**
- チェーン長: `${chain.length}語`
- レアワード数: `レア${rareCount}個`
- スコア: `${score}pt`
- 擬似ランキング: `全国 約${rank}位`（ローカル計算）
- シェアボタン → Wordle風絵文字シェア
- デイリーモード: 「明日もチャレンジ！」メッセージ
- フリーモード: 「もう1回」ボタン

---

## 6. ロジック詳細設計

### 6.1 lib/dictionary.ts

**辞書構造:**
```typescript
// data/words.json の形式
// ビルド時にimportして使用
interface DictEntry {
  w: string;   // ひらがな単語
  r: number;   // ランク 1-5
}

// 検索用マップ（初期化時に構築）
let wordMap: Map<string, number> | null = null;
let wordsByStart: Map<string, string[]> | null = null;

function initDictionary(entries: DictEntry[]): void {
  wordMap = new Map();
  wordsByStart = new Map();
  for (const entry of entries) {
    wordMap.set(entry.w, entry.r);
    const firstChar = entry.w[0];
    if (!wordsByStart.has(firstChar)) {
      wordsByStart.set(firstChar, []);
    }
    wordsByStart.get(firstChar)!.push(entry.w);
  }
}

function isInDictionary(word: string): boolean {
  return wordMap?.has(word) ?? false;
}

function getRank(word: string): number {
  return wordMap?.get(word) ?? 0;
}

function isRareWord(word: string): boolean {
  return getRank(word) >= 4;
}
```

**辞書データ生成方針:**
- 基本語彙: 小学校〜中学校で習う一般的な名詞
- カテゴリ: 動物、食べ物、地名、日用品、自然、身体、職業、乗り物、色、感情、スポーツ等
- 「ん」で終わる単語も辞書に含めるが、入力時にバリデーションで弾く
- ランク分布: 1(30%), 2(25%), 3(20%), 4(15%), 5(10%)
- 各開始文字に最低20語以上を確保（しりとりが詰まらないように）
- 「を」「ん」で始まる単語は不要

**辞書サイズ見積もり:**
- 5000語 × 平均8バイト/語 ≈ 40KB（gzip後約15KB）
- JSONファイルとしてdata/words.jsonに配置、Next.jsのimportで取り込み

### 6.2 lib/validator.ts

```typescript
/**
 * しりとりルール判定
 */
function validateWord(
  input: string,
  previousWord: string,
  usedWords: Set<string>
): ValidationResult {
  // 1. 空チェック
  if (input.length === 0) {
    return { valid: false, error: 'empty', errorMessage: '文字を入力してください' };
  }

  // 2. ひらがな正規化（カタカナ→ひらがな変換）
  const normalized = toHiragana(input.trim());

  // 3. 前の単語の末尾文字を取得
  const lastChar = getLastChar(previousWord);

  // 4. 先頭文字チェック
  if (normalized[0] !== lastChar) {
    return {
      valid: false,
      error: 'wrong-start',
      errorMessage: `「${lastChar}」から始まる言葉を入力してね`,
    };
  }

  // 5. 「ん」終わりチェック
  if (normalized.endsWith('ん')) {
    return {
      valid: false,
      error: 'ends-with-n',
      errorMessage: '「ん」で終わる言葉はダメ！',
    };
  }

  // 6. 辞書チェック
  if (!isInDictionary(normalized)) {
    return {
      valid: false,
      error: 'not-in-dictionary',
      errorMessage: '辞書にない言葉です...',
    };
  }

  // 7. 既出チェック
  if (usedWords.has(normalized)) {
    return {
      valid: false,
      error: 'already-used',
      errorMessage: 'もう使った言葉です！',
    };
  }

  return { valid: true };
}

/**
 * 末尾文字を取得（長音「ー」は直前の文字に変換）
 * 例: 「しーそー」→「そ」
 * 小文字は大文字に変換: 「しゃ」→「あ」、「っ」→「つ」
 */
function getLastChar(word: string): string {
  let lastChar = word[word.length - 1];

  // 長音処理
  if (lastChar === 'ー') {
    lastChar = word[word.length - 2];
  }

  // 小文字→大文字変換
  const smallToLarge: Record<string, string> = {
    'ぁ': 'あ', 'ぃ': 'い', 'ぅ': 'う', 'ぇ': 'え', 'ぉ': 'お',
    'ゃ': 'や', 'ゅ': 'ゆ', 'ょ': 'よ', 'っ': 'つ',
  };

  return smallToLarge[lastChar] || lastChar;
}

/**
 * カタカナ→ひらがな変換
 */
function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}
```

### 6.3 lib/wordChainReducer.ts

```typescript
function wordChainReducer(state: WordChainState, action: WordChainAction): WordChainState {
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
      return { ...state, phase: 'game-over' };

    case 'RESTART':
      return { ...state, phase: 'title' };

    default:
      return state;
  }
}
```

### 6.4 lib/seededRandom.ts

```typescript
/**
 * シード付き擬似乱数生成器（Mulberry32）
 */
function seededRandom(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 日付文字列からシード値を生成
 */
function dateToSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 今日のデイリー開始語を返す
 */
function getDailyStartWord(dateStr: string): string {
  const rng = seededRandom(dateToSeed(dateStr));
  // しりとりに適した開始語リスト（「ん」で終わらない、一般的な名詞）
  const startCandidates = getStartCandidates(); // 辞書からフィルタ
  const index = Math.floor(rng() * startCandidates.length);
  return startCandidates[index];
}
```

### 6.5 lib/share.ts

```typescript
/**
 * Wordle風絵文字グリッドを生成
 */
function generateShareGrid(chain: ChainWord[]): string {
  return chain.map(w => w.isRare ? '🟨' : '🟩').join('') + '💀';
}

/**
 * シェアテキスト生成
 */
function generateShareText(
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
```

---

## 7. スコア計算

```
基本: 1語 = 10pt
レアボーナス: +3pt（rank 4-5の単語）
連続ボーナス: なし（シンプルに語数×ポイント）
```

---

## 8. 擬似ランキング計算

```typescript
/**
 * スコアから擬似的な全国順位を計算
 * 実際のランキングサーバーは不要
 * 正規分布ベースで「それっぽい」順位を返す
 */
function calculatePseudoRank(chainLength: number): number {
  // 平均チェーン長: 8語、標準偏差: 4語と仮定
  // 全プレイヤー数: 10000人と仮定
  const mean = 8;
  const std = 4;
  const totalPlayers = 10000;

  // 正規分布のCDF近似
  const z = (chainLength - mean) / std;
  const cdf = 0.5 * (1 + erf(z / Math.sqrt(2)));

  // 上位何%か
  const rank = Math.max(1, Math.floor(totalPlayers * (1 - cdf)));
  return rank;
}
```

---

## 9. タイマー実装

```typescript
// play/page.tsxでの実装
useEffect(() => {
  if (state.phase !== 'playing') return;

  const interval = setInterval(() => {
    dispatch({ type: 'TICK', elapsed: 100 });
  }, 100);

  return () => clearInterval(interval);
}, [state.phase]);

// timeLeftが0になったら
useEffect(() => {
  if (state.timeLeft <= 0 && state.phase === 'playing') {
    dispatch({ type: 'TIME_UP' });
  }
}, [state.timeLeft, state.phase]);
```

---

## 10. デイリーモードのlocalStorage管理

```typescript
const DAILY_KEY = 'word-chain-daily';
const HIGHSCORE_KEY = 'word-chain-highscore';

interface DailyRecord {
  date: string;       // YYYYMMDD
  chainLength: number;
  score: number;
}

function isDailyCompleted(dateStr: string): boolean {
  const record = localStorage.getItem(DAILY_KEY);
  if (!record) return false;
  const parsed: DailyRecord = JSON.parse(record);
  return parsed.date === dateStr;
}

function saveDailyResult(dateStr: string, chainLength: number, score: number): void {
  const record: DailyRecord = { date: dateStr, chainLength, score };
  localStorage.setItem(DAILY_KEY, JSON.stringify(record));
}

function getHighScore(): number {
  return parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10);
}

function saveHighScore(chainLength: number): void {
  const current = getHighScore();
  if (chainLength > current) {
    localStorage.setItem(HIGHSCORE_KEY, chainLength.toString());
  }
}
```

---

## 11. 辞書データ作成ガイドライン

**words.json の要件:**
1. 約5000語のひらがな名詞
2. 各語に頻度ランク(1-5)を付与
3. 各開始文字(あ〜わ)に最低20語
4. 「ん」で始まる語は除外
5. 「を」で始まる語は除外
6. 2文字以上の語のみ

**カテゴリ配分目安:**
- 動物(300語): いぬ、ねこ、きりん...
- 食べ物(500語): りんご、すし、てんぷら...
- 地名(200語): とうきょう、おおさか...
- 日用品(400語): かばん、くつ、めがね...
- 自然(300語): やま、かわ、そら...
- 身体(100語): あたま、て、あし...
- 職業(100語): いしゃ、せんせい...
- 乗り物(100語): でんしゃ、くるま...
- その他(3000語): 一般名詞全般

**生成方法:**
- ChatGPT/Claudeに「しりとり用ひらがな名詞リストを生成して」と依頼
- または既存のオープンソース日本語辞書（IPAdic等）からフィルタリング
- ランクは単語の文字数と一般認知度で自動判定:
  - ランク1: 3文字以下の超一般語
  - ランク2: 4文字の一般語
  - ランク3: 5文字の普通語
  - ランク4: 6文字以上 or やや専門的
  - ランク5: 7文字以上 or 専門的

---

## 12. 効果音

| イベント | 音の特徴 | 周波数 | 長さ |
|---|---|---|---|
| 単語正解 | 和風の成功音 | 523→784Hz(ドソ) | 0.2s |
| レア単語 | キラキラ音 | 1047→1568Hz+倍音 | 0.3s |
| タイマー警告 | チクタク | 400Hz短パルス | 0.05s×繰返し |
| ゲームオーバー | 和風の失敗音 | 330→220Hz | 0.3s |
| 入力エラー | ブブー | 200Hz矩形波 | 0.15s |
