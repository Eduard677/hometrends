import { useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

export type Variant = NonNullable<Product["variants"]>[number];

/**
 * BRIEF.md 3.2. Driven off `options[].name`, never a hardcoded Size/Colour pair:
 * the catalogue also uses Style, Storage, Material, Bedding size, Headboard
 * Design, Add Drawer, Amount and Drawers.
 *
 * A variant's `options` array is positional and lines up with `product.options`,
 * so a value is matched by index rather than by name.
 */
export function useVariantSelection(product: Product) {
  const groups = product.options ?? [];
  const variants = useMemo(() => product.variants ?? [], [product.variants]);
  // Single-variant products have no groups, so they start already selected.
  const [chosen, setChosen] = useState<(string | null)[]>(() => groups.map(() => null));

  const selected = useMemo(() => {
    if (!groups.length) return variants[0];
    if (chosen.some((value) => value === null)) return undefined;
    return variants.find((variant) => chosen.every((value, index) => variant.options[index] === value));
  }, [chosen, groups.length, variants]);

  /** A value is offered when some in-stock variant still matches the other choices. */
  function isAvailable(groupIndex: number, value: string) {
    return variants.some(
      (variant) =>
        variant.options[groupIndex] === value &&
        variant.available &&
        chosen.every((picked, index) => index === groupIndex || picked === null || variant.options[index] === picked),
    );
  }

  const missing = groups.filter((_, index) => chosen[index] === null).map((group) => group.name);

  return {
    groups,
    chosen,
    selected,
    missing,
    isAvailable,
    choose: (groupIndex: number, value: string) =>
      setChosen((previous) => previous.map((current, index) => (index === groupIndex ? value : current))),
  };
}

export function VariantPicker({
  selection,
}: {
  selection: ReturnType<typeof useVariantSelection>;
}) {
  const { groups, chosen, isAvailable, choose } = selection;
  if (!groups.length) return null;
  return (
    <div className="variant-picker">
      {groups.map((group, groupIndex) => (
        <fieldset key={group.name} className="variant-picker__group">
          <legend>{group.name}</legend>
          <div className="variant-picker__values">
            {group.values.map((value) => {
              const available = isAvailable(groupIndex, value);
              const active = chosen[groupIndex] === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`variant-picker__value${active ? " is-on" : ""}${available ? "" : " is-unavailable"}`}
                  // Unavailable values stay visible and disabled rather than
                  // being hidden, so the range on the floor is still legible.
                  disabled={!available}
                  aria-pressed={active}
                  aria-label={available ? `${group.name}: ${value}` : `${group.name}: ${value}, unavailable`}
                  onClick={() => choose(groupIndex, value)}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
