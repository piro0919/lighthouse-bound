import { initialState, type State } from './state';

// 場面をまたいで1つの状態を持つ。進み具合の保存は未決（CLAUDE.md の Tech stack）なので、読み込み直すと最初からになる
let current: State = initialState();
const listeners = new Set<(state: State) => void>();

export function getState(): State {
  return current;
}

export function setState(next: State): void {
  current = next;
  listeners.forEach((listener) => {
    listener(current);
  });
}

export function subscribe(listener: (state: State) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
