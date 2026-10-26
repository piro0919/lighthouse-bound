import Phaser from 'phaser';
import { BASKET_WIDTH, CRATE_WIDTH, drawBasket, drawCrate, slotPosition } from '../art/containers';
import { sayAll } from '../bus';
import {
  boardCrossing,
  CRATE_SLOTS,
  CROSSING_ABOARD,
  deliverFloats,
  NET_FLOATS,
  SAILOR_HAS,
  sendFerry,
  type FillResult,
  type State,
} from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { fillTiles, fitCamera, OUTER_MARGIN, STAGE, STAGE_CENTER } from '../view';

const BOARD_SCALE = 3;
const BASKET_SCALE = 2;
const ROW_SCALE = 2;
const ROW_PITCH = 18;
const BOARD_AT = { x: STAGE_CENTER - (CRATE_WIDTH * BOARD_SCALE) / 2, y: 36 };
const SOURCE_Y = 120;
const SPEAKER_AT = { x: 150, y: 10 };
const DECK = { y: 28, height: 76 };
const MOVE_MS = 350;
const PAUSE_MS = 150;
const LINE_DELAY_MS = 500;
const FADE_MS = 700;
// 入りきらないものは、板の上まで跳ねてから元へ戻る
const BOUNCE_HEIGHT = 12;
const BOUNCE_Y = BOARD_AT.y - BOUNCE_HEIGHT;
const TOP_CENTER = { x: 0.5, y: 0 };

export type Job = 'sailor' | 'crossing' | 'net';

type Spec = {
  board: string;
  item: string;
  has: number;
  speaker: string;
  deck: boolean;
  // かごで運ぶもの（りんご、浮き）と、自分で歩いて乗る人
  source: 'basket' | 'row';
  send: (state: State, carried: number) => { state: State; result: FillResult };
  lines: Record<FillResult | 'back', string>;
  from: 'pier' | 'gate' | 'net';
};

const SPECS: Record<Job, Spec> = {
  sailor: {
    board: 'crate',
    item: 'apple',
    has: SAILOR_HAS,
    speaker: 'sailor',
    deck: true,
    source: 'basket',
    send: (state) => sendFerry(state),
    lines: {
      thanks: lines.sailorThanks,
      over: lines.sailorOver,
      short: lines.sailorShort,
      back: lines.sailorReturn,
    },
    from: 'pier',
  },
  crossing: {
    board: 'seats',
    item: 'rider',
    has: CROSSING_ABOARD,
    speaker: 'ferryman',
    deck: true,
    source: 'row',
    send: boardCrossing,
    lines: {
      thanks: lines.crossingThanks,
      over: lines.crossingOver,
      short: lines.crossingShort,
      back: lines.crossingReturn,
    },
    from: 'gate',
  },
  net: {
    board: 'net',
    item: 'float',
    has: NET_FLOATS,
    speaker: 'netFisher',
    deck: false,
    source: 'basket',
    send: (state) => deliverFloats(state),
    lines: {
      thanks: lines.netThanks,
      over: lines.netOver,
      short: lines.netShort,
      back: lines.netReturn,
    },
    from: 'net',
  },
};

// 見えないところに いくつか入っている10の入れ物へ、運んだものを1つずつ入れる（3の場面と5の場面）。
// 入れ物は、どれも船の箱と同じ5つずつ2列で見せる。
// 余れば元へ跳ね戻り、足りなければ穴が空いたまま見える。失敗の形が、そのまま答えの形になる
export class Fill extends Phaser.Scene {
  private job: Job = 'sailor';
  private carried = 0;

  constructor() {
    super('Fill');
  }

  // carried は、かごで運ぶなら中身の数。渡し舟なら札を渡した人の数
  init(data: { job: Job; carried?: number }): void {
    this.job = data.job;
    this.carried = data.carried ?? getState().basket.length;
  }

