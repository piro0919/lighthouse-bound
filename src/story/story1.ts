// 物語1「とおの はこ」の文章。1年生の始めはひらがなを習っている途中なので、漢字は使わない（test/text-rules.test.ts）

export type LetterId = 'fisher' | 'merchant';

export const letters: Record<LetterId, readonly string[]> = {
  fisher: [
    'トウカちゃんへ',
    'あしたの あさ、おとうさんが ふねで うみに でます。',
    'りんごを はこに いっぱい ください。',
    'おとうさんが うみで おなかが すかないように。',
    'りょうしの いえの こより',
  ],
  merchant: [
    'こうぼうの みなさまへ',
    'みかんを いつつ、かごに いれて、おみせまで とどけて ください。',
    'どうぞ よろしく おねがいします。',
    'みなとの しょうにんより',
  ],
};

export const lines = {
  fisherWrong: 'あれ、これじゃ ないよ。',
  fisherNotFull: 'まだ すきまが あるよ。',
  fisherThanks: 'わあ、いっぱいだ！ ありがとう。',
  merchantWrong: 'おや、これでは ないようですね。',
  merchantPlates: 'では、おさらに ひとつずつ のせて ください。',
  merchantShort: 'おさらが あいて いますね。',
  merchantLeftover: 'あまった ぶんは おかえしします。',
  merchantThanks: 'たしかに。ありがとうございました。',
} as const;
