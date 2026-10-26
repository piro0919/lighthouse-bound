import { describe, expect, it } from 'vitest';
import { decodeSave, encodeSave } from '@/game/save';
import { initialState, newHeap, pick, seeOff, writePage, type State } from '@/game/state';

function played(): State {
  const state = writePage(pick(pick(initialState(), 'apple'), 'float'), 'pairs');
  return {
    ...seeOff(state),
    ferryTrips: 2,
    basket: ['apple', 'apple'],
    storeroom: newHeap(() => 0.5),
    sold: { crates: 3, loose: 7 },
  };
}

describe('save', () => {
  it('reads back what it wrote', () => {
    expect(decodeSave(encodeSave(initialState()))).toEqual(initialState());
    expect(decodeSave(encodeSave(played()))).toEqual(played());
  });

  it('starts over when there is nothing saved or it cannot be read', () => {
    expect(decodeSave(null)).toBeNull();
    expect(decodeSave('')).toBeNull();
    expect(decodeSave('{')).toBeNull();
    expect(decodeSave('[]')).toBeNull();
  });

  it('starts over when the save is from another version', () => {
    const raw = JSON.stringify({ version: 0, state: initialState() });
    expect(decodeSave(raw)).toBeNull();
  });

  it('starts over when the state has the wrong shape', () => {
    const broken: unknown[] = [
      { ...initialState(), bag: ['stone'] },
      { ...initialState(), crate: [] },
      { ...initialState(), delivered: { ...initialState().delivered, net: 'yes' } },
      { ...initialState(), ferryTrips: -1 },
      { ...initialState(), pages: ['pairs', 'map'] },
      { ...initialState(), storeroom: { loose: 3, crates: [11, 0, 0, 0, 0, 0] } },
      { ...initialState(), storeroom: { loose: 100000000, crates: [0, 0, 0, 0, 0, 0] } },
      { ...initialState(), storeroom: { loose: 50, crates: [10, 0, 0, 0, 0, 0] } },
      { ...initialState(), sold: { crates: 1 } },
      { ...initialState(), sold: { crates: 1000000, loose: 0 } },
      { ...initialState(), sold: undefined },
      { ...initialState(), extra: true },
      { ...initialState(), delivered: { ...initialState().delivered, later: false } },
    ];
    broken.forEach((state) => {
      expect(decodeSave(JSON.stringify({ version: 1, state }))).toBeNull();
    });
  });
});
