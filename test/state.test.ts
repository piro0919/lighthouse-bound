import { describe, expect, it } from 'vitest';
import {
  BAG_LIMIT,
  bagToBasket,
  bagToCrate,
  crateToBag,
  deliverToFisher,
  initialState,
  judgeFisher,
  merchantAccepts,
  pick,
  settlePlates,
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
