import {
  BAG_LIMIT,
  BASKET_LIMIT,
  CRATE_SLOTS,
  HEAP_TENS,
  heapTotal,
  initialState,
  ITEMS,
  PAGES,
  STOREROOM_CRATES,
  type Item,
  type State,
} from './state';

// 進み具合は端末のブラウザに置く。名前も端末の情報も持たない。
// 形を変えたら VERSION を上げる。読めない保存は捨てて最初から始める
export const SAVE_KEY = 'lighthouse-bound';
const VERSION = 1;

export function encodeSave(state: State): string {
  return JSON.stringify({ version: VERSION, state });
}

export function decodeSave(raw: string | null): State | null {
  if (raw === null) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(parsed) || parsed.version !== VERSION) return null;
  return isState(parsed.state) ? parsed.state : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isCount(value: unknown, max = Infinity): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

function isItem(value: unknown): value is Item {
  return (ITEMS as readonly unknown[]).includes(value);
}

function isItems(value: unknown, max: number): value is Item[] {
  return Array.isArray(value) && value.length <= max && value.every(isItem);
}

// 山は多くても十の位が HEAP_TENS.max で、一の位が9。手で書き換えた大きな数で、絵を作りすぎないようにする
const HEAP_MAX = HEAP_TENS.max * CRATE_SLOTS + CRATE_SLOTS - 1;

// 項目の名前は initialState と同じでなければならない。State に足して VERSION を上げ忘れても、古い保存は通さない
function sameKeys(value: Record<string, unknown>, model: object): boolean {
  const keys = Object.keys(value).sort();
  const expected = Object.keys(model).sort();
  return keys.length === expected.length && keys.every((key, n) => key === expected[n]);
}

function isTally(value: unknown): boolean {
  return (
    isRecord(value) &&
    sameKeys(value, { crates: 0, loose: 0 }) &&
    isCount(value.crates, HEAP_TENS.max) &&
    isCount(value.loose, CRATE_SLOTS - 1)
  );
}

function isStoreroom(value: unknown): boolean {
  if (!isRecord(value) || !sameKeys(value, { loose: 0, crates: [] })) return false;
  const { loose, crates } = value;
  return (
    isCount(loose, HEAP_MAX) &&
    Array.isArray(crates) &&
    crates.length === STOREROOM_CRATES &&
    crates.every((count) => isCount(count, CRATE_SLOTS)) &&
    heapTotal({ loose, crates: crates as number[] }) <= HEAP_MAX
  );
}

function isState(value: unknown): value is State {
  const model = initialState();
  if (!isRecord(value) || !sameKeys(value, model)) return false;
  const { bag, crate, basket, delivered, ferryTrips, pages, storeroom, sold } = value;
  return (
    isItems(bag, BAG_LIMIT) &&
    Array.isArray(crate) &&
    crate.length === CRATE_SLOTS &&
    crate.every((slot) => slot === null || isItem(slot)) &&
    isItems(basket, BASKET_LIMIT) &&
    isRecord(delivered) &&
    sameKeys(delivered, model.delivered) &&
    Object.values(delivered).every((done) => typeof done === 'boolean') &&
    isCount(ferryTrips) &&
    Array.isArray(pages) &&
    pages.every((page) => (PAGES as readonly unknown[]).includes(page)) &&
    (storeroom === null || isStoreroom(storeroom)) &&
    (sold === null || isTally(sold))
  );
}
