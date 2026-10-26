import {
  BAG_LIMIT,
  BASKET_LIMIT,
  CRATE_SLOTS,
  ITEMS,
  STOREROOM_CRATES,
  type Item,
  type Page,
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

const PAGES: readonly Page[] = ['pairs', 'tens'];
const DELIVERIES = ['fisher', 'merchant', 'sailor', 'crossing', 'net', 'tally', 'farewell'];

function isTally(value: unknown): boolean {
  return isRecord(value) && isCount(value.crates) && isCount(value.loose);
}

function isStoreroom(value: unknown): boolean {
  return (
    isRecord(value) &&
    isCount(value.loose) &&
    Array.isArray(value.crates) &&
    value.crates.length === STOREROOM_CRATES &&
    value.crates.every((count) => isCount(count, CRATE_SLOTS))
  );
}

function isState(value: unknown): value is State {
  if (!isRecord(value)) return false;
  const { bag, crate, basket, delivered, ferryTrips, pages, storeroom, sold } = value;
  return (
    isItems(bag, BAG_LIMIT) &&
    Array.isArray(crate) &&
    crate.length === CRATE_SLOTS &&
    crate.every((slot) => slot === null || isItem(slot)) &&
    isItems(basket, BASKET_LIMIT) &&
    isRecord(delivered) &&
    DELIVERIES.every((job) => typeof delivered[job] === 'boolean') &&
    isCount(ferryTrips) &&
    Array.isArray(pages) &&
    pages.every((page) => PAGES.includes(page as Page)) &&
    (storeroom === null || isStoreroom(storeroom)) &&
    (sold === null || isTally(sold))
  );
}
