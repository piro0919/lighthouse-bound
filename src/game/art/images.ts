import type Phaser from 'phaser';

// 台詞や手帳（React の画面）にも同じ絵を出すため、Phaser で描いた絵を画像の URL にして持っておく
const urls = new Map<string, string>();

export function keepImages(scene: Phaser.Scene, keys: readonly string[]): void {
  keys.forEach((key) => {
    urls.set(key, scene.textures.getBase64(key));
  });
}

export function imageUrl(key: string): string | undefined {
  return urls.get(key);
}
