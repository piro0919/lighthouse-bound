import { describe, expect, it } from 'vitest';
import {
  BAG_LIMIT,
  boardCrossing,
  bagToBasket,
  bagToCrate,
  CRATE_SLOTS,
  CROSSING_ABOARD,
  crossingWaiting,
  crateToBag,
  deliverToFisher,
  deliverFloats,
  initialState,
  judgeFisher,
  judgeFill,
  lessonDue,
  merchantAccepts,
  NET_FLOATS,
  netAccepts,
  netWaiting,
  pick,
  SAILOR_HAS,
  sailorAccepts,
  sailorWaiting,
  sendFerry,
  settlePlates,
  writePage,
  type Item,
  type State,
} from '@/game/state';

function withBag(items: Item[]): State {
  return items.reduce(pick, initialState());
}

function fillCrate(state: State, count: number): State {
  let next = state;
  for (let n = 0; n < count; n += 1) next = bagToCrate(next, 0);
  return next;
}

describe('bag', () => {
  it('stops picking at the limit', () => {
    const full = withBag(Array<Item>(BAG_LIMIT).fill('apple'));
    expect(pick(full, 'apple').bag).toHaveLength(BAG_LIMIT);
  });
});

describe('crate', () => {
  it('fills the first empty slot and returns an item to the bag', () => {
    const state = fillCrate(withBag(['apple', 'mandarin']), 2);
    expect(state.crate.slice(0, 2)).toEqual(['apple', 'mandarin']);
    const back = crateToBag(state, 0);
    expect(back.crate[0]).toBeNull();
    expect(back.bag).toEqual(['apple']);
    expect(bagToCrate(back, 0).crate[0]).toBe('apple');
  });
});

describe('fisher', () => {
  it('wants a crate full of apples', () => {
    expect(judgeFisher(initialState().crate)).toBe('wrong');
    expect(judgeFisher(fillCrate(withBag(Array<Item>(7).fill('apple')), 7).crate)).toBe('notFull');
    const mixed = fillCrate(withBag([...Array<Item>(9).fill('apple'), 'shell']), 10);
    expect(judgeFisher(mixed.crate)).toBe('wrong');
    const full = fillCrate(withBag(Array<Item>(10).fill('apple')), 10);
    const { state, result } = deliverToFisher(full);
    expect(result).toBe('thanks');
    expect(state.delivered.fisher).toBe(true);
    expect(state.crate.every((slot) => slot === null)).toBe(true);
  });
});

describe('merchant', () => {
  const basketOf = (items: Item[]) =>
    items.reduce((state) => bagToBasket(state, 0), withBag(items));

  it('accepts only a basket of mandarins', () => {
    expect(merchantAccepts([])).toBe(false);
    expect(merchantAccepts(['mandarin', 'apple'])).toBe(false);
    expect(merchantAccepts(['mandarin'])).toBe(true);
  });

  it('takes nothing when plates stay empty', () => {
    const state = basketOf(Array<Item>(3).fill('mandarin'));
    const { state: next, result } = settlePlates(state, 3);
    expect(result).toBe('short');
    expect(next.basket).toHaveLength(3);
    expect(next.delivered.merchant).toBe(false);
  });

  it('takes five and returns the rest', () => {
    const state = basketOf(Array<Item>(7).fill('mandarin'));
    const { state: next, result } = settlePlates(state, 5);
    expect(result).toBe('leftover');
    expect(next.basket).toHaveLength(2);
    expect(next.delivered.merchant).toBe(true);
    expect(settlePlates(basketOf(Array<Item>(5).fill('mandarin')), 5).result).toBe('thanks');
  });
});

