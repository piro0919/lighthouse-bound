'use client';

import { useEffect, useState } from 'react';
import { on } from '@/game/bus';
import { speak } from '@/lib/speak';
import { letters, reread } from '@/story/story1';

type Open = { onAct: () => void };

// 7の場面。漁師の子の手紙を、言葉ごとに触れる形で読み返す。触った言葉は読み上げ、その行についてのトウカの思いを出す。
// どの言葉も間違いにはしない。心配の行に触れたら、思いを出したあと、どこを触っても先へ進む。
// それまでは話の途中なので、外を触っても閉じない
export function Reread() {
  const [open, setOpen] = useState<Open | null>(null);
  const [line, setLine] = useState<number | null>(null);

  useEffect(
    () =>
      on('reread', (next) => {
        setLine(null);
        setOpen(next);
      }),
    [],
  );

  if (!open) return null;

  const found = line === reread.worry;
  const thought = line === null ? null : reread.thoughts[line];
  const act = () => {
    if (!found) return;
    setOpen(null);
    window.speechSynthesis?.cancel();
    open.onAct();
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center bg-shade p-4 sm:items-center"
      onClick={act}
    >
      <div className="w-full max-w-letter self-center" onClick={(event) => event.stopPropagation()}>
        <div className="rounded-sm border-4 border-ink bg-paper p-6 text-ink">
          {letters.fisher.map((text, n) => (
            <p key={text} className="border-b-2 border-paper-line py-1 text-letter">
              {text.split(' ').map((word, w) => (
                <button
                  // 同じ行に同じ言葉が二度出ても、位置で見分ける
                  key={`${word}-${String(w)}`}
                  type="button"
                  className="mr-2 rounded-sm active:bg-paper-line"
                  onClick={() => {
                    speak(word);
                    setLine(n);
                  }}
                >
                  {word}
                </button>
              ))}
            </p>
          ))}
        </div>
        {thought && (
          <button
            type="button"
            className="mt-3 w-full rounded-sm border-4 border-ink bg-paper p-4 text-left text-letter break-keep text-ink"
            onClick={() => {
              if (found) {
                act();
                return;
              }
              speak(thought);
            }}
          >
            {thought}
          </button>
        )}
      </div>
    </div>
  );
}
