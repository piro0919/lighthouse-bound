import Phaser from 'phaser';
import { BASKET_WIDTH, CRATE_WIDTH, drawBasket, drawCrate, slotPosition } from '../art/containers';
import { sayAll } from '../bus';
import { CRATE_SLOTS, SAILOR_HAS, sendFerry, type Item } from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { fillTiles, fitCamera, OUTER_MARGIN, STAGE, STAGE_CENTER } from '../view';

const CRATE_SCALE = 3;
const BASKET_SCALE = 2;
const CRATE_AT = { x: STAGE_CENTER - (CRATE_WIDTH * CRATE_SCALE) / 2, y: 36 };
const BASKET_AT = { x: STAGE_CENTER - (BASKET_WIDTH * BASKET_SCALE) / 2, y: 120 };
const SAILOR_AT = { x: 150, y: 10 };
const DECK = { y: 28, height: 76 };
const MOVE_MS = 350;
const PAUSE_MS = 150;
const LINE_DELAY_MS = 500;
const FADE_MS = 700;
// 入りきらないりんごは、箱の上まで跳ねてからかごへ戻る
const BOUNCE_HEIGHT = 12;
const BOUNCE_Y = CRATE_AT.y - BOUNCE_HEIGHT;

// 船の上。こぶねで運んだりんごを、船の箱（2の場面の、5つずつ2列の箱）の空いた穴へ1つずつ落とす。
// 余ればかごへ転がり戻り、足りなければ穴が空いたまま見える。失敗の形が、そのまま答えの形になる
export class Ferry extends Phaser.Scene {
  constructor() {
    super('Ferry');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'water', -OUTER_MARGIN, -OUTER_MARGIN, span, span);
    fillTiles(this, 'pier', -OUTER_MARGIN, DECK.y, span, DECK.height);
    this.add.image(SAILOR_AT.x, SAILOR_AT.y, 'sailor').setOrigin(0);

    const carried = getState().basket.length;
    const { state, result } = sendFerry(getState());
    setState(state);

    const onBoat = Array.from({ length: CRATE_SLOTS }, (_, slot): Item | null =>
      slot < SAILOR_HAS ? 'apple' : null,
    );
    drawCrate(this, CRATE_AT.x, CRATE_AT.y, onBoat).setScale(CRATE_SCALE);

    // かごの中身は、まだ運んでいないものと、入りきらずに戻ってきたもの
    let waiting = carried;
    let returned = 0;
    let basketView: Phaser.GameObjects.Container | null = null;
    const showBasket = () => {
      basketView?.destroy();
      basketView = drawBasket(
        this,
        BASKET_AT.x,
        BASKET_AT.y,
        Array<Item>(waiting + returned).fill('apple'),
      ).setScale(BASKET_SCALE);
    };
    showBasket();

    const mouth = { x: STAGE_CENTER, y: BASKET_AT.y };
    const inSlots: Phaser.GameObjects.Image[] = [];
    const move = (
      apple: Phaser.GameObjects.Image,
      to: { x: number; y: number },
      then: () => void,
    ) =>
      this.tweens.add({
        targets: apple,
        x: to.x,
        y: to.y,
        duration: MOVE_MS,
        onComplete: () => this.time.delayedCall(PAUSE_MS, then),
      });

    const endDay = () => {
      const camera = this.cameras.main;
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
        this.scene.start('Workshop'),
      );
      camera.fadeOut(FADE_MS);
    };

    // うまくいかなかったときは、箱に入れたりんごも全部かごに戻り、その日はおしまいになる
    const giveBack = () => {
      const apple = inSlots.pop();
      if (!apple) {
        sayAll([lines.sailorReturn], endDay);
        return;
      }
      move(apple, mouth, () => {
        apple.destroy();
        returned += 1;
        showBasket();
        giveBack();
      });
    };

    const finish = () => {
      if (result === 'thanks') {
        sayAll([lines.sailorThanks], () => this.scene.start('Town', { from: 'pier' }));
        return;
      }
      sayAll([result === 'over' ? lines.sailorOver : lines.sailorShort], giveBack);
    };

    const carry = () => {
      if (waiting === 0) {
        this.time.delayedCall(LINE_DELAY_MS, finish);
        return;
      }
      waiting -= 1;
      showBasket();
      const apple = this.add.image(mouth.x, mouth.y, 'apple').setOrigin(0).setScale(CRATE_SCALE);
      const slot = SAILOR_HAS + inSlots.length;
      if (slot < CRATE_SLOTS) {
        inSlots.push(apple);
        const { x, y } = slotPosition(slot);
        move(apple, { x: CRATE_AT.x + x * CRATE_SCALE, y: CRATE_AT.y + y * CRATE_SCALE }, carry);
        return;
      }
      move(apple, { x: mouth.x, y: BOUNCE_Y }, () =>
        move(apple, mouth, () => {
          apple.destroy();
          returned += 1;
          showBasket();
          carry();
        }),
      );
    };

    this.time.delayedCall(LINE_DELAY_MS, carry);
    fitCamera(this);
  }
}
