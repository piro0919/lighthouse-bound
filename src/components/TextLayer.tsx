'use client';

import { useCallback, useEffect, useState } from 'react';
import { on } from '@/game/bus';
import { speak } from '@/lib/speak';
import { letters, type LetterId } from '@/story/story1';

type Say = { text: string; onClose?: () => void };

// 手紙と台詞は、ドットの文字にせず読みやすい文字で出す。どの文も触ると読み上げる。外を触ると閉じる
export function TextLayer() {
  const [letter, setLetter] = useState<LetterId | null>(null);
  const [say, setSay] = useState<Say | null>(null);

  useEffect(() => {
    const offLetter = on('letter', setLetter);
    const offSay = on('say', setSay);
    return () => {
      offLetter();
      offSay();
    };
  }, []);

  const close = useCallback(() => {
    const onClose = say?.onClose;
    setLetter(null);
    setSay(null);
    window.speechSynthesis?.cancel();
    onClose?.();
  }, [say]);

  useEffect(() => {
    if (!letter && !say) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [letter, say, close]);

  if (!letter && !say) return null;

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-shade p-4 sm:items-center"
      onClick={close}
    >
      {letter && (
        <div
          className="w-full max-w-letter self-center rounded-sm border-4 border-ink bg-paper p-6 text-ink"
          onClick={(event) => event.stopPropagation()}
        >
          {letters[letter].map((line) => (
            <button
              key={line}
              type="button"
              className="block w-full border-b-2 border-paper-line py-1 text-left text-letter break-keep"
              onClick={() => speak(line)}
            >
              {line}
            </button>
          ))}
        </div>
      )}
      {say && (
        <button
          type="button"
          className="w-full max-w-letter rounded-sm border-4 border-ink bg-paper p-5 text-left text-letter break-keep text-ink"
          onClick={(event) => {
            event.stopPropagation();
            speak(say.text);
          }}
        >
          {say.text}
        </button>
      )}
    </div>
  );
}
