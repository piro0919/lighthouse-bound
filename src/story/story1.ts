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
  // 3の場面。船乗りは漁師の子の父親で、箱は2の場面で漁師の子に届けたもの
  sailorShared: 'おうい、トウカ。なかまと わけたら、ふねの はこの りんごが ななつに なったんだ。',
  sailorWants: 'うみに でる まえに、はこを とおに したい。',
  sailorFerry: 'こぶねが でるのは いちど だけ。りんごを かごで とどけて おくれ。',
  sailorCrate: 'はこは ふねに あるよ。りんごは かごで たのむよ。',
  sailorNotApples: 'りんごを かごに いれて きて おくれ。',
  sailorThanks: 'ぴったり とおだ！ ありがとう。',
  sailorOver: 'おっと、はこに はいりきらないよ。',
  sailorShort: 'おや、まだ すきまが あるなあ。',
  sailorReturn: 'ちょうど とおに なる ぶんを、また あした たのむよ。',
  // 4の場面。こぶねが うまくいかなかったとき
  grandmaWelcome: 'おかえり。りんごが ぴったりに ならなかったんだね。',
  grandmaTogether: 'おばあちゃんと いっしょに みて みよう。',
  // 4の場面。1回で うまくいったとき
  grandmaWelcomeDone: 'おかえり。ぴったり とおに できたんだね。',
  grandmaAsk: 'どうして わかったの？ おばあちゃんに みせて おくれ。',
  grandmaFillSeven: 'はこに りんごを ななつ いれるよ。',
  grandmaLook: 'あいて いる ところに、りんごを いれて ごらん。',
  grandmaSevenThree: 'ななつと みっつで、とお。',
  grandmaFillFour: 'こんどは よっつ。',
  grandmaFourSix: 'よっつと むっつで、とお。',
  grandmaFillEight: 'こんどは やっつ。',
  grandmaEightTwo: 'やっつと ふたつで、とお。',
  grandmaSeeEmpty: 'あいて いる ところを みれば、あと いくつで とおに なるか わかるね。',
  grandmaSaw: 'そうか。あいて いる ところを みたんだね。',
  grandmaName: 'これを、とおの あいかた と よぼう。かいて おこうね。',
  grandmaTomorrow: 'あしたは きっと だいじょうぶ。',
} as const;

// 道具の手帳のページの名前
export const pageTitles = {
  pairs: 'とおの あいかた',
} as const;
