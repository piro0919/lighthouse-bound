import Phaser from 'phaser';
import { BAG_LIMIT, pick, type Item } from '../state';
import { getState, setState } from '../store';
import { exitSign, fillTiles, fitCamera, OUTER_MARGIN, STAGE, tappable } from '../view';

type Spot = { item: Item; x: number; y: number };

const TREE_SCALE = 2;
// 持ち物の欄（Hud）は横長の画面だと場面の下端に重なるので、下から 48 より上に置く（CLAUDE.md の Design rules）
const EXIT_AT = { x: 8, y: 120 };

// 実のなる位置。木（sprites.ts の tree）を2倍にした絵の葉の上に置く
function treeFruits(item: Item, left: number, top: number): Spot[] {
  const offsets = [
    { x: 14, y: 8 },
    { x: 30, y: 6 },
    { x: 44, y: 12 },
    { x: 10, y: 22 },
    { x: 24, y: 18 },
    { x: 38, y: 22 },
    { x: 50, y: 26 },
    { x: 16, y: 34 },
    { x: 30, y: 32 },
    { x: 44, y: 36 },
    { x: 22, y: 44 },
    { x: 36, y: 46 },
  ];
  return offsets.map(({ x, y }) => ({ item, x: left + x, y: top + y }));
}

const ORCHARD_TREES = [
  { x: 12, y: 40, item: 'apple' as const },
  { x: 108, y: 48, item: 'mandarin' as const },
];

const BEACH_SPOTS: Spot[] = [
  { item: 'shell', x: 40, y: 36 },
  { item: 'shell', x: 84, y: 32 },
  { item: 'shell', x: 128, y: 40 },
  { item: 'shell', x: 164, y: 30 },
  { item: 'shell', x: 60, y: 70 },
  { item: 'shell', x: 150, y: 72 },
  { item: 'seaweed', x: 24, y: 96 },
  { item: 'seaweed', x: 70, y: 104 },
  { item: 'seaweed', x: 108, y: 88 },
  { item: 'seaweed', x: 160, y: 104 },
  { item: 'seaweed', x: 120, y: 118 },
  { item: 'seaweed', x: 44, y: 124 },
];

// 採る場所に共通の形。触ったものが持ち物（Hud）に入る。場面に入り直すと、また実っている
abstract class Gathering extends Phaser.Scene {
  protected abstract ground: string;
  protected abstract exitTo: 'orchard' | 'beach';
  protected abstract decorate(): void;
  protected abstract spots(): Spot[];

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, this.ground, -OUTER_MARGIN, -OUTER_MARGIN, span, span);
    this.decorate();
    this.spots().forEach(({ item, x, y }) => {
      const image = this.add.image(x, y, item).setOrigin(0);
      tappable(image, () => {
        if (!image.visible || getState().bag.length >= BAG_LIMIT) return;
        image.setVisible(false);
        image.disableInteractive();
        setState(pick(getState(), item));
      });
    });
    exitSign(this, EXIT_AT, () => this.scene.start('Town', { from: this.exitTo }));
    fitCamera(this);
  }
}

export class Orchard extends Gathering {
  protected ground = 'grass';
  protected exitTo = 'orchard' as const;

  constructor() {
    super('Orchard');
  }

  protected decorate(): void {
    ORCHARD_TREES.forEach(({ x, y }) =>
      this.add.image(x, y, 'tree').setOrigin(0).setScale(TREE_SCALE),
    );
  }

  protected spots(): Spot[] {
    return ORCHARD_TREES.flatMap(({ x, y, item }) => treeFruits(item, x, y));
  }
}

export class Beach extends Gathering {
  protected ground = 'sand';
  protected exitTo = 'beach' as const;

  constructor() {
    super('Beach');
  }

  protected decorate(): void {
    fillTiles(
      this,
      'water',
      -OUTER_MARGIN,
      -OUTER_MARGIN,
      STAGE + OUTER_MARGIN * 2,
      OUTER_MARGIN + 24,
    );
  }

  protected spots(): Spot[] {
    return BEACH_SPOTS;
  }
}
