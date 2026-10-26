import Phaser from 'phaser';
import { CRATE_HEIGHT, CRATE_WIDTH, drawCrate, filledSlots } from '../art/containers';
import { emit, sayAll } from '../bus';
import { CRATE_SLOTS, newHeap, packApple, settleTally, type State, type Tally } from '../state';
import { getState, setState, subscribe } from '../store';
import { lines } from '@/story/story1';
import {
  fillTiles,
  fitCamera,
  onLeave,
  OUTER_MARGIN,
  STAGE,
  STAGE_CENTER,
  tappable,
  TILE,
} from '../view';

const WALL_ROWS = 3;
const HEAP = { x: 10, y: 54, width: 64, height: 46 };
const APPLE = 8;
// 空き箱は2列3段に積む
const CRATE_GRID = { x: 86, y: 54, pitchX: 52, pitchY: 26, perRow: 2 };
const LIT = 0xffffff;
const DESK_AT = { x: 14, y: 112 };
const LETTER_ON_DESK = { x: 32, y: 114 };
const DOOR_AT = { x: 8, y: 28 };
const LIFT = 3;
const FLASH_MS = 250;
const NUDGE = 3;
const NUDGE_MS = 120;
const MERCHANT_AT = { x: STAGE_CENTER - TILE / 2, y: 34 };
const TRUTH_CRATES = { x: 10, y: 56, pitchX: 60, pitchY: 28, perRow: 3 };
const TRUTH_LOOSE = { x: 14, y: 116, pitch: 10 };
const SHOW_MS = 300;
const FADE_MS = 700;

// 6の場面の蔵。山のりんごは触ると一瞬だけ光り、山が少し崩れる。1つずつ数えようとすると分からなくなる（ここが壁）。
// 空き箱は置いてあるだけで、促さない。箱を触って選び、山のりんごを触ると、その箱に入って山から減る。
// 机の手紙を触ると返事を書く。出せるのは1回で、商人が来て10ずつ数え直す
export class Storeroom extends Phaser.Scene {
  private selected: number | null = null;
  private stopDrawing: () => void = () => undefined;

  constructor() {
    super('Storeroom');
  }

  create(): void {
    this.selected = null;
    if (!getState().storeroom) setState({ ...getState(), storeroom: newHeap(Math.random) });

    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'floor', -OUTER_MARGIN, 0, span, STAGE + OUTER_MARGIN);
    fillTiles(this, 'wall', -OUTER_MARGIN, 0, span, WALL_ROWS * TILE);
    tappable(this.add.image(DOOR_AT.x, DOOR_AT.y, 'door').setOrigin(0), () =>
      this.scene.start('Workshop'),
    );
    this.add.image(DESK_AT.x, DESK_AT.y, 'desk').setOrigin(0);
    tappable(this.add.image(LETTER_ON_DESK.x, LETTER_ON_DESK.y, 'letter').setOrigin(0), () =>
      emit('reply', { onSend: (said) => this.count(said) }),
    );

    // 山のりんごの位置は場面に入るたびに決め直す
    const heap = Array.from({ length: getState().storeroom?.loose ?? 0 }, () =>
      this.add
        .image(
          HEAP.x + Math.random() * (HEAP.width - APPLE),
          HEAP.y + Math.random() * (HEAP.height - APPLE),
          'apple',
        )
        .setOrigin(0),
    );
    heap.forEach((apple) => {
      tappable(apple, () => this.tapHeap(apple, heap), 0);
    });

