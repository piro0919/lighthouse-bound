import Phaser from 'phaser';
import { drawBasket, drawCrate } from '../art/containers';
import { emit } from '../bus';
import { lessonDue } from '../state';
import { getState, subscribe } from '../store';
import { fillTiles, fitCamera, onLeave, OUTER_MARGIN, STAGE, tappable, TILE } from '../view';

const WALL_ROWS = 3;
const DESK = { x: 28, y: 76 };
const LETTERS = [
  { id: 'fisher', x: 34, y: 78 },
  { id: 'merchant', x: 54, y: 80 },
] as const;
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
    LETTERS.forEach(({ id, x, y }) => {
      tappable(this.add.image(x, y, 'letter').setOrigin(0), () => emit('letter', id));
    });

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

  private openPacking(target: 'crate' | 'basket'): void {
    if (this.scene.isActive('Packing')) return;
    this.scene.launch('Packing', { target });
    this.scene.bringToTop('Hud');
  }
}
