// 持ち物・箱・かごの中身と、届け終えた依頼。Phaser の場面と React の画面の両方から読むので、場面の外に置く

export type Item = 'apple' | 'mandarin' | 'shell' | 'seaweed' | 'float';

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

// 道具の手帳のページ。とおの あいかた が最初の1枚
export type Page = 'pairs';

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
  };
  // こぶねを出した回数。1回目のあとに、おばあちゃんが とおの あいかた を見せる
  ferryTrips: number;
  pages: Page[];
};

export function initialState(): State {
  return {
    bag: [],
    crate: Array<Item | null>(CRATE_SLOTS).fill(null),
    basket: [],
    delivered: { fisher: false, merchant: false, sailor: false, crossing: false, net: false },
    ferryTrips: 0,
    pages: [],
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
