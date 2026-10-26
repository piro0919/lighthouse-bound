import Phaser from 'phaser';
import { emit } from '../bus';
import { MERCHANT_PLATES, settlePlates } from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { fillTiles, fitCamera, OUTER_MARGIN, STAGE, STAGE_CENTER, tappable, TILE } from '../view';

const WALL_ROWS = 3;
const COUNTER_SCALE = 3;
const COUNTER = { x: 24, y: 70 };
const MERCHANT_AT = { x: 88, y: 46 };
const PLATE_Y = 80;
const PLATE_PITCH = 26;
const PLATE_W = 16;
const FRUIT_ON_PLATE = { dx: 4, dy: -5 };
const ROW_Y = 140;
const ROW_PITCH = 14;
const SETTLE_DELAY_MS = 500;
const TOP_CENTER = { x: 0.5, y: 0 };

// 商人の店先。皿を5枚並べ、かごのみかんを1枚に1つずつのせる（1対1の対応）
export class Plates extends Phaser.Scene {
  constructor() {
    super('Plates');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'floor', -OUTER_MARGIN, 0, span, STAGE + OUTER_MARGIN);
    fillTiles(this, 'wall', -OUTER_MARGIN, 0, span, WALL_ROWS * TILE);
    this.add.image(MERCHANT_AT.x, MERCHANT_AT.y, 'merchant').setOrigin(0);
    this.add.image(COUNTER.x, COUNTER.y, 'desk').setOrigin(0).setScale(COUNTER_SCALE, 1);

    const firstPlateX = STAGE_CENTER - ((MERCHANT_PLATES - 1) * PLATE_PITCH + PLATE_W) / 2;
    const plateX = (n: number) => firstPlateX + n * PLATE_PITCH;
    for (let n = 0; n < MERCHANT_PLATES; n += 1) {
      this.add.image(plateX(n), PLATE_Y, 'plate').setOrigin(0);
    }

    const basket = getState().basket;
    let placed = 0;
    let settled = false;
    const rowX = STAGE_CENTER - ((basket.length - 1) * ROW_PITCH) / 2;
    const settle = () => {
      if (settled) return;
      settled = true;
      this.time.delayedCall(SETTLE_DELAY_MS, () => {
        const { state, result } = settlePlates(getState(), placed);
        setState(state);
        const back = () => this.scene.start('Town', { from: 'merchant' });
        if (result === 'short') {
          emit('say', { text: lines.merchantShort, onClose: back });
        } else if (result === 'leftover') {
          emit('say', {
            text: lines.merchantLeftover,
            onClose: () => emit('say', { text: lines.merchantThanks, onClose: back }),
          });
        } else {
          emit('say', { text: lines.merchantThanks, onClose: back });
        }
      });
    };

    basket.forEach((item, index) => {
      const fruit = this.add
        .image(rowX + index * ROW_PITCH, ROW_Y, item)
        .setOrigin(TOP_CENTER.x, TOP_CENTER.y);
      tappable(fruit, () => {
        if (settled || placed >= MERCHANT_PLATES || !fruit.input?.enabled) return;
        fruit.disableInteractive();
        fruit.setOrigin(0);
        fruit.setPosition(plateX(placed) + FRUIT_ON_PLATE.dx, PLATE_Y + FRUIT_ON_PLATE.dy);
        placed += 1;
        if (placed === MERCHANT_PLATES || placed === basket.length) settle();
      });
    });

    fitCamera(this);
  }
}
