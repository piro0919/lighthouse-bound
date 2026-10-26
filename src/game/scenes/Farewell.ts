import Phaser from 'phaser';
import { drawLamp } from '../art/sprites';
import { sayAll } from '../bus';
import { seeOff } from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { exitSign, fillTiles, fitCamera, OUTER_MARGIN, STAGE, TILE } from '../view';

const SAND_Y = 120;
const PIER = { x: 88, y: 64 };
const HERO_AT = { x: 80, y: 66 };
const CHILD_AT = { x: 96, y: 66 };
const SHIP_AT = { x: 68, y: 10 };
// 縦長の画面では場面の上の海まで見えるので、沖へ出ながら薄れて消える
const SHIP_GONE_Y = -STAGE / 2;
const LIGHTHOUSE_AT = { x: 150, y: 40 };
const EVENING = { color: 0x2b1d4a, alpha: 0.45 };
// 夕方の色より上に、灯と灯台を描く
const ABOVE_EVENING = 1;
const START_MS = 600;
const SAIL_MS = 3500;
const LIGHT_MS = 1200;
// 持ち物の欄に重ならないよう、下から 48 より上に置く（CLAUDE.md の Design rules）
const EXIT_AT = { x: 8, y: 124 };

// 7の場面の終わり。夕方、トウカと漁師の子が桟橋で船を見送る。船が出ていくと、灯台に灯がともる
export class Farewell extends Phaser.Scene {
  constructor() {
    super('Farewell');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'water', -OUTER_MARGIN, -OUTER_MARGIN, span, OUTER_MARGIN + SAND_Y);
    fillTiles(this, 'sand', -OUTER_MARGIN, SAND_Y, span, STAGE + OUTER_MARGIN);
    fillTiles(this, 'pier', PIER.x, PIER.y, TILE, SAND_Y - PIER.y);
    const ship = this.add.image(SHIP_AT.x, SHIP_AT.y, 'ship').setOrigin(0);
    this.add.image(HERO_AT.x, HERO_AT.y, 'hero').setOrigin(0);
    this.add.image(CHILD_AT.x, CHILD_AT.y, 'child').setOrigin(0);
    this.add
      .rectangle(-OUTER_MARGIN, -OUTER_MARGIN, span, span, EVENING.color, EVENING.alpha)
      .setOrigin(0);
    this.add
      .image(LIGHTHOUSE_AT.x, LIGHTHOUSE_AT.y, 'lighthouse')
      .setOrigin(0)
      .setDepth(ABOVE_EVENING);

    this.time.delayedCall(START_MS, () =>
      sayAll([lines.childBye], () => {
        this.tweens.add({
          targets: ship,
          y: SHIP_GONE_Y,
          alpha: 0,
          duration: SAIL_MS,
          onComplete: () => this.light(),
        });
      }),
    );
    fitCamera(this);
  }

  private light(): void {
    const lamp = drawLamp(this, LIGHTHOUSE_AT).setAlpha(0).setDepth(ABOVE_EVENING);
    this.tweens.add({ targets: lamp, alpha: 1, duration: LIGHT_MS });
    setState(seeOff(getState()));
    exitSign(this, EXIT_AT, () => this.scene.start('Town', { from: 'pier' }));
  }
}
