// 持ち物・箱・かごの中身と、届け終えた依頼。Phaser の場面と React の画面の両方から読むので、場面の外に置く

// 持ち物になるもの。React の画面にも同じ絵を出すので、Boot で全部を画像にしておく
export const ITEMS = ['apple', 'mandarin', 'shell', 'seaweed', 'float'] as const;
export type Item = (typeof ITEMS)[number];

export const CRATE_SLOTS = 10;
export const BAG_LIMIT = 20;
export const BASKET_LIMIT = 10;
export const MERCHANT_PLATES = 5;
// 船乗りが船の箱に入れてあるりんごの数
export const SAILOR_HAS = 7;
// 4の場面でおばあちゃんが箱に入れる数。手帳の とおの あいかた のページにも同じ箱を描く
export const LESSON_FILLS = [{ filled: SAILOR_HAS }, { filled: 4 }, { filled: 8 }] as const;
// 5の場面。渡し舟にもう乗っている人の数と、網にもう付いている浮きの数
export const CROSSING_ABOARD = 4;
export const NET_FLOATS = 6;

// 6の場面。蔵の空き箱の数と、山のりんごの数の幅。
// 数は2けたで、十の位（はこの数）と一の位（ばらの数）を別々に選ぶ。ばらは必ず1つ以上残る
export const STOREROOM_CRATES = 6;
export const HEAP_TENS = { min: 2, max: 5 };

// 蔵のりんご。山に残っている数と、箱ごとの数
export type Storeroom = { loose: number; crates: number[] };

// 道具の手帳のページ。とおの あいかた が最初の1枚。とおの まとまり が2枚目
export const PAGES = ['pairs', 'tens'] as const;
export type Page = (typeof PAGES)[number];

export type State = {
  bag: Item[];
  crate: (Item | null)[];
  basket: Item[];
  delivered: {
    fisher: boolean;
    merchant: boolean;
    sailor: boolean;
    crossing: boolean;
    net: boolean;
    tally: boolean;
    // 7の場面で船を見送ったか。見送ると船はいなくなり、灯台がともる
    farewell: boolean;
  };
  // こぶねを出した回数。1回目のあとに、おばあちゃんが とおの あいかた を見せる
  ferryTrips: number;
  pages: Page[];
  storeroom: Storeroom | null;
  // 6の場面で商人に売ったりんご。はこの数と、ばらの数
  sold: Tally | null;
};

export function initialState(): State {
  return {
    bag: [],
    crate: Array<Item | null>(CRATE_SLOTS).fill(null),
    basket: [],
    delivered: {
      fisher: false,
      merchant: false,
      sailor: false,
      crossing: false,
      net: false,
      tally: false,
      farewell: false,
    },
    ferryTrips: 0,
    pages: [],
    storeroom: null,
    sold: null,
  };
}

export function pick(state: State, item: Item): State {
  if (state.bag.length >= BAG_LIMIT) return state;
  return { ...state, bag: [...state.bag, item] };
}

export function drop(state: State, index: number): State {
  return { ...state, bag: state.bag.filter((_, i) => i !== index) };
}

export function bagToCrate(state: State, index: number): State {
  const slot = state.crate.indexOf(null);
  const item = state.bag[index];
  if (slot === -1 || item === undefined) return state;
  const crate = [...state.crate];
  crate[slot] = item;
  return { ...drop(state, index), crate };
}

export function crateToBag(state: State, slot: number): State {
  const item = state.crate[slot];
  if (!item || state.bag.length >= BAG_LIMIT) return state;
  const crate = [...state.crate];
  crate[slot] = null;
  return { ...state, crate, bag: [...state.bag, item] };
}

export function bagToBasket(state: State, index: number): State {
  const item = state.bag[index];
  if (state.basket.length >= BASKET_LIMIT || item === undefined) return state;
  return { ...drop(state, index), basket: [...state.basket, item] };
}

export function basketToBag(state: State, index: number): State {
  const item = state.basket[index];
  if (item === undefined || state.bag.length >= BAG_LIMIT) return state;
  return {
    ...state,
    basket: state.basket.filter((_, i) => i !== index),
    bag: [...state.bag, item],
  };
}

