import Phaser from 'phaser';
import { Beach, Orchard } from './scenes/Gathering';
import { Boot } from './scenes/Boot';
import { Fill } from './scenes/Fill';
import { Gate } from './scenes/Gate';
import { Hud } from './scenes/Hud';
import { Lesson } from './scenes/Lesson';
import { Packing } from './scenes/Packing';
import { Plates } from './scenes/Plates';
import { Town } from './scenes/Town';
import { Workshop } from './scenes/Workshop';

export function startGame(parent: HTMLElement): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    pixelArt: true,
    backgroundColor: '#2b1d14',
    scale: { mode: Phaser.Scale.RESIZE, width: '100%', height: '100%' },
    scene: [Boot, Workshop, Town, Orchard, Beach, Gate, Packing, Plates, Fill, Lesson, Hud],
  });
}
