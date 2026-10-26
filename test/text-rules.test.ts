import { describe, expect, it } from 'vitest';
import { letters, lines, pageTitles, reply } from '@/story/story1';

// 物語1はひらがなで始める。1年生のカタカナ（トウカ）は使ってよい。
// 数字・数式の記号は、どの学年でも画面に出さない（CLAUDE.md の Rules for content）
const KANA_ONLY = /^[ぁ-ゖァ-ヺー、。！？「」 ]+$/;
const DIGITS_OR_SYMBOLS = /[0-9０-９+＋\-−=＝×÷]/;

const allText = [
  ...Object.values(letters).flat(),
  ...Object.values(lines),
  ...Object.values(pageTitles),
  ...Object.values(reply).flat(),
];

describe('story 1 text', () => {
  it.each(allText)('uses kana only: %s', (text) => {
    expect(text).toMatch(KANA_ONLY);
  });

  it.each(allText)('has no digits or math symbols: %s', (text) => {
    expect(text).not.toMatch(DIGITS_OR_SYMBOLS);
  });
});
