import Phaser from 'phaser';

export const TILE = 16;
// どの場面も、この大きさの正方形が画面の短い辺に収まるように拡大する。拡大は整数倍にして、ドットを崩さない
export const STAGE = 192;
export const STAGE_CENTER = STAGE / 2;

export function fitZoom(width: number, height: number): number {
  return Math.max(1, Math.floor(Math.min(width, height) / STAGE));
}

// 場面を離れるときの後始末。場面を替えたとき（shutdown）だけでなく、ゲームごと壊したとき（destroy）にも1回だけ走らせる
export function onLeave(scene: Phaser.Scene, cleanup: () => void): void {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    cleanup();
  };
  scene.events.once('shutdown', run);
  scene.events.once('destroy', run);
}

// 画面の大きさが変わるたびに拡大し直す。center を渡すと、その点を画面の中心に合わせる（町はトウカを追うので渡さない）
export function fitCamera(
  scene: Phaser.Scene,
  center: { x: number; y: number } | null = { x: STAGE_CENTER, y: STAGE_CENTER },
): void {
  const apply = () => {
    const camera = scene.cameras.main;
    camera.setZoom(fitZoom(scene.scale.width, scene.scale.height));
    if (center) camera.centerOn(center.x, center.y);
  };
  apply();
  scene.scale.on('resize', apply);
  onLeave(scene, () => scene.scale.off('resize', apply));
}

// 床や草のように、同じ模様を敷き詰める
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
