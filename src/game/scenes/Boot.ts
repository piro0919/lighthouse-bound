import Phaser from 'phaser';
import { keepImages } from '../art/images';
import { makeTextures } from '../art/sprites';
import { ITEMS } from '../state';

// 絵をコードで描いてから、工房で始める。持ち物の欄（Hud）はずっと上に重ねておく
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    makeTextures(this);
    keepImages(this, [...ITEMS, 'notebook']);
    this.scene.launch('Hud');
    this.scene.start('Workshop');
  }
}
