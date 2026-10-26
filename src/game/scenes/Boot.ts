import Phaser from 'phaser';
import { makeTextures } from '../art/sprites';

// 絵をコードで描いてから、工房で始める。持ち物の欄（Hud）はずっと上に重ねておく
export class Boot extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    makeTextures(this);
    this.scene.launch('Hud');
    this.scene.start('Workshop');
  }
}
