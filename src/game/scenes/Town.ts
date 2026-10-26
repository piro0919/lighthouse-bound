import Phaser from 'phaser';
import {
  BASKET_WIDTH,
  CRATE_HEIGHT,
  CRATE_WIDTH,
  drawBasket,
  drawCrate,
  filledSlots,
} from '../art/containers';
import { drawLamp } from '../art/sprites';
import { emit, sayAll } from '../bus';
import {
  CRATE_SLOTS,
  crossingWaiting,
  deliverToFisher,
  merchantAccepts,
  netAccepts,
  netWaiting,
  SAILOR_HAS,
  sailorAccepts,
  sailorWaiting,
} from '../state';
import { getState, setState } from '../store';
import { lines } from '@/story/story1';
import { fillTiles, fitCamera, OUTER_MARGIN, tappable, TILE } from '../view';

// 地図の大きさと、道・砂浜・海の始まる行（マスの数）
const ROWS = { width: 32, height: 24, path: 10, sand: 15, water: 18 };
const MAP_W = ROWS.width * TILE;
const MAP_H = ROWS.height * TILE;
const PATH_Y = ROWS.path * TILE;
const SAND_Y = ROWS.sand * TILE;
const WATER_Y = ROWS.water * TILE;
const WALK_SPEED = 70;
const STEP_MS = 150;
const MS_PER_S = 1000;
const HERO_HALF = 8;
const DIM_ALPHA = 0.6;
const CHOICE_GAP = 24;
const CHOICE_SCALE = 2;
const FEET = { x: 0.5, y: 1 };
const SIGN_ICON = { x: 5, y: 2 };

const BUILDINGS = {
  workshop: { x: 64, y: 60, texture: 'workshop', door: { x: 92, y: 120 } },
  fisher: { x: 180, y: 72, texture: 'fisherHouse', door: { x: 202, y: 124 } },
  merchant: { x: 276, y: 70, texture: 'shop', door: { x: 302, y: 124 } },
} as const;
const CHILD_AT = { x: 222, y: 104 };
const MERCHANT_AT = { x: 326, y: 100 };
const ORCHARD_SIGN = { x: 6, y: 140 };
const BEACH_SIGN = { x: 140, y: 248 };
const LIGHTHOUSE_AT = { x: 440, y: 308 };
// 桟橋は砂浜から海へ延びる。こぶねはその横につなぎ、船は沖に泊まる
const PIER_TILES = 6;
const PIER = { x: 360, width: TILE, length: TILE * PIER_TILES };
const FERRY_AT = { x: 378, y: 300 };
const SHIP_AT = { x: 260, y: 318 };
const SAILOR_AT = { x: 378, y: 262 };
// 5の場面。渡し舟の のりばの看板と、浜で待つ網の漁師
const GATE_SIGN = { x: 326, y: 244 };
const NET_FISHER_AT = { x: 232, y: 256 };
// 7の場面。満員で出ていく渡し舟、浮きのそろった網と魚、店先に並んだりんごの箱、灯台の灯
const CHANGE_SCALE = 0.5;
const CROSSING_AT = { x: 300, y: 330 };
const NET_AT = { x: 180, y: 300 };
const FISH_AT = { x: 250, y: 266 };
const STALL = {
  x: 318,
  y: 124,
  pitchX: 28,
  pitchY: 12,
  perRow: 2,
  looseX: 376,
  loosePitch: 9,
  loosePerRow: 5,
};
const ENTRANCES = {
  workshop: BUILDINGS.workshop.door,
  orchard: { x: 20, y: 164 },
  beach: { x: 148, y: 260 },
  merchant: BUILDINGS.merchant.door,
  pier: { x: PIER.x + PIER.width / 2, y: WATER_Y - HERO_HALF },
  gate: { x: GATE_SIGN.x + TILE / 2, y: WATER_Y - HERO_HALF },
  net: { x: NET_FISHER_AT.x - TILE / 2, y: WATER_Y - HERO_HALF },
} as const;

type From = keyof typeof ENTRANCES;