export type FisherResult = 'wrong' | 'notFull' | 'thanks';

// 漁師の子は、りんごで埋まった箱を待っている
export function judgeFisher(crate: readonly (Item | null)[]): FisherResult {
  const filled = crate.filter((item): item is Item => item !== null);
  if (filled.length === 0 || filled.some((item) => item !== 'apple')) return 'wrong';
  if (filled.length < crate.length) return 'notFull';
  return 'thanks';
}

export function deliverToFisher(state: State): { state: State; result: FisherResult } {
  const result = judgeFisher(state.crate);
  if (result !== 'thanks') return { state, result };
  return {
    state: {
      ...state,
      crate: Array<Item | null>(CRATE_SLOTS).fill(null),
      delivered: { ...state.delivered, fisher: true },
    },
    result,
  };
}

// 商人は、みかんだけが入ったかごを受け取ってから、皿に1つずつのせてもらう
export function merchantAccepts(basket: readonly Item[]): boolean {
  return basket.length > 0 && basket.every((item) => item === 'mandarin');
}

export type PlatesResult = 'short' | 'leftover' | 'thanks';

// 皿に置いている間はかごの中身を変えず、皿が埋まるか、かごが空になったところで数を見る。
// 足りなければ何も受け取らず、皿の分はかごに戻る。余りがあれば、皿の分だけ受け取って余りはかごに残る
export function settlePlates(state: State, placed: number): { state: State; result: PlatesResult } {
  if (placed < MERCHANT_PLATES) return { state, result: 'short' };
  const basket = state.basket.slice(MERCHANT_PLATES);
  const next = { ...state, basket, delivered: { ...state.delivered, merchant: true } };
  return { state: next, result: basket.length > 0 ? 'leftover' : 'thanks' };
}

// 船乗りは、手紙の2つの届け物が済んでから桟橋で待つ
export function sailorWaiting(state: State): boolean {
  return state.delivered.fisher && state.delivered.merchant && !state.delivered.sailor;
}

// こぶねに載せるのは、りんごだけが入ったかご。違うものなら出す前に断るので、1回に数えない
export function sailorAccepts(basket: readonly Item[]): boolean {
  return basket.length > 0 && basket.every((item) => item === 'apple');
}

export type FillResult = 'over' | 'short' | 'thanks';

// 見えないところに has だけ入っている10の入れ物へ、carried を足す。ちょうど埋まったときだけ受け取る
export function judgeFill(has: number, carried: number): FillResult {
  const total = has + carried;
  if (total > CRATE_SLOTS) return 'over';
  if (total < CRATE_SLOTS) return 'short';
  return 'thanks';
}

// こぶねが出るのは1日に1回。ちょうど埋まれば受け取り、そうでなければ全部かごに戻ってくる
export function sendFerry(state: State): { state: State; result: FillResult } {
  const result = judgeFill(SAILOR_HAS, state.basket.length);
  const ferryTrips = state.ferryTrips + 1;
  if (result !== 'thanks') return { state: { ...state, ferryTrips }, result };
  return {
    state: {
      ...state,
      ferryTrips,
      basket: [],
      delivered: { ...state.delivered, sailor: true },
    },
    result,
  };
}

// こぶねを1回出したら、うまくいってもいかなくても、おばあちゃんと とおの あいかた を書く
export function lessonDue(state: State): boolean {
  return state.ferryTrips > 0 && !state.pages.includes('pairs');
}

export function writePage(state: State, page: Page): State {
  if (state.pages.includes(page)) return state;
  return { ...state, pages: [...state.pages, page] };
}

// 5の場面は、とおの あいかた を手に入れ、船乗りに届け終えてから始まる
export function stepFiveOpen(state: State): boolean {
  return state.delivered.sailor && state.pages.includes('pairs');
}

export function crossingWaiting(state: State): boolean {
  return stepFiveOpen(state) && !state.delivered.crossing;
}

export function netWaiting(state: State): boolean {
  return stepFiveOpen(state) && !state.delivered.net;
}

