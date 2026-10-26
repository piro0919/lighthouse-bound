import Phaser from 'phaser';
import { drop, type State } from '../state';
import { getState, setState, subscribe } from '../store';
import { fitZoom, onLeave } from '../view';

// 子どもの指で触れる大きさにするため、持ち物の絵は2倍で出す
const ICON_SCALE = 2;
const ITEM_SIZE = 8;
const ICON = ITEM_SIZE * ICON_SCALE;
const PANEL_COLOR = 0x2b1d14;
const GAP = 2;
const PER_ROW = 10;
const PAD = 4;
const PANEL_ALPHA = 0.55;

// 持ち物を触ったときの動き。ふだんは捨てる。箱やかごに詰めている間は、詰める場面が差し替える
let onBagTap: (index: number) => void = (index) => setState(drop(getState(), index));

export function setBagTap(handler: ((index: number) => void) | null): void {
  onBagTap = handler ?? ((index) => setState(drop(getState(), index)));
}

// 持ち物はいつも画面の下に見えていて、何をいくつ持っているかを数字を使わずに追える
export class Hud extends Phaser.Scene {
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super('Hud');
  }

  create(): void {
    this.layer = this.add.container(0, 0);
    const unsubscribe = subscribe((state) => this.draw(state));
    const redraw = () => this.draw(getState());
    this.scale.on('resize', redraw);
    onLeave(this, () => {
      unsubscribe();
      this.scale.off('resize', redraw);
    });
    redraw();
  }

  private draw(state: State): void {
    const zoom = fitZoom(this.scale.width, this.scale.height);
    const camera = this.cameras.main;
    camera.setZoom(zoom);
    camera.setOrigin(0, 0);
    camera.setScroll(0, 0);
    const viewH = this.scale.height / zoom;
    this.layer.removeAll(true);
    if (state.bag.length === 0) return;

    const rows = Math.ceil(state.bag.length / PER_ROW);
    const cols = Math.min(state.bag.length, PER_ROW);
    const width = cols * (ICON + GAP) - GAP + PAD * 2;
    const height = rows * (ICON + GAP) - GAP + PAD * 2;
    const top = viewH - height - PAD;
    this.layer.add(
      this.add.rectangle(PAD, top, width, height, PANEL_COLOR, PANEL_ALPHA).setOrigin(0),
    );
    state.bag.forEach((item, index) => {
      const x = PAD * 2 + (index % PER_ROW) * (ICON + GAP);
      const y = top + PAD + Math.floor(index / PER_ROW) * (ICON + GAP);
      const icon = this.add
        .image(x, y, item)
        .setOrigin(0)
        .setScale(ICON_SCALE)
        .setInteractive({ useHandCursor: true });
      icon.on('pointerdown', () => onBagTap(index));
      this.layer.add(icon);
    });
  }
}
