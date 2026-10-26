import type { LetterId } from '@/story/story1';

// Phaser の場面から React の文字の画面を開くための合図（Phaser の公式のひな形 template-nextjs と同じ形）
type Events = {
  letter: LetterId;
  say: { text: string; onClose?: () => void };
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
