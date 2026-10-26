import Phaser from 'phaser';

export const TILE = 16;
// どの場面も、この大きさの正方形が画面の短い辺に収まるように拡大する。拡大は整数倍にして、ドットを崩さない
export const STAGE = 192;
export const STAGE_CENTER = STAGE / 2;

export function fitZoom(width: number, height: number): number {
  return Math.max(1, Math.floor(Math.min(width, height) / STAGE));
}

// 画面の大きさが変わるたびに拡大し直し、場面の中心を画面の中心に合わせる
export function fitCamera(
  scene: Phaser.Scene,
  centerX = STAGE_CENTER,
  centerY = STAGE_CENTER,
): void {
  const apply = () => {
    const camera = scene.cameras.main;
    camera.setZoom(fitZoom(scene.scale.width, scene.scale.height));
    camera.centerOn(centerX, centerY);
  };
  apply();
  scene.scale.on('resize', apply);
  scene.events.once('shutdown', () => scene.scale.off('resize', apply));
}

// 床や草のように、画面の外まで同じ模様を敷く。広い画面でも端が切れないよう、場面の外側にも余分に敷く
export function fillTiles(
  scene: Phaser.Scene,
  key: string,
  x: number,
  y: number,
  width: number,
  height: number,
): Phaser.GameObjects.TileSprite {
  return scene.add.tileSprite(x, y, width, height, key).setOrigin(0);
}

const OUTER_STAGES = 3;
export const OUTER_MARGIN = STAGE * OUTER_STAGES;

const TAP_PAD = 4;

// 小さな絵でも子どもの指で触れるよう、触れる範囲を絵より広げる
export function tappable<T extends Phaser.GameObjects.Image | Phaser.GameObjects.Sprite>(
  object: T,
  onTap: () => void,
  pad = TAP_PAD,
): T {
  const { width, height } = object.frame;
  object.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(-pad, -pad, width + pad * 2, height + pad * 2),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });
  object.on('pointerdown', onTap);
  return object;
}
