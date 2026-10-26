// 仮のドット絵。本番の絵ができるまで、動きを確かめるためにコードで描いている。
// トウカの見た目は CLAUDE.md の Story 1（栗色の髪、琥珀の目、ランタンの髪留め、紺の服に大きすぎるエプロン）に合わせた
import type Phaser from 'phaser';

const palette: Record<string, number> = {
  k: 0x2b1d14,
  h: 0x8a4b2a,
  H: 0xa9653a,
  s: 0xf2c7a0,
  S: 0xd9a07a,
  n: 0x2c3e6b,
  N: 0x1f2c4d,
  a: 0xefe6d2,
  A: 0xcfc3a8,
  l: 0xf2c14e,
  w: 0xffffff,
  r: 0xd8432f,
  R: 0x9e2b1f,
  o: 0xf39a1e,
  O: 0xc66f0c,
  g: 0x4f9a3a,
  G: 0x2f6b2a,
  b: 0x9a6a3c,
  B: 0x6b4524,
  q: 0xf3b8b0,
  v: 0x3d7a4a,
  i: 0xfbf6e6,
  I: 0xc9bfa5,
  f: 0x2a2a2a,
  j: 0x3a9d8f,
  t: 0x4a6b3a,
  T: 0x5a3a2a,
};

const grids: Record<string, string[]> = {
  hero: [
    '................',
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khHhhhhhhk...',
    '...khhhhhhhlk...',
    '...khsssssshk...',
    '...khsksskshk...',
    '...khsssSsshk...',
    '....kssssssk....',
    '....knaaaank....',
    '...knnaaaannk...',
    '..ksknaaaanksk..',
    '..ksknaAaanksk..',
    '...knaaaaaank...',
    '...kNNnnnnNNk...',
    '....kSk..kSk....',
  ],
  hero2: [
    '................',
    '.....kkkkkk.....',
    '....khhhhhhk....',
    '...khHhhhhhhk...',
    '...khhhhhhhlk...',
    '...khsssssshk...',
    '...khsksskshk...',
    '...khsssSsshk...',
    '....kssssssk....',
    '....knaaaank....',
    '...knnaaaannk...',
    '..ksknaaaanksk..',
    '..ksknaAaanksk..',
    '...knaaaaaank...',
    '...kNNnnnnNNk...',
    '....kSk...kSk...',
  ],
  child: [
    '................',
    '................',
    '.....kkkkkk.....',
    '....kffffffk....',
    '...kffffffffk...',
    '...kfssssssfk...',
    '...kfskssksfk...',
    '...kfsssSssfk...',
    '....kssssssk....',
    '....kjjjjjjk....',
    '...kjjjjjjjjk...',
    '..kskjjjjjjksk..',
    '..kskjjjjjjksk..',
    '...kjjjjjjjjk...',
    '...kBBBBBBBBk...',
    '....kSk..kSk....',
  ],
  merchant: [
    '................',
    '....kkkkkkkk....',
    '...kTTTTTTTTk...',
    '..kTTTTTTTTTTk..',
    '...kbbbbbbbbk...',
    '...kbssssssbk...',
    '...kbskssksbk...',
    '...kbsssSssbk...',
    '....kssssssk....',
    '....ktwwwwtk....',
    '...kttwwwwttk...',
    '..kskttwwttksk..',
    '..kskttttttksk..',
    '...kttttttttk...',
    '...kNNNNNNNNk...',
    '....kBk..kBk....',
  ],
  apple: [
    '...kG...',
    '..kGk...',
    '.krrrrk.',
    'krrwrrRk',
    'krrrrrRk',
    'krrrrRRk',
    '.kRRRRk.',
    '..kkkk..',
  ],
  mandarin: [
    '...kg...',
    '..kook..',
    '.kooook.',
    'kowooook',
    'koooooOk',
    'kooooOOk',
    '.kOOOOk.',
    '..kkkk..',
  ],
  shell: [
    '........',
    '...kk...',
    '..kqqk..',
    '.kqwqqk.',
    'kqqqqqqk',
    'kqkqkqqk',
    '.kkkkkk.',
    '........',
  ],
  seaweed: [
    '...v....',
    '..vv.v..',
    '..v.vv..',
    '.vv.v...',
    '.v..vv..',
    '.vv..v..',
    '..v.vv..',
    '..vvv...',
  ],
  letter: [
    'kkkkkkkkkkkk',
    'kiiiiiiiiiik',
    'kIiiiiiiiiIk',
    'kiIiiiiiiIik',
    'kiiIiiiiIiik',
    'kiiiIIIIiiik',
    'kiiiiiiiiiik',
    'kiiiiiiiiiik',
    'kkkkkkkkkkkk',
  ],
  basket: [
    '....kkkkkkkk....',
    '...kb......bk...',
    '..kb........bk..',
    '..kb........bk..',
    'kkkkkkkkkkkkkkkk',
    'kbBbBbBbBbBbBbBk',
    'kBbBbBbBbBbBbBbk',
    'kbBbBbBbBbBbBbBk',
    '.kBbBbBbBbBbBbk.',
    '.kbBbBbBbBbBbBk.',
    '..kBbBbBbBbBbk..',
    '...kkkkkkkkkk...',
  ],
};

