import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getProduct, isRetiredProductSlug, type Product } from "./catalog";

type WishlistState = {
  slugs: string[];
  has: (slug: string) => boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  pruneRetired: () => void;
};

function canSave(slug: string) {
  return Boolean(getProduct(slug)) && !isRetiredProductSlug(slug);
}

export function liveWishlist(slugs: string[]) {
  const seen = new Set<string>();
  return slugs.filter((slug) => {
    if (!canSave(slug) || seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      has: (slug) => liveWishlist(get().slugs).includes(slug),
      toggle: (slug) => {
        if (!canSave(slug)) return;
        const current = liveWishlist(get().slugs);
        set({
          slugs: current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug],
        });
      },
      remove: (slug) => set({ slugs: liveWishlist(get().slugs).filter((item) => item !== slug) }),
      pruneRetired: () => set({ slugs: liveWishlist(get().slugs) }),
    }),
    {
      name: "ht-wishlist",
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<WishlistState>;
        return {
          ...current,
          ...incoming,
          slugs: liveWishlist(incoming.slugs ?? current.slugs ?? []),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.pruneRetired();
      },
    },
  ),
);

export function wishlistItems(slugs: string[]): Product[] {
  return liveWishlist(slugs)
    .map((slug) => getProduct(slug))
    .filter((item): item is Product => Boolean(item));
}
