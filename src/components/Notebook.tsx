'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { on } from '@/game/bus';
import { CRATE_SLOTS, LESSON_FILLS, type Page } from '@/game/state';
import { getState, subscribe } from '@/game/store';
import { speak } from '@/lib/speak';
import { pageTitles } from '@/story/story1';
import { Sprite } from './Sprite';

const subscribePages = (onChange: () => void) => subscribe(onChange);
const readPages = () => getState().pages;
const NO_PAGES: readonly Page[] = [];
const noPages = () => NO_PAGES;

// 5つずつ2列の箱。filled は入っている穴の印。onSlot を渡すと、穴を触って入れたり出したりできる
function Crate({
  filled,
  onSlot,
  small = false,
}: {
  filled: readonly boolean[];
  onSlot?: (slot: number) => void;
  small?: boolean;
}) {
  const size = small ? 'size-slot-small' : 'size-slot';
  return (
    <div className="inline-grid grid-cols-5 gap-1 rounded-sm border-2 border-ink bg-crate p-1">
      {filled.map((on, slot) => {
        const content = on ? <Sprite name="apple" className="size-full" /> : null;
        const className = `${size} bg-crate-hole`;
        return onSlot ? (
          <button
            // 穴は位置で決まり、並びは変わらない
            key={`slot-${String(slot)}`}
            type="button"
            className={className}
            onClick={() => onSlot(slot)}
          >
            {content}
          </button>
        ) : (
          <span key={`slot-${String(slot)}`} className={className}>
            {content}
          </span>
        );
      })}
    </div>
  );
}

function filledUpTo(count: number): boolean[] {
  return Array.from({ length: CRATE_SLOTS }, (_, slot) => slot < count);
}

// とおの あいかた のページ。記号は使わず、箱の絵だけで書く。下の空の箱は、自分で埋めて空きを見るためのもの
function PairsPage() {
  const [trial, setTrial] = useState<boolean[]>(() => filledUpTo(0));
  return (
    <>
      <div className="flex flex-wrap gap-3">
        {LESSON_FILLS.map(({ filled }) => (
          <Crate key={filled} filled={filledUpTo(filled)} small />
        ))}
      </div>
      <div className="mt-5">
        <Crate
          filled={trial}
          onSlot={(slot) => setTrial((current) => current.map((on, n) => (n === slot ? !on : on)))}
        />
      </div>
    </>
  );
}

// 道具の手帳。ページができたら画面の端にずっと下がっていて、光ったり促したりはしない。外を触ると閉じる
export function Notebook() {
  const pages = useSyncExternalStore(subscribePages, readPages, noPages);
  const [open, setOpen] = useState(false);
  const [onClose, setOnClose] = useState<(() => void) | null>(null);

  useEffect(
    () =>
      on('notebook', ({ onClose: next }) => {
        setOnClose(() => next ?? null);
        setOpen(true);
      }),
    [],
  );

  const close = useCallback(() => {
    setOpen(false);
    setOnClose(null);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (pages.length === 0) return null;

  return (
    <>
      <button
        type="button"
        aria-label={pageTitles[pages[0]]}
        className="fixed top-3 right-3 p-1"
        onClick={() => setOpen(true)}
      >
        <Sprite name="notebook" className="size-notebook" />
      </button>
      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-shade p-4"
          onClick={close}
        >
          <div
            className="w-full max-w-letter rounded-sm border-4 border-ink bg-paper p-6 text-ink"
            onClick={(event) => event.stopPropagation()}
          >
            {pages.map((page) => (
              <section key={page}>
                <button
                  type="button"
                  className="mb-3 block text-left text-letter"
                  onClick={() => speak(pageTitles[page])}
                >
                  {pageTitles[page]}
                </button>
                <PairsPage />
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
