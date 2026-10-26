import Phaser from 'phaser';
import { keepImages } from '../art/images';
import { makeTextures } from '../art/sprites';
import { ITEMS } from '../state';
import { restore } from '../store';

// 絵をコードで描き、保存した進み具合を読み戻してから、工房で始める。持ち物の欄（Hud）はずっと上に重ねておく。
// 途中の場面には戻さない。工房に入れば、4の場面と7の場面は状態から始まる
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    makeTextures(this);
    keepImages(this, [...ITEMS, 'notebook']);
    restore();
    this.scene.launch('Hud');
    this.scene.start('Workshop');
  }
}
