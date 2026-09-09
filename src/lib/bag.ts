import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct, isRetiredProductSlug, type Product } from "./catalog";

/**
 * BRIEF.md 4.1. Lines are keyed by product *and* variant: the same variant twice
 * increments one line, two variants of one product are two lines.
 *
 * Each line carries its own snapshot (title, variant label, unit price, image) so
 * the drawer can render without a catalogue lookup and a line keeps the price it
 * was added at. Prices are integer cents and are formatted only at render.
 */
export type BagLine = {
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  variantLabel: string;
  unitPrice: number;
  image: string;
  quantity: number;
};

const STORAGE_KEY = "ht-bag-v3";

export function lineKey(line: Pick<BagLine, "productId" | "variantId">) {
  return `${line.productId}:${line.variantId}`;
}

function canOrder(line: BagLine) {
  return Boolean(getProduct(line.slug)) && !isRetiredProductSlug(line.slug);
}

/** Drops anything that no longer resolves, so a stale key cannot break a render. */
export function liveBagLines(lines: BagLine[]) {
  if (!Array.isArray(lines)) return [];
  return lines.filter(
    (line) =>
      line &&
      typeof line.variantId === "string" &&
      typeof line.unitPrice === "number" &&
      Number.isFinite(line.unitPrice) &&
      line.quantity > 0 &&
      canOrder(line),
  );
}

/**
 * A malformed key must never throw and take the page down, so every read is
 * guarded and falls back to an empty cart. Writes are guarded too: Safari in
 * private mode throws on setItem once the quota is zero.
 */
const guardedStorage = createJSONStorage<{ lines: BagLine[] }>(() => ({
  getItem: (name) => {
    try {
      return globalThis.localStorage?.getItem(name) ?? null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      globalThis.localStorage?.setItem(name, value);
    } catch {
      /* not fatal - the cart keeps working for this page view */
    }
  },
  removeItem: (name) => {
    try {
      globalThis.localStorage?.removeItem(name);
    } catch {
      /* as above */
    }
  },
}));

type BagState = {
  lines: BagLine[];
  add: (line: Omit<BagLine, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  pruneRetired: () => void;
};

export const useBag = create<BagState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (line, quantity = 1) => {
        const candidate: BagLine = { ...line, quantity };
        if (!canOrder(candidate)) return;
        const current = liveBagLines(get().lines);
        const key = lineKey(candidate);
        const existing = current.find((row) => lineKey(row) === key);
        if (existing) {
          set({
            lines: current.map((row) =>
              lineKey(row) === key ? { ...row, quantity: row.quantity + quantity } : row,
            ),
          });
          return;
        }
        set({ lines: [...current, candidate] });
      },
      setQuantity: (key, quantity) => {
        const current = liveBagLines(get().lines);
        if (quantity < 1) {
          set({ lines: current.filter((row) => lineKey(row) !== key) });
          return;
        }
        set({ lines: current.map((row) => (lineKey(row) === key ? { ...row, quantity } : row)) });
      },
      remove: (key) => set({ lines: liveBagLines(get().lines).filter((row) => lineKey(row) !== key) }),
      clear: () => set({ lines: [] }),
      pruneRetired: () => set({ lines: liveBagLines(get().lines) }),
    }),
    {
      name: STORAGE_KEY,
      storage: guardedStorage,
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<BagState>;
        return { ...current, ...incoming, lines: liveBagLines(incoming.lines ?? []) };
      },
      onRehydrateStorage: () => (state) => {
        state?.pruneRetired();
      },
    },
  ),
);

/**
 * The single place a cart line is built, so the card, the PDP and the wishlist
 * all snapshot the same fields. `variant` is omitted only for single-variant
 * products, where the sole variant is the selection.
 */
export function bagLineFrom(
  product: Product,
  variant?: NonNullable<Product["variants"]>[number],
): Omit<BagLine, "quantity"> | undefined {
  const chosen = variant ?? product.variants?.[0];
  if (!chosen) return undefined;
  return {
    productId: String(product.id),
    variantId: String(chosen.id),
    slug: product.slug,
    title: product.name,
    // Single-variant products have no meaningful label to show in the drawer.
    variantLabel: (product.options?.length ?? 0) > 0 ? chosen.label : "",
    unitPrice: chosen.price,
    image: product.images?.[0]?.src ?? product.image,
    quantity: 1,
  } as Omit<BagLine, "quantity">;
}

export function bagCount(lines: BagLine[]) {
  return liveBagLines(lines).reduce((sum, row) => sum + row.quantity, 0);
}

/** Integer cents. */
export function bagSubtotal(lines: BagLine[]) {
  return liveBagLines(lines).reduce((sum, row) => sum + row.unitPrice * row.quantity, 0);
}

export function bagItems(lines: BagLine[]): { line: BagLine; product: Product | undefined }[] {
  return liveBagLines(lines).map((line) => ({ line, product: getProduct(line.slug) }));
}

/**
 * BRIEF.md 4.7. Clears the cart between run-throughs without a control in the UI.
 * Documented in the README; presenting twice with items already in the bag looks
 * broken.
 */
export function applyDemoReset() {
  if (typeof window === "undefined") return false;
  if (!new URLSearchParams(window.location.search).has("reset")) return false;
  useBag.getState().clear();
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  return true;
}