describe('sailor', () => {
  const ready = (apples: number): State => {
    const state = Array.from({ length: apples }).reduce<State>(
      (next) => bagToBasket(next, 0),
      withBag(Array<Item>(apples).fill('apple')),
    );
    return { ...state, delivered: { ...state.delivered, fisher: true, merchant: true } };
  };

  it('waits at the pier only after both letters are delivered', () => {
    expect(sailorWaiting(initialState())).toBe(false);
    expect(sailorWaiting(ready(0))).toBe(true);
  });

  it('accepts only a basket of apples', () => {
    expect(sailorAccepts([])).toBe(false);
    expect(sailorAccepts(['apple', 'mandarin'])).toBe(false);
    expect(sailorAccepts(['apple'])).toBe(true);
  });

  it('takes the apples only when they fill the box exactly', () => {
    expect(judgeFill(SAILOR_HAS, CRATE_SLOTS - SAILOR_HAS)).toBe('thanks');
    expect(judgeFill(SAILOR_HAS, CRATE_SLOTS - SAILOR_HAS + 1)).toBe('over');
    expect(judgeFill(SAILOR_HAS, CRATE_SLOTS - SAILOR_HAS - 1)).toBe('short');
  });

  it('returns every apple on a miss and counts the trip', () => {
    const { state, result } = sendFerry(ready(5));
    expect(result).toBe('over');
    expect(state.basket).toHaveLength(5);
    expect(state.ferryTrips).toBe(1);
    expect(state.delivered.sailor).toBe(false);
    expect(lessonDue(state)).toBe(true);
  });

  it('keeps the apples when the box is filled', () => {
    const { state, result } = sendFerry(ready(CRATE_SLOTS - SAILOR_HAS));
    expect(result).toBe('thanks');
    expect(state.basket).toHaveLength(0);
    expect(state.delivered.sailor).toBe(true);
    expect(sailorWaiting(state)).toBe(false);
    expect(lessonDue(state)).toBe(true);
  });

  it('stops asking for the lesson once the page is written', () => {
    const { state } = sendFerry(ready(1));
    const written = writePage(state, 'pairs');
    expect(lessonDue(written)).toBe(false);
    expect(writePage(written, 'pairs').pages).toEqual(['pairs']);
  });
});

describe('step 5', () => {
  const afterSailor = (): State => ({
    ...writePage(initialState(), 'pairs'),
    delivered: { fisher: true, merchant: true, sailor: true, crossing: false, net: false },
  });

  it('opens once the sailor has his apples and the page is written', () => {
    expect(crossingWaiting(initialState())).toBe(false);
    expect(netWaiting(initialState())).toBe(false);
    expect(crossingWaiting(afterSailor())).toBe(true);
    expect(netWaiting(afterSailor())).toBe(true);
  });

  it('boards the ferry only when the tags fill every seat', () => {
    expect(boardCrossing(afterSailor(), CRATE_SLOTS - CROSSING_ABOARD - 1).result).toBe('short');
    expect(boardCrossing(afterSailor(), CRATE_SLOTS - CROSSING_ABOARD + 1).result).toBe('over');
    const { state, result } = boardCrossing(afterSailor(), CRATE_SLOTS - CROSSING_ABOARD);
    expect(result).toBe('thanks');
    expect(crossingWaiting(state)).toBe(false);
  });

  it('takes the floats only when they fill the net, and returns them otherwise', () => {
    const carrying = (floats: number): State =>
      Array.from({ length: floats }).reduce<State>(
        (next) => bagToBasket(next, 0),
        Array<Item>(floats).fill('float').reduce(pick, afterSailor()),
      );
    expect(netAccepts(['float', 'apple'])).toBe(false);
    expect(netAccepts(['float'])).toBe(true);
    const missed = deliverFloats(carrying(CRATE_SLOTS - NET_FLOATS + 1));
    expect(missed.result).toBe('over');
    expect(missed.state.basket).toHaveLength(CRATE_SLOTS - NET_FLOATS + 1);
    const done = deliverFloats(carrying(CRATE_SLOTS - NET_FLOATS));
    expect(done.result).toBe('thanks');
    expect(done.state.basket).toHaveLength(0);
    expect(netWaiting(done.state)).toBe(false);
  });
});
