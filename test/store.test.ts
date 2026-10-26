import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { encodeSave, SAVE_KEY } from '@/game/save';
import { initialState, pick, writePage } from '@/game/state';

// 試験は node で走るので、ブラウザの localStorage の代わりを置く
function fakeStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: (key) => items.get(key) ?? null,
    key: (n) => [...items.keys()][n] ?? null,
    removeItem: (key) => items.delete(key),
    setItem: (key, value) => items.set(key, value),
  };
}

// store は状態をモジュールに持つので、試験ごとに読み込み直す
async function freshStore() {
  vi.resetModules();
  return import('@/game/store');
}

describe('store', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', fakeStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes the state on every change', async () => {
    const store = await freshStore();
    const next = pick(initialState(), 'apple');
    store.setState(next);
    expect(localStorage.getItem(SAVE_KEY)).toBe(encodeSave(next));
  });

  it('restores what was saved', async () => {
    const saved = writePage(pick(initialState(), 'float'), 'pairs');
    localStorage.setItem(SAVE_KEY, encodeSave(saved));
    const store = await freshStore();
    expect(store.getState()).toEqual(initialState());
    store.restore();
    expect(store.getState()).toEqual(saved);
  });

  it('starts over when the save cannot be read', async () => {
    localStorage.setItem(SAVE_KEY, '{');
    const store = await freshStore();
    store.restore();
    expect(store.getState()).toEqual(initialState());
  });

  it('keeps playing when the browser refuses to store', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    const store = await freshStore();
    store.restore();
    const next = pick(initialState(), 'apple');
    store.setState(next);
    expect(store.getState()).toEqual(next);
  });
});
