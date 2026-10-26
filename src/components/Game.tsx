'use client';

import { useEffect, useRef } from 'react';
import { getState, setState } from '@/game/store';
import { Notebook } from './Notebook';
import { Reply } from './Reply';
import { TextLayer } from './TextLayer';

// Phaser はブラウザでしか動かないので、画面に出てから読み込む
export function Game() {
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let game: { destroy: (removeCanvas: boolean) => void } | null = null;
    let cancelled = false;
    void import('@/game/main').then(({ startGame }) => {
      if (cancelled || !parent.current) return;
      const started = startGame(parent.current);
      game = started;
      // 開発中だけ、確認のスクリプトから場面と状態を読めるようにする
      if (process.env.NODE_ENV === 'development') {
        Object.assign(window, { __game: started, __store: { getState, setState } });
      }
    });
    return () => {
      cancelled = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <>
      <div ref={parent} className="fixed inset-0" />
      <Notebook />
      <Reply />
      <TextLayer />
    </>
  );
}
