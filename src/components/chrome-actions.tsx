import { createContext, useContext } from "react";
import type { BagLine } from "@/lib/bag";

type ChromeActionFns = {
  openBag: () => void;
  openWishlist: () => void;
  addToBag: (line: Omit<BagLine, "quantity">, quantity?: number) => void;
};

export const ChromeActions = createContext<ChromeActionFns>({
  openBag: () => {},
  openWishlist: () => {},
  addToBag: () => {},
});

export function useChromeActions() {
  return useContext(ChromeActions);
}