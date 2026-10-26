// 持ち物・箱・かごの中身と、届け終えた依頼。Phaser の場面と React の画面の両方から読むので、場面の外に置く

export type Item = 'apple' | 'mandarin' | 'shell' | 'seaweed';

export const CRATE_SLOTS = 10;
export const BAG_LIMIT = 20;
export const BASKET_LIMIT = 10;
export const MERCHANT_PLATES = 5;

export type State = {
  bag: Item[];
  crate: (Item | null)[];
  basket: Item[];
  delivered: { fisher: boolean; merchant: boolean };
};

export function initialState(): State {
  return {
    bag: [],
    crate: Array<Item | null>(CRATE_SLOTS).fill(null),
    basket: [],
    delivered: { fisher: false, merchant: false },
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