// 港町。触った場所までトウカが歩き、戸口や看板に着いたらそこで用を足す
export class Town extends Phaser.Scene {
  private hero!: Phaser.GameObjects.Sprite;
  private from: From = 'workshop';
  private busy = false;
  private stepTimer: Phaser.Time.TimerEvent | null = null;

  constructor() {
    super('Town');
  }

  init(data: { from?: From }): void {
    this.from = data.from ?? 'workshop';
    this.busy = false;
    this.stepTimer = null;
  }

  create(): void {
    fillTiles(
      this,
      'grass',
      -OUTER_MARGIN,
      -OUTER_MARGIN,
      MAP_W + OUTER_MARGIN * 2,
      MAP_H + OUTER_MARGIN * 2,
    );
    fillTiles(this, 'path', -OUTER_MARGIN, PATH_Y, MAP_W + OUTER_MARGIN * 2, TILE * 2);
    fillTiles(this, 'sand', -OUTER_MARGIN, SAND_Y, MAP_W + OUTER_MARGIN * 2, WATER_Y - SAND_Y);
    fillTiles(
      this,
      'water',
      -OUTER_MARGIN,
      WATER_Y,
      MAP_W + OUTER_MARGIN * 2,
      MAP_H - WATER_Y + OUTER_MARGIN,
    );
    Object.values(BUILDINGS).forEach(({ door }) => {
      fillTiles(this, 'path', door.x - TILE / 2, door.y, TILE, PATH_Y - door.y);
    });

    // 地面を触ると、そこまで歩く。海には入らない
    this.add
      .zone(-OUTER_MARGIN, -OUTER_MARGIN, MAP_W + OUTER_MARGIN * 2, MAP_H + OUTER_MARGIN * 2)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        const x = Phaser.Math.Clamp(pointer.worldX, 0, MAP_W);
        const y = Phaser.Math.Clamp(pointer.worldY, 0, WATER_Y - HERO_HALF);
        this.walkTo(x, y);
      });

    this.add.image(LIGHTHOUSE_AT.x, LIGHTHOUSE_AT.y, 'lighthouse').setOrigin(0);
    fillTiles(this, 'pier', PIER.x, SAND_Y, PIER.width, PIER.length);
    if (!getState().delivered.farewell) this.add.image(SHIP_AT.x, SHIP_AT.y, 'ship').setOrigin(0);
    const visitPier = () => this.walkTo(ENTRANCES.pier.x, ENTRANCES.pier.y, () => this.atPier());
    tappable(this.add.image(FERRY_AT.x, FERRY_AT.y, 'ferry').setOrigin(0), visitPier);
    if (sailorWaiting(getState())) {
      tappable(this.add.image(SAILOR_AT.x, SAILOR_AT.y, 'sailor').setOrigin(0), visitPier);
    }
    if (crossingWaiting(getState())) {
      this.sign(GATE_SIGN, 'tag', () =>
        this.walkTo(ENTRANCES.gate.x, ENTRANCES.gate.y, () => this.scene.start('Gate')),
      );
    }
    if (netWaiting(getState())) {
      tappable(this.add.image(NET_FISHER_AT.x, NET_FISHER_AT.y, 'netFisher').setOrigin(0), () =>
        this.walkTo(ENTRANCES.net.x, ENTRANCES.net.y, () => this.atNet()),
      );
    }
    this.changes();
    tappable(
      this.add.image(BUILDINGS.workshop.x, BUILDINGS.workshop.y, 'workshop').setOrigin(0),
      () =>
        this.walkTo(BUILDINGS.workshop.door.x, BUILDINGS.workshop.door.y, () =>
          this.scene.start('Workshop'),
        ),
    );
    const visitFisher = () =>
      this.walkTo(BUILDINGS.fisher.door.x, BUILDINGS.fisher.door.y, () => this.atFisher());
    const visitMerchant = () =>
      this.walkTo(BUILDINGS.merchant.door.x, BUILDINGS.merchant.door.y, () => this.atMerchant());
    tappable(
      this.add.image(BUILDINGS.fisher.x, BUILDINGS.fisher.y, 'fisherHouse').setOrigin(0),
      visitFisher,
    );
    tappable(
      this.add.image(BUILDINGS.merchant.x, BUILDINGS.merchant.y, 'shop').setOrigin(0),
      visitMerchant,
    );
    tappable(this.add.image(CHILD_AT.x, CHILD_AT.y, 'child').setOrigin(0), visitFisher);
    tappable(this.add.image(MERCHANT_AT.x, MERCHANT_AT.y, 'merchant').setOrigin(0), visitMerchant);

    this.sign(ORCHARD_SIGN, 'apple', () =>
      this.walkTo(ENTRANCES.orchard.x, ENTRANCES.orchard.y, () => this.scene.start('Orchard')),
    );
    this.sign(BEACH_SIGN, 'shell', () =>
      this.walkTo(ENTRANCES.beach.x, ENTRANCES.beach.y, () => this.scene.start('Beach')),
    );

    const start = ENTRANCES[this.from];
    this.hero = this.add.sprite(start.x, start.y, 'hero').setOrigin(FEET.x, FEET.y);

    const camera = this.cameras.main;
    camera.setBounds(
      -OUTER_MARGIN,
      -OUTER_MARGIN,
      MAP_W + OUTER_MARGIN * 2,
      MAP_H + OUTER_MARGIN * 2,
    );
    camera.startFollow(this.hero, true);
    fitCamera(this, null);
  }

  // 届け物で変わったところ。どれも、どの届け物でそうなったかを辿れる（7の場面）。
  // 入れ物は、届けたときと同じ5つずつ2列の形で小さく描く
  private changes(): void {
    const { delivered, sold } = getState();
    const full = (item: string) => filledSlots(CRATE_SLOTS, item);
    if (delivered.crossing) {
      drawCrate(this, CROSSING_AT.x, CROSSING_AT.y, full('rider'), undefined, 'seats').setScale(
        CHANGE_SCALE,
      );
    }
    if (delivered.net) {
      drawCrate(this, NET_AT.x, NET_AT.y, full('float'), undefined, 'net').setScale(CHANGE_SCALE);
      this.add.image(NET_FISHER_AT.x, NET_FISHER_AT.y, 'netFisher').setOrigin(0);
      this.add.image(FISH_AT.x, FISH_AT.y, 'fish').setOrigin(0);
    }
    // 店先には、売った数のとおりに箱とばらを並べる
    if (sold) {
      for (let n = 0; n < sold.crates; n += 1) {
        const x = STALL.x + (n % STALL.perRow) * STALL.pitchX;
        const y = STALL.y + Math.floor(n / STALL.perRow) * STALL.pitchY;
        drawCrate(this, x, y, full('apple')).setScale(CHANGE_SCALE);
      }
      for (let n = 0; n < sold.loose; n += 1) {
        const x = STALL.looseX + (n % STALL.loosePerRow) * STALL.loosePitch;
        const y = STALL.y + Math.floor(n / STALL.loosePerRow) * STALL.loosePitch;
        this.add.image(x, y, 'apple').setOrigin(0);
      }
    }
    if (delivered.farewell) drawLamp(this, LIGHTHOUSE_AT);
  }

  // 看板には、行き先で採れるものの絵を描いておく
  private sign(at: { x: number; y: number }, item: string, onTap: () => void): void {
    tappable(this.add.image(at.x, at.y, 'sign').setOrigin(0), onTap);
    this.add.image(at.x + SIGN_ICON.x, at.y + SIGN_ICON.y, item).setOrigin(0);
  }

  private walkTo(x: number, y: number, onArrive?: () => void): void {
    if (this.busy) return;
    // killTweensOf は onStop を呼ばずに歩きを消すので、足踏みの時計はここで止める
    this.tweens.killTweensOf(this.hero);
    this.stepTimer?.remove();
    const distance = Phaser.Math.Distance.Between(this.hero.x, this.hero.y, x, y);
    let step = 0;
    const timer = this.time.addEvent({
      delay: STEP_MS,
      loop: true,
      callback: () => {
        step += 1;
        this.hero.setTexture(step % 2 === 0 ? 'hero' : 'hero2');
      },
    });
    this.tweens.add({
      targets: this.hero,
      x,
      y,
      duration: (distance / WALK_SPEED) * MS_PER_S,
      onComplete: () => {
        timer.remove();
        this.hero.setTexture('hero');
        onArrive?.();
      },
    });
    this.stepTimer = timer;
  }

  private atFisher(): void {
    if (getState().delivered.fisher) {
      emit('say', { text: lines.fisherThanks });
      return;
    }
    this.choose((target) => {
      if (target === 'basket') {
        emit('say', { text: lines.fisherWrong });
        return;
      }
      const { state, result } = deliverToFisher(getState());
      setState(state);
      const text = {
        wrong: lines.fisherWrong,
        notFull: lines.fisherNotFull,
        thanks: lines.fisherThanks,
      }[result];
      emit('say', { text });
    });
  }

  private atMerchant(): void {
    if (getState().delivered.merchant) {
      emit('say', { text: lines.merchantThanks });
      return;
    }
    this.choose((target) => {
      if (target === 'crate' || !merchantAccepts(getState().basket)) {
        emit('say', { text: lines.merchantWrong });
        return;
      }
      emit('say', { text: lines.merchantPlates, onClose: () => this.scene.start('Plates') });
    });
  }

  // 桟橋では、船乗りが船の箱のりんごの数を言う。数は言葉で言い、りんごの絵を添える
  private atPier(): void {
    if (!sailorWaiting(getState())) return;
    this.busy = true;
    sayAll(
      [
        { text: lines.sailorShared, picture: { item: 'apple', count: SAILOR_HAS } },
        { text: lines.sailorWants, picture: { item: 'apple', count: CRATE_SLOTS } },
        lines.sailorFerry,
      ],
      () => {
        this.busy = false;
        this.choose((target) => {
          if (target === 'crate') {
            emit('say', { text: lines.sailorCrate });
            return;
          }
          if (!sailorAccepts(getState().basket)) {
            emit('say', { text: lines.sailorNotApples });
            return;
          }
          this.scene.start('Fill', { job: 'sailor' });
        });
      },
    );
  }

  // 網の漁師には、浮きだけを入れたかごを渡す。違うものなら断るので、1回に数えない
  private atNet(): void {
    this.choose((target) => {
      if (target === 'crate') {
        emit('say', { text: lines.netCrate });
        return;
      }
      if (!netAccepts(getState().basket)) {
        emit('say', { text: lines.netNotFloats });
        return;
      }
      this.scene.start('Fill', { job: 'net' });
    });
  }

  // 戸口で、箱とかごのどちらを渡すかを選ぶ。外を触るとやめる
  private choose(onChoose: (target: 'crate' | 'basket') => void): void {
    this.busy = true;
    const camera = this.cameras.main;
    const { x: cx, y: cy } = camera.midPoint;
    const span = MAP_W + OUTER_MARGIN * 2;
    const layer = this.add.container(0, 0);
    const finish = () => {
      layer.destroy();
      this.input.keyboard?.off('keydown-ESC', finish);
      this.busy = false;
    };
    this.input.keyboard?.once('keydown-ESC', finish);
    const dim = this.add
      .rectangle(cx - span, cy - span, span * 2, span * 2, 0x000000, DIM_ALPHA)
      .setOrigin(0)
      .setInteractive()
      .on('pointerdown', finish);
    const { crate, basket } = getState();
    const crateView = drawCrate(this, 0, 0, crate).setScale(CHOICE_SCALE);
    const basketView = drawBasket(this, 0, 0, basket).setScale(CHOICE_SCALE);
    // 縦長の画面にも収まるよう、箱を上、かごを下に並べる
    crateView.setPosition(
      cx - (CRATE_WIDTH * CHOICE_SCALE) / 2,
      cy - CRATE_HEIGHT * CHOICE_SCALE - CHOICE_GAP / 2,
    );
    basketView.setPosition(cx - (BASKET_WIDTH * CHOICE_SCALE) / 2, cy + CHOICE_GAP);
    layer.add([dim, crateView, basketView]);
    (
      [
        ['crate', crateView],
        ['basket', basketView],
      ] as const
    ).forEach(([target, view]) => {
      const bounds = view.getBounds();
      const zone = this.add
        .zone(bounds.x, bounds.y, bounds.width, bounds.height)
        .setOrigin(0)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          finish();
          onChoose(target);
        });
      layer.add(zone);
    });
  }
}
