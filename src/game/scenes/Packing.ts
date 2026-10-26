import Phaser from 'phaser';
import { drawBasket, drawCrate } from '../art/containers';
import { bagToBasket, bagToCrate, basketToBag, crateToBag } from '../state';
import { getState, setState, subscribe } from '../store';
import { fitCamera, OUTER_MARGIN, STAGE, STAGE_CENTER } from '../view';
import { setBagTap } from './Hud';

type Target = 'crate' | 'basket';

const DIM_ALPHA = 0.6;
// 詰めている間は、箱とかごを大きく出して中身を触りやすくする
const ZOOM_UP = 2;
const CRATE_WIDTH = 52;
const BASKET_WIDTH = 16;
const CONTENT_Y = 48;

// 箱かごを開いて詰める画面。持ち物（Hud）を触ると中へ入り、中のものを触ると持ち物へ戻る
export class Packing extends Phaser.Scene {
  private target: Target = 'crate';

  constructor() {
    super('Packing');
  }

  init(data: { target: Target }): void {
    this.target = data.target;
  }

  create(): void {
    const span = STAGE + OUTER_MARGIN * 2;
    this.add
      .rectangle(-OUTER_MARGIN, -OUTER_MARGIN, span, span, 0x000000, DIM_ALPHA)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', () => this.close());

    const width = (this.target === 'crate' ? CRATE_WIDTH : BASKET_WIDTH) * ZOOM_UP;
    const x = STAGE_CENTER - width / 2;
    let view: Phaser.GameObjects.Container | null = null;
    const draw = () => {
      view?.destroy();
      const state = getState();
      view =
        this.target === 'crate'
          ? drawCrate(this, x, CONTENT_Y, state.crate, (slot) =>
              setState(crateToBag(getState(), slot)),
            )
          : drawBasket(this, x, CONTENT_Y, state.basket, (index) =>
              setState(basketToBag(getState(), index)),
            );
      view.setScale(ZOOM_UP);
    };
    draw();
    const unsubscribe = subscribe(draw);

    setBagTap((index) =>
      setState(
        this.target === 'crate' ? bagToCrate(getState(), index) : bagToBasket(getState(), index),
      ),
    );
    this.input.keyboard?.on('keydown-ESC', () => this.close());

    this.events.once('shutdown', () => {
      unsubscribe();
      setBagTap(null);
    });
    fitCamera(this);
  }

  private close(): void {
    this.scene.stop();
  }
}