// 渡し舟は1日に1回来る。札を渡した人だけが乗る。ちょうど埋まらなければ、みんな降りてその日はおしまい
export function boardCrossing(state: State, tagged: number): { state: State; result: FillResult } {
  const result = judgeFill(CROSSING_ABOARD, tagged);
  if (result !== 'thanks') return { state, result };
  return { state: { ...state, delivered: { ...state.delivered, crossing: true } }, result };
}

export function netAccepts(basket: readonly Item[]): boolean {
  return basket.length > 0 && basket.every((item) => item === 'float');
}

// 浮きを網まで運べるのは1回。ちょうど埋まれば受け取り、そうでなければ全部かごに戻ってくる
export function deliverFloats(state: State): { state: State; result: FillResult } {
  const result = judgeFill(NET_FLOATS, state.basket.length);
  if (result !== 'thanks') return { state, result };
  return {
    state: { ...state, basket: [], delivered: { ...state.delivered, net: true } },
    result,
  };
}

// 6の場面は、5の場面の2つを届け終えてから始まる
export function stepSixOpen(state: State): boolean {
  return state.delivered.crossing && state.delivered.net;
}

// 新しい山。rand は 0 以上 1 未満を返す
export function newHeap(rand: () => number): Storeroom {
  const tens = HEAP_TENS.min + Math.floor(rand() * (HEAP_TENS.max - HEAP_TENS.min + 1));
  const ones = 1 + Math.floor(rand() * (CRATE_SLOTS - 1));
  return { loose: tens * CRATE_SLOTS + ones, crates: Array<number>(STOREROOM_CRATES).fill(0) };
}

export function heapTotal(storeroom: Storeroom): number {
  return storeroom.crates.reduce((sum, count) => sum + count, storeroom.loose);
}

// 山から1つ取って箱に入れる。箱が埋まっていれば入らない
export function packApple(storeroom: Storeroom, crate: number): Storeroom {
  const inCrate = storeroom.crates[crate];
  if (storeroom.loose === 0 || inCrate === undefined || inCrate >= CRATE_SLOTS) return storeroom;
  return {
    loose: storeroom.loose - 1,
    crates: storeroom.crates.map((count, n) => (n === crate ? count + 1 : count)),
  };
}

// 返事の手紙に書いた数。はこが いくつ と、ばらが いくつ
export type Tally = { crates: number; loose: number };

export type TallyResult = 'thanks' | 'miss';

// 手紙を出せるのは1回。商人は全部を10ずつ数え直し、合っていれば全部買う。違えばその日はおしまいで、次の日は別の山になる。
// 箱を10まで埋めて数え、合っていたら、トウカが自分で とおの まとまり を手帳に書く（教わらずに見つけた道具）。
// 売った数は町の店先に箱とばらで並ぶ（7の場面）
export function settleTally(
  state: State,
  said: Tally,
  rand: () => number,
): { state: State; result: TallyResult; truth: Tally } {
  const storeroom = state.storeroom ?? newHeap(rand);
  const total = heapTotal(storeroom);
  const truth = { crates: Math.floor(total / CRATE_SLOTS), loose: total % CRATE_SLOTS };
  const usedCrates = storeroom.crates.some((count) => count === CRATE_SLOTS);
  const right = said.crates * CRATE_SLOTS + said.loose === total;
  if (!right) {
    return { state: { ...state, storeroom: newHeap(rand) }, result: 'miss', truth };
  }
  const withPage = usedCrates ? writePage(state, 'tens') : state;
  return {
    state: {
      ...withPage,
      storeroom: null,
      sold: truth,
      delivered: { ...withPage.delivered, tally: true },
    },
    result: 'thanks',
    truth,
  };
}

// 7の場面は、6の場面で商人がりんごを全部買ったあと、工房に戻ったところで始まる
export function farewellDue(state: State): boolean {
  return state.delivered.tally && !state.delivered.farewell;
}

export function seeOff(state: State): State {
  return { ...state, delivered: { ...state.delivered, farewell: true } };
}
