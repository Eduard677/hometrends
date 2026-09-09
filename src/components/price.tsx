import { euro } from "@/lib/store";

/**
 * The one place a price is rendered.
 *
 * There were two: the card built `priceLabel(product)` plus an optional <s>,
 * and the product page built its own from the selected variant. Same markup,
 * written twice, which is how the homepage and the shop drifted apart.
 *
 * Callers still resolve *which* price to show — the product page has a variant
 * to consult and the card does not — but the markup lives here.
 *
 * `showWas` is off in the homepage featured rows: `compareAt` is absent
 * wherever the markdown is not real, so a struck price only ever appears where
 * the catalogue actually carries one.
 */
export function Price({
  label,
  was,
  showWas = true,
}: {
  label: string;
  was?: number | null;
  showWas?: boolean;
}) {
  return (
    <p className="price">
      {label}
      {showWas && was ? <s>{euro(was)}</s> : null}
    </p>
  );
}
