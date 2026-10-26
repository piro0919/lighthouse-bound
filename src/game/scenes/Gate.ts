import Phaser from 'phaser';
import { exitSign, fillTiles, fitCamera, OUTER_MARGIN, STAGE, tappable, TILE } from '../view';

// 渡し舟を待っている町の人。札がいる数より多く並ぶ
const WAITING = [
  'folkA',
  'folkB',
  'folkC',
  'child',
  'folkD',
  'folkB',
  'folkA',
  'folkD',
  'folkC',
] as const;
const ROW = { x: 6, y: 72, pitch: 20 };
const TAG_ABOVE = 10;
const BELL_AT = { x: 164, y: 20 };
const WATER_ROWS = 2;
// 持ち物の欄に重ならないよう、下から 48 より上に置く（CLAUDE.md の Design rules）
const EXIT_AT = { x: 8, y: 120 };
const RING_ANGLE = 15;
const RING_MS = 80;
const TOP_CENTER = { x: 0.5, y: 0 };

// 5の場面の渡し舟の のりば。人を触ると札を渡し、もう一度触ると返してもらう。
// 鐘を鳴らすと渡し舟が来て、札を持った人だけが乗る。渡し舟が来るのは1日に1回
export class Gate extends Phaser.Scene {
  constructor() {
    super('Gate');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'sand', -OUTER_MARGIN, -OUTER_MARGIN, span, span);
    fillTiles(this, 'water', -OUTER_MARGIN, -OUTER_MARGIN, span, OUTER_MARGIN + WATER_ROWS * TILE);
    fillTiles(this, 'pier', -OUTER_MARGIN, WATER_ROWS * TILE, span, TILE);

    const tagged = new Set<number>();
    WAITING.forEach((key, n) => {
      const x = ROW.x + n * ROW.pitch;
      const tag = this.add
        .image(x + TILE / 2, ROW.y - TAG_ABOVE, 'tag')
        .setOrigin(TOP_CENTER.x, TOP_CENTER.y)
        .setVisible(false);
      tappable(this.add.image(x, ROW.y, key).setOrigin(0), () => {
        if (tagged.has(n)) tagged.delete(n);
        else tagged.add(n);
        tag.setVisible(tagged.has(n));
      });
    });

    let leaving = false;
    const bell = this.add
      .image(BELL_AT.x + TILE / 2, BELL_AT.y, 'bell')
      .setOrigin(TOP_CENTER.x, TOP_CENTER.y);
    tappable(bell, () => {
      this.tweens.add({ targets: bell, angle: RING_ANGLE, duration: RING_MS, yoyo: true });
      if (tagged.size === 0 || leaving) return;
      leaving = true;
      this.time.delayedCall(RING_MS * 2, () =>
        this.scene.start('Fill', { job: 'crossing', carried: tagged.size }),
      );
    });

    exitSign(this, EXIT_AT, () => this.scene.start('Town', { from: 'gate' }));
    fitCamera(this);
  }
}
