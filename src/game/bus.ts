import type { LetterId } from '@/story/story1';
import type { Item, Tally } from './state';

// 台詞に添える絵。数は言葉で言い、同じ数のものを絵で並べる（数字は出さない）
export type Picture = { item: Item; count: number };
export type Say = { text: string; picture?: Picture; onClose?: () => void };

// Phaser の場面から React の文字の画面を開くための合図（Phaser の公式のひな形 template-nextjs と同じ形）
type Events = {
  letter: LetterId;
  say: Say;
  notebook: { onClose?: () => void };
  reply: { onSend: (tally: Tally) => void };
  reread: { onAct: () => void };
};

type Listener<K extends keyof Events> = (payload: Events[K]) => void;

const listeners = new Map<keyof Events, Set<(payload: never) => void>>();

export function emit<K extends keyof Events>(event: K, payload: Events[K]): void {
  listeners.get(event)?.forEach((listener) => {
    (listener as Listener<K>)(payload);
  });
}

export function on<K extends keyof Events>(event: K, listener: Listener<K>): () => void {
  const set = listeners.get(event) ?? new Set();
  listeners.set(event, set);
  set.add(listener);
  return () => set.delete(listener);
}

// 台詞を1つずつ順に出し、最後のものを閉じたら onDone を呼ぶ
export function sayAll(
  says: readonly (string | Omit<Say, 'onClose'>)[],
  onDone?: () => void,
): void {
  const [first, ...rest] = says;
  if (first === undefined) {
    onDone?.();
    return;
  }
  const say = typeof first === 'string' ? { text: first } : first;
  emit('say', { ...say, onClose: () => sayAll(rest, onDone) });
}