  create(): void {
    const spec = SPECS[this.job];
    const carried = this.carried;
    const span = STAGE + OUTER_MARGIN * 2;
    fillTiles(this, 'water', -OUTER_MARGIN, -OUTER_MARGIN, span, span);
    if (spec.deck) fillTiles(this, 'pier', -OUTER_MARGIN, DECK.y, span, DECK.height);
    this.add.image(SPEAKER_AT.x, SPEAKER_AT.y, spec.speaker).setOrigin(0);

    const { state, result } = spec.send(getState(), carried);
    setState(state);

    const already = Array.from({ length: CRATE_SLOTS }, (_, slot): string | null =>
      slot < spec.has ? spec.item : null,
    );
    drawCrate(this, BOARD_AT.x, BOARD_AT.y, already, undefined, spec.board).setScale(BOARD_SCALE);

    // 元に残っているのは、まだ運んでいないものと、入りきらずに戻ってきたもの
    let waiting = carried;
    let returned = 0;
    let sourceView: Phaser.GameObjects.Container | null = null;
    const showSource = () => {
      sourceView?.destroy();
      const count = waiting + returned;
      if (spec.source === 'basket') {
        const x = STAGE_CENTER - (BASKET_WIDTH * BASKET_SCALE) / 2;
        sourceView = drawBasket(this, x, SOURCE_Y, Array<string>(count).fill(spec.item)).setScale(
          BASKET_SCALE,
        );
        return;
      }
      const left = STAGE_CENTER - ((count - 1) * ROW_PITCH) / 2;
      sourceView = this.add.container(0, SOURCE_Y);
      for (let n = 0; n < count; n += 1) {
        sourceView.add(
          this.add
            .image(left + n * ROW_PITCH, 0, spec.item)
            .setOrigin(TOP_CENTER.x, TOP_CENTER.y)
            .setScale(ROW_SCALE),
        );
      }
    };
    showSource();

    const home = { x: STAGE_CENTER, y: SOURCE_Y };
    const inSlots: Phaser.GameObjects.Image[] = [];
    const move = (
      thing: Phaser.GameObjects.Image,
      to: { x: number; y: number },
      then: () => void,
    ) =>
      this.tweens.add({
        targets: thing,
        x: to.x,
        y: to.y,
        duration: MOVE_MS,
        onComplete: () => this.time.delayedCall(PAUSE_MS, then),
      });

    const endDay = () => {
      const camera = this.cameras.main;
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
        this.scene.start('Workshop'),
      );
      camera.fadeOut(FADE_MS);
    };

    // うまくいかなかったときは、入れたものも全部元へ戻り、その日はおしまいになる
    const giveBack = () => {
      const thing = inSlots.pop();
      if (!thing) {
        sayAll([spec.lines.back], endDay);
        return;
      }
      move(thing, home, () => {
        thing.destroy();
        returned += 1;
        showSource();
        giveBack();
      });
    };

    const finish = () => {
      if (result === 'thanks') {
        sayAll([spec.lines.thanks], () => this.scene.start('Town', { from: spec.from }));
        return;
      }
      sayAll([spec.lines[result]], giveBack);
    };

    const carry = () => {
      if (waiting === 0) {
        this.time.delayedCall(LINE_DELAY_MS, finish);
        return;
      }
      waiting -= 1;
      showSource();
      const thing = this.add.image(home.x, home.y, spec.item).setOrigin(0).setScale(BOARD_SCALE);
      const slot = spec.has + inSlots.length;
      if (slot < CRATE_SLOTS) {
        inSlots.push(thing);
        const { x, y } = slotPosition(slot);
        move(thing, { x: BOARD_AT.x + x * BOARD_SCALE, y: BOARD_AT.y + y * BOARD_SCALE }, carry);
        return;
      }
      move(thing, { x: home.x, y: BOUNCE_Y }, () =>
        move(thing, home, () => {
          thing.destroy();
          returned += 1;
          showSource();
          carry();
        }),
      );
    };

    this.time.delayedCall(LINE_DELAY_MS, carry);
    fitCamera(this);
  }
}
