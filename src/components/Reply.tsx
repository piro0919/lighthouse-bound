'use client';

import { useCallback, useEffect, useState } from 'react';
import { on } from '@/game/bus';
import type { Tally } from '@/game/state';
import { speak } from '@/lib/speak';
import { reply } from '@/story/story1';

type Open = { onSend: (tally: Tally) => void };

const TILE =
  'rounded-sm border-2 border-ink bg-paper px-3 py-1 text-letter break-keep text-ink active:bg-paper-line';
const BLANK = 'inline-block min-w-blank rounded-sm border-b-4 border-ink px-2 text-center';

// 6の場面の返事。はこの数と、ばらの数の札を選んで、あいたところに入れる。
// 札を触ると読み上げてから入れる。入れた札を触ると外れる。出すまでは、外を触ればやめられる（1回に数えない）
export function Reply() {
  const [open, setOpen] = useState<Open | null>(null);
  const [crates, setCrates] = useState<number | null>(null);
  const [loose, setLoose] = useState<number | null>(null);

  useEffect(
    () =>
      on('reply', (next) => {
        setCrates(null);
        setLoose(null);
        setOpen(next);
      }),
    [],
  );

  const close = useCallback(() => setOpen(null), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;

  const cratesWord = crates === null ? null : reply.crates[crates];
  const looseWord = loose === null ? null : reply.loose[loose];
  const send = () => {
    if (crates === null || loose === null) return;
    setOpen(null);
    open.onSend({ crates: crates + 1, loose: loose + 1 });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-shade p-4" onClick={close}>
      <div
        className="max-h-full w-full max-w-letter overflow-y-auto rounded-sm border-4 border-ink bg-paper p-6 text-ink"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-letter">{reply.to}</p>
        <p className="text-letter break-keep">
          {reply.before}{' '}
          <button type="button" className={BLANK} onClick={() => setCrates(null)}>
            {cratesWord ?? '　'}
          </button>
          {reply.middle}{' '}
          <button type="button" className={BLANK} onClick={() => setLoose(null)}>
            {looseWord ?? '　'}
          </button>{' '}
          {reply.after}
        </p>
        <p className="text-right text-letter">{reply.from}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {reply.crates.map((word, n) => (
            <button
              key={word}
              type="button"
              className={TILE}
              onClick={() => {
                speak(word);
                setCrates(n);
              }}
            >
              {word}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {reply.loose.map((word, n) => (
            <button
              key={word}
              type="button"
              className={TILE}
              onClick={() => {
                speak(word);
                setLoose(n);
              }}
            >
              {word}
            </button>
          ))}
        </div>
        {cratesWord && looseWord && (
          <button type="button" className={`${TILE} mt-5 bg-paper-line`} onClick={send}>
            {reply.send}
          </button>
        )}
      </div>
    </div>
  );
}