    let crates: Phaser.GameObjects.GameObject[] = [];
    const drawCrates = () => {
      crates.forEach((object) => {
        object.destroy();
      });
      const store = getState().storeroom;
      if (!store) return;
      crates = store.crates.flatMap((count, n) => {
        const x = CRATE_GRID.x + (n % CRATE_GRID.perRow) * CRATE_GRID.pitchX;
        const y =
          CRATE_GRID.y +
          Math.floor(n / CRATE_GRID.perRow) * CRATE_GRID.pitchY -
          (this.selected === n ? LIFT : 0);
        const view = drawCrate(this, x, y, filledSlots(count));
        const zone = this.add
          .zone(x, y, CRATE_WIDTH, CRATE_HEIGHT)
          .setOrigin(0)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => {
            this.selected = this.selected === n ? null : n;
            drawCrates();
          });
        return [view, zone];
      });
    };
    drawCrates();
    this.stopDrawing = subscribe(drawCrates);
    onLeave(this, () => this.stopDrawing());
    fitCamera(this);
  }

  private tapHeap(apple: Phaser.GameObjects.Image, heap: Phaser.GameObjects.Image[]): void {
    const store = getState().storeroom;
    if (!store || !apple.active) return;
    const crate = this.selected;
    if (crate !== null && (store.crates[crate] ?? CRATE_SLOTS) < CRATE_SLOTS) {
      heap.splice(heap.indexOf(apple), 1);
      apple.destroy();
      const next = packApple(store, crate);
      if ((next.crates[crate] ?? 0) >= CRATE_SLOTS) this.selected = null;
      setState({ ...getState(), storeroom: next });
      return;
    }
    // 光らせて、山を少し崩す。どれを数えたかが分からなくなる
    apple.setTint(LIT).setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(FLASH_MS, () => apple.clearTint().setTintMode(Phaser.TintModes.MULTIPLY));
    heap.forEach((other) => {
      this.tweens.add({
        targets: other,
        x: Phaser.Math.Clamp(
          other.x + Phaser.Math.Between(-NUDGE, NUDGE),
          HEAP.x,
          HEAP.x + HEAP.width - APPLE,
        ),
        y: Phaser.Math.Clamp(
          other.y + Phaser.Math.Between(-NUDGE, NUDGE),
          HEAP.y,
          HEAP.y + HEAP.height - APPLE,
        ),
        duration: NUDGE_MS,
      });
    });
  }

  // 商人が来て、全部を10ずつ箱に詰め直して見せる。合っていれば全部買い、違えばその日はおしまい
  private count(said: Tally): void {
    // 商人が数え直している間に状態が変わっても、下の箱を描き直さない
    this.stopDrawing();
    const before = getState();
    const { state, result, truth } = settleTally(before, said, Math.random);
    const newPage = state.pages.includes('tens') && !before.pages.includes('tens');

    const span = STAGE + OUTER_MARGIN * 2;
    // 蔵の中を片づけて、商人が詰め直した箱とばらだけを見せる。下の山や箱は触れなくする
    fillTiles(this, 'floor', -OUTER_MARGIN, 0, span, STAGE + OUTER_MARGIN).setInteractive();
    fillTiles(this, 'wall', -OUTER_MARGIN, 0, span, WALL_ROWS * TILE);
    this.add.image(MERCHANT_AT.x, MERCHANT_AT.y, 'merchant').setOrigin(0);

    const show = (step: number) => {
      if (step < truth.crates) {
        const x = TRUTH_CRATES.x + (step % TRUTH_CRATES.perRow) * TRUTH_CRATES.pitchX;
        const y = TRUTH_CRATES.y + Math.floor(step / TRUTH_CRATES.perRow) * TRUTH_CRATES.pitchY;
        drawCrate(this, x, y, filledSlots(CRATE_SLOTS));
      } else if (step < truth.crates + truth.loose) {
        const n = step - truth.crates;
        this.add.image(TRUTH_LOOSE.x + n * TRUTH_LOOSE.pitch, TRUTH_LOOSE.y, 'apple').setOrigin(0);
      } else {
        this.after(state, result === 'thanks', newPage);
        return;
      }
      this.time.delayedCall(SHOW_MS, () => show(step + 1));
    };
    sayAll([lines.tallyCome], () => show(0));
  }

  private after(state: State, right: boolean, newPage: boolean): void {
    if (right) {
      sayAll([lines.tallyThanks], () => {
        setState(state);
        if (!newPage) {
          this.scene.start('Workshop');
          return;
        }
        sayAll([lines.tokaThink, lines.tokaWrite], () =>
          emit('notebook', { onClose: () => this.scene.start('Workshop') }),
        );
      });
      return;
    }
    sayAll([lines.tallyMiss, lines.tallyTomorrow], () => {
      setState(state);
      const camera = this.cameras.main;
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
        this.scene.start('Workshop'),
      );
      camera.fadeOut(FADE_MS);
    });
  }
}
