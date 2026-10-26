import { decodeSave, encodeSave, SAVE_KEY } from './save';
import { initialState, type State } from './state';

// 場面をまたいで1つの状態を持つ。変わるたびに端末のブラウザへ書き、Boot で読み戻す。
// 書けない端末（プライベートブラウズなど）では、読み込み直すと最初からになる
let current: State = initialState();
const listeners = new Set<(state: State) => void>();

export function getState(): State {
  return current;
}

export function setState(next: State): void {
  current = next;
  try {
    localStorage.setItem(SAVE_KEY, encodeSave(current));
  } catch {
    // 保存できなくても遊び続けられる
  }
  listeners.forEach((listener) => {
    listener(current);
  });
}

export function subscribe(listener: (state: State) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ブラウザでしか呼ばない。サーバーで描くときは localStorage が無い
export function restore(): void {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return;
  }
  const saved = decodeSave(raw);
  if (saved) setState(saved);
}
