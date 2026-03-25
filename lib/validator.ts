import type { ValidationResult } from './types';
import { isInDictionary } from './dictionary';

/**
 * カタカナ→ひらがな変換
 */
export function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0x60)
  );
}

/**
 * 末尾文字を取得（長音「ー」は直前の文字に変換）
 * 小文字は大文字に変換: 「しゃ」→「あ」、「っ」→「つ」
 */
export function getLastChar(word: string): string {
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
 * しりとりルール判定
 */
export function validateWord(
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
