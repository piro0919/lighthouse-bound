import Phaser from 'phaser';
import { drawBasket, drawCrate } from '../art/containers';
import { emit } from '../bus';
import { BAG_LIMIT, lessonDue, pick, stepFiveOpen, stepSixOpen } from '../state';
import { getState, setState, subscribe } from '../store';
import { fillTiles, fitCamera, onLeave, OUTER_MARGIN, STAGE, tappable, TILE } from '../view';

const WALL_ROWS = 3;
const DESK = { x: 28, y: 76 };
const LETTERS = [
  { id: 'fisher', x: 34, y: 78 },
  { id: 'merchant', x: 54, y: 80 },
] as const;
// 5の場面で届く手紙。前の手紙の手前に重ねて置く
const STEP_FIVE_LETTERS = [
  { id: 'crossing', x: 30, y: 86 },
  { id: 'net', x: 60, y: 86 },
] as const;
const TALLY_LETTER = { id: 'tally', x: 45, y: 82 } as const;
// 6の場面の蔵へ行く戸。左の壁に置く
const STOREROOM_DOOR = { x: 8, y: 28 };
// 小屋の棚の浮き。入り直すと、また並んでいる
const SHELF_AT = { x: 4, y: 100 };
const FLOAT_ROWS = 2;
const FLOATS_PER_ROW = 6;
const FLOAT_PITCH = 9;
const FLOAT_INSET = { x: 2, y: 3 };
const FLOAT_ROW_PITCH = 13;
// 浮きは間が狭いので、触れる範囲を隣と重ならない広さにとどめる
const FLOAT_TAP_PAD = 0;
const CRATE_AT = { x: 116, y: 84 };
const BASKET_AT = { x: 136, y: 128 };
const DOOR_AT = { x: 152, y: 28 };
const HERO_AT = { x: 88, y: 132 };
const GRANDMA_AT = { x: 60, y: 128 };

// 工房の中。机の手紙を読み、箱とかごに詰め、戸口から町へ出る
export class Workshop extends Phaser.Scene {
  constructor() {
    super('Workshop');
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'floor', -OUTER_MARGIN, 0, span, STAGE + OUTER_MARGIN);
    fillTiles(this, 'wall', -OUTER_MARGIN, 0, span, WALL_ROWS * TILE);

    this.add.image(DESK.x, DESK.y, 'desk').setOrigin(0);
    const stepFive = stepFiveOpen(getState());
    const stepSix = stepSixOpen(getState());
    [
      ...LETTERS,
      ...(stepFive ? STEP_FIVE_LETTERS : []),
      ...(stepSix ? [TALLY_LETTER] : []),
    ].forEach(({ id, x, y }) => {
      tappable(this.add.image(x, y, 'letter').setOrigin(0), () => emit('letter', id));
    });
    if (stepFive) this.shelf();
    if (stepSix && !getState().delivered.tally) {
      tappable(this.add.image(STOREROOM_DOOR.x, STOREROOM_DOOR.y, 'door').setOrigin(0), () =>
        this.scene.start('Storeroom'),
      );
    }

    tappable(this.add.image(DOOR_AT.x, DOOR_AT.y, 'door').setOrigin(0), () =>
      this.scene.start('Town', { from: 'workshop' }),
    );
    this.add.image(HERO_AT.x, HERO_AT.y, 'hero').setOrigin(0);
    this.add.image(GRANDMA_AT.x, GRANDMA_AT.y, 'grandma').setOrigin(0);

    let drawn: Phaser.GameObjects.GameObject[] = [];
    const drawContainers = () => {
      drawn.forEach((object) => {
        object.destroy();
      });
      const { crate, basket } = getState();
      const views = {
        crate: drawCrate(this, CRATE_AT.x, CRATE_AT.y, crate),
        basket: drawBasket(this, BASKET_AT.x, BASKET_AT.y, basket),
      };
      drawn = Object.entries(views).flatMap(([target, view]) => {
        const bounds = view.getBounds();
        const zone = this.add
          .zone(bounds.x, bounds.y, bounds.width, bounds.height)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true });
        zone.on('pointerdown', () => this.openPacking(target as 'crate' | 'basket'));
        return [view, zone];
      });
    };
    drawContainers();
    const unsubscribe = subscribe(drawContainers);
    onLeave(this, unsubscribe);

    fitCamera(this);

    // こぶねを出したあとに戻ってくると、おばあちゃんが とおの あいかた を見せる（4の場面）
    if (lessonDue(getState())) {
      this.scene.launch('Lesson');
      this.scene.bringToTop('Hud');
    }
  }

  // 浮きの棚。触った浮きが持ち物に入る
  private shelf(): void {
    this.add.image(SHELF_AT.x, SHELF_AT.y, 'shelf').setOrigin(0);
    for (let n = 0; n < FLOAT_ROWS * FLOATS_PER_ROW; n += 1) {
      const x = SHELF_AT.x + FLOAT_INSET.x + (n % FLOATS_PER_ROW) * FLOAT_PITCH;
      const y = SHELF_AT.y + FLOAT_INSET.y + Math.floor(n / FLOATS_PER_ROW) * FLOAT_ROW_PITCH;
      const image = this.add.image(x, y, 'float').setOrigin(0);
      tappable(
        image,
        () => {
          if (!image.visible || getState().bag.length >= BAG_LIMIT) return;
          image.setVisible(false);
          image.disableInteractive();
          setState(pick(getState(), 'float'));
        },
        FLOAT_TAP_PAD,
      );
    }
  }

  private openPacking(target: 'crate' | 'basket'): void {
    if (this.scene.isActive('Packing')) return;
    this.scene.launch('Packing', { target });
    this.scene.bringToTop('Hud');
  }
}
