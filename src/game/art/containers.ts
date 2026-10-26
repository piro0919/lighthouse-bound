import type Phaser from 'phaser';
import type { Item } from '../state';

// 仕切り箱の穴の位置。絵（sprites.ts の crate）と同じく、縁が 2、間隔が 10
export const CRATE_COLS = 5;
export const CRATE_ROWS = 2;
export const SLOT_EDGE = 2;
export const SLOT_PITCH = 10;
export const SLOT_HOLE = 8;
export const CRATE_WIDTH = SLOT_EDGE + CRATE_COLS * SLOT_PITCH;
export const CRATE_HEIGHT = SLOT_EDGE + CRATE_ROWS * SLOT_PITCH;
// かごの絵（sprites.ts の basket）の幅
export const BASKET_WIDTH = 16;
const BASKET_ITEM_PITCH = 4;
const BASKET_PER_ROW = 3;
const BASKET_ROW_PITCH = 5;
const BASKET_INSET = 1;

export function slotPosition(slot: number): { x: number; y: number } {
  return {
    x: SLOT_EDGE + (slot % CRATE_COLS) * SLOT_PITCH,
    y: SLOT_EDGE + Math.floor(slot / CRATE_COLS) * SLOT_PITCH,
  };
}

// 箱の中身を穴の上に1つずつ置く。何が入っていて、どこが空いているかがいつも見える
export function drawCrate(
  scene: Phaser.Scene,
  x: number,
  y: number,
  crate: readonly (Item | null)[],
  onSlotTap?: (slot: number) => void,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  container.add(scene.add.image(0, 0, 'crate').setOrigin(0));
  crate.forEach((item, slot) => {
    if (!item) return;
    const { x: sx, y: sy } = slotPosition(slot);
    const image = scene.add.image(sx, sy, item).setOrigin(0);
    if (onSlotTap) {
      image.setInteractive({ useHandCursor: true });
      image.on('pointerdown', () => onSlotTap(slot));
    }
    container.add(image);
  });
  return container;
}

// かごの中身は、かごの口から少しはみ出す形で並べる
export function drawBasket(
  scene: Phaser.Scene,
  x: number,
  y: number,
  basket: readonly Item[],
  onItemTap?: (index: number) => void,
): Phaser.GameObjects.Container {
  const container = scene.add.container(x, y);
  basket.forEach((item, index) => {
    const ix = BASKET_INSET + (index % BASKET_PER_ROW) * BASKET_ITEM_PITCH;
    const iy = -Math.floor(index / BASKET_PER_ROW) * BASKET_ROW_PITCH;
    const image = scene.add.image(ix, iy, item).setOrigin(0);
    if (onItemTap) {
      image.setInteractive({ useHandCursor: true });
      image.on('pointerdown', () => onItemTap(index));
    }
    container.add(image);
  });
  container.add(scene.add.image(-SLOT_EDGE, 0, 'basket').setOrigin(0));
  return container;
}