function drawGrid(scene: Phaser.Scene, key: string, grid: string[]): void {
  const g = scene.add.graphics();
  grid.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const color = palette[ch];
      if (color === undefined) return;
      g.fillStyle(color);
      g.fillRect(x, y, 1, 1);
    });
  });
  g.generateTexture(key, grid[0].length, grid.length);
  g.destroy();
}

// 同じ乱れ方を毎回出すための簡単な乱数
function noise(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function tile(scene: Phaser.Scene, key: string, base: number, dots: number, seed: number): void {
  const g = scene.add.graphics();
  g.fillStyle(base);
  g.fillRect(0, 0, 16, 16);
  const rnd = noise(seed);
  g.fillStyle(dots);
  for (let n = 0; n < 10; n += 1) g.fillRect(Math.floor(rnd() * 16), Math.floor(rnd() * 16), 1, 1);
  g.generateTexture(key, 16, 16);
  g.destroy();
}

function floor(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0xb98a57);
  g.fillRect(0, 0, 16, 16);
  g.fillStyle(0x9a6f42);
  g.fillRect(0, 7, 16, 1);
  g.fillRect(0, 15, 16, 1);
  g.fillRect(5, 0, 1, 7);
  g.fillRect(11, 8, 1, 7);
  g.generateTexture('floor', 16, 16);
  g.destroy();
}

function wall(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0xf3e7cf);
  g.fillRect(0, 0, 16, 16);
  g.fillStyle(0xd8c7a6);
  g.fillRect(0, 12, 16, 4);
  g.fillStyle(0x6b4524);
  g.fillRect(0, 15, 16, 1);
  g.generateTexture('wall', 16, 16);
  g.destroy();
}

// 5つずつ2列の仕切り箱。仕切りの穴は 8×8 で、間隔は 10
function crate(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  const w = 2 + 5 * 10;
  const h = 2 + 2 * 10;
  g.fillStyle(0x2b1d14);
  g.fillRect(0, 0, w, h);
  g.fillStyle(0x9a6a3c);
  g.fillRect(1, 1, w - 2, h - 2);
  g.fillStyle(0x5a3a1e);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 5; col += 1) g.fillRect(2 + col * 10, 2 + row * 10, 8, 8);
  }
  g.generateTexture('crate', w, h);
  g.destroy();
}

function tree(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x6b4524);
  g.fillRect(13, 22, 6, 10);
  g.fillStyle(0x2b1d14);
  g.fillCircle(16, 13, 13);
  g.fillStyle(0x2f6b2a);
  g.fillCircle(16, 13, 12);
  g.fillStyle(0x4f9a3a);
  g.fillCircle(14, 11, 9);
  g.generateTexture('tree', 32, 32);
  g.destroy();
}

function desk(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x2b1d14);
  g.fillRect(0, 0, 48, 20);
  g.fillStyle(0x9a6a3c);
  g.fillRect(1, 1, 46, 12);
  g.fillStyle(0x6b4524);
  g.fillRect(1, 13, 46, 2);
  g.fillRect(3, 15, 3, 5);
  g.fillRect(42, 15, 3, 5);
  g.generateTexture('desk', 48, 20);
  g.destroy();
}

