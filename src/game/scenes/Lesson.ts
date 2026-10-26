import Phaser from 'phaser';
import { CRATE_WIDTH, slotPosition, SLOT_HOLE } from '../art/containers';
import { emit, sayAll } from '../bus';
import { CRATE_SLOTS, LESSON_FILLS, writePage } from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { fitCamera, onLeave, OUTER_MARGIN, STAGE, STAGE_CENTER } from '../view';
import { setBagTap } from './Hud';

const DIM_ALPHA = 0.6;
const CRATE_SCALE = 3;
const CRATE_AT = { x: STAGE_CENTER - (CRATE_WIDTH * CRATE_SCALE) / 2, y: 52 };
const GRANDMA_SCALE = 2;
const GRANDMA_SIZE = 16;
const GRANDMA_AT = { x: STAGE_CENTER - (GRANDMA_SIZE * GRANDMA_SCALE) / 2, y: 8 };
const FILL_MS = 250;
const NIGHT_MS = 700;

// おばあちゃんが入れる数と、そのあとに言うこと。最初は船の箱と同じ ななつ
const ROUNDS = [
  { start: lines.grandmaFillSeven, done: lines.grandmaSevenThree },
  { start: lines.grandmaFillFour, done: lines.grandmaFourSix },
  { start: lines.grandmaFillEight, done: lines.grandmaEightTwo },
].map((talk, n) => ({ ...talk, count: LESSON_FILLS[n].filled }));

// 4の場面。工房の同じ箱に、おばあちゃんがりんごを入れ、空いている穴をトウカが埋める。
// 何通りか見たあとで、手帳に とおの あいかた のページを書く。
// こぶねがうまくいかなかった日は、そのあと夜になって次の日が来る
export class Lesson extends Phaser.Scene {
  constructor() {
    super('Lesson');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    // 話の途中なので、外を触っても閉じない
    this.add
      .rectangle(-OUTER_MARGIN, -OUTER_MARGIN, span, span, 0x000000, DIM_ALPHA)
      .setOrigin(0)
      .setInteractive();
    this.add.image(GRANDMA_AT.x, GRANDMA_AT.y, 'grandma').setOrigin(0).setScale(GRANDMA_SCALE);
    this.add.image(CRATE_AT.x, CRATE_AT.y, 'crate').setOrigin(0).setScale(CRATE_SCALE);

    // 教わっている間に持ち物を触っても、捨てないようにする
    setBagTap(() => undefined);
    onLeave(this, () => setBagTap(null));

    const solved = getState().delivered.sailor;
    const opening = solved
      ? [lines.grandmaWelcomeDone, lines.grandmaAsk]
      : [lines.grandmaWelcome, lines.grandmaTogether];
    sayAll(opening, () => this.round(0));
    fitCamera(this);
  }

  private round(index: number): void {
    const round = ROUNDS[index];
    if (!round) {
      this.writePage();
      return;
    }
    const apples: Phaser.GameObjects.Image[] = [];
    const put = (slot: number) => {
      const { x, y } = slotPosition(slot);
      const apple = this.add
        .image(CRATE_AT.x + x * CRATE_SCALE, CRATE_AT.y + y * CRATE_SCALE, 'apple')
        .setOrigin(0)
        .setScale(CRATE_SCALE);
      apples.push(apple);
    };

    sayAll([round.start], () => {
      for (let slot = 0; slot < round.count; slot += 1) {
        this.time.delayedCall(FILL_MS * (slot + 1), () => put(slot));
      }
      this.time.delayedCall(FILL_MS * (round.count + 1), () => {
        const prompt = index === 0 ? [lines.grandmaLook] : [];
        sayAll(prompt, () =>
          this.fillEmpty(round.count, put, () => {
            sayAll([round.done], () => {
              apples.forEach((apple) => {
                apple.destroy();
              });
              this.round(index + 1);
            });
          }),
        );
      });
    });
  }

  // 空いている穴を触ると、そこにりんごが入る。全部埋まったら次へ進む
  private fillEmpty(from: number, put: (slot: number) => void, onFull: () => void): void {
    let left = CRATE_SLOTS - from;
    const holes = Array.from({ length: left }, (_, n) => {
      const slot = from + n;
      const { x, y } = slotPosition(slot);
      const zone = this.add
        .zone(
          CRATE_AT.x + x * CRATE_SCALE,
          CRATE_AT.y + y * CRATE_SCALE,
          SLOT_HOLE * CRATE_SCALE,
          SLOT_HOLE * CRATE_SCALE,
        )
        .setOrigin(0)
        .setInteractive({ useHandCursor: true });
      zone.once('pointerdown', () => {
        zone.destroy();
        put(slot);
        left -= 1;
        if (left === 0) onFull();
      });
      return zone;
    });
    if (holes.length === 0) onFull();
  }

  private writePage(): void {
    const solved = getState().delivered.sailor;
    const closing = solved
      ? [lines.grandmaSaw, lines.grandmaName]
      : [lines.grandmaSeeEmpty, lines.grandmaName];
    sayAll(closing, () => {
      setState(writePage(getState(), 'pairs'));
      emit('notebook', {
        onClose: () => {
          if (solved) {
            this.scene.stop();
            return;
          }
          sayAll([lines.grandmaTomorrow], () => this.night());
        },
      });
    });
  }

  // 暗くして明るくし、次の日の朝にする
  private night(): void {
    const camera = this.cameras.main;
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.stop());
    camera.fadeOut(NIGHT_MS);
  }
}
