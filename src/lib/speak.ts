// 文を触ると読み上げる。録音した声にするかは未決（CLAUDE.md の Tech stack）で、今はブラウザの読み上げを使う
const RATE = 0.85;

export function speak(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  utterance.rate = RATE;
  window.speechSynthesis.speak(utterance);
}