function plate(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x2b1d14);
  g.fillEllipse(8, 4, 16, 8);
  g.fillStyle(0xffffff);
  g.fillEllipse(8, 4, 14, 6);
  g.fillStyle(0xdfe6ea);
  g.fillEllipse(8, 4, 8, 3);
  g.generateTexture('plate', 16, 8);
  g.destroy();
}

function door(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x2b1d14);
  g.fillRect(0, 0, 16, 20);
  g.fillStyle(0x7a4f2c);
  g.fillRect(1, 1, 14, 19);
  g.fillStyle(0xf2c14e);
  g.fillRect(11, 10, 2, 2);
  g.generateTexture('door', 16, 20);
  g.destroy();
}

function house(scene: Phaser.Scene, key: string, w: number, h: number, roof: number): void {
  const g = scene.add.graphics();
  const roofH = Math.floor(h * 0.45);
  g.fillStyle(0x2b1d14);
  g.fillRect(0, roofH - 1, w, h - roofH + 1);
  g.fillStyle(0xf3e7cf);
  g.fillRect(1, roofH, w - 2, h - roofH - 1);
  g.fillStyle(0x2b1d14);
  g.fillTriangle(-1, roofH, w / 2, 0, w + 1, roofH);
  g.fillStyle(roof);
  g.fillTriangle(2, roofH - 1, w / 2, 2, w - 2, roofH - 1);
  g.fillStyle(0x7a4f2c);
  g.fillRect(w / 2 - 5, h - 14, 10, 13);
  g.fillStyle(0x8fc3e6);
  g.fillRect(4, roofH + 4, 8, 6);
  g.fillRect(w - 12, roofH + 4, 8, 6);
  g.generateTexture(key, w, h);
  g.destroy();
}

function lighthouse(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x6b7177);
  g.fillRect(2, 38, 20, 6);
  g.fillStyle(0x2b1d14);
  g.fillRect(6, 8, 12, 31);
  g.fillStyle(0xffffff);
  g.fillRect(7, 9, 10, 29);
  g.fillStyle(0xd8432f);
  g.fillRect(7, 16, 10, 5);
  g.fillRect(7, 28, 10, 5);
  g.fillStyle(0x2b1d14);
  g.fillRect(5, 3, 14, 6);
  g.fillStyle(0xf2c14e);
  g.fillRect(7, 4, 10, 4);
  g.fillStyle(0xd8432f);
  g.fillTriangle(5, 3, 12, 0, 19, 3);
  g.generateTexture('lighthouse', 24, 44);
  g.destroy();
}

function signpost(scene: Phaser.Scene): void {
  const g = scene.add.graphics();
  g.fillStyle(0x6b4524);
  g.fillRect(7, 8, 3, 10);
  g.fillStyle(0x2b1d14);
  g.fillRect(0, 0, 18, 11);
  g.fillStyle(0xd7b98a);
  g.fillRect(1, 1, 16, 9);
  g.generateTexture('sign', 18, 18);
  g.destroy();
}

export function makeTextures(scene: Phaser.Scene): void {
  Object.entries(grids).forEach(([key, grid]) => drawGrid(scene, key, grid));
  tile(scene, 'grass', 0x79b84d, 0x5e9a3c, 1);
  tile(scene, 'path', 0xd7b98a, 0xbf9d6c, 2);
  tile(scene, 'sand', 0xe8d39a, 0xcdb57a, 3);
  tile(scene, 'water', 0x4a90c8, 0x7fb6e0, 4);
  floor(scene);
  wall(scene);
  crate(scene);
  tree(scene);
  desk(scene);
  plate(scene);
  door(scene);
  house(scene, 'workshop', 56, 52, 0x4a6b8a);
  house(scene, 'fisherHouse', 44, 44, 0xb5523b);
  house(scene, 'shop', 52, 46, 0x4f9a3a);
  lighthouse(scene);
  signpost(scene);
}
