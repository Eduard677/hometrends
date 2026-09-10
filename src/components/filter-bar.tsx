import { SlidersHorizontal, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDialogFocus, usePresence } from "@/lib/dialog";
import { PRICE_BANDS, type Facets } from "@/lib/filters";

/**
 * Structural pass §3. Desktop shows chips; mobile shows one bar that opens a
 * Filter sheet. Both drive the same URL-backed state, so a filtered view stays
 * linkable and survives a reload either way.
 *
 * Every facet is a field that exists on the product: category, price band,
 * colour (only where a Colour option exists) and availability. Size is left out
 * on purpose — bed sizes and rug dimensions share the `Size` option name.
 */
type Counts = { category: [string, number][]; colour: [string, number][] };

function activeCount(facets: Facets) {
  return facets.category.length + facets.colour.length + facets.price.length + (facets.inStock ? 1 : 0);
}

function toggle(facets: Facets, key: "category" | "colour" | "price", value: string): Facets {
  return {
    ...facets,
    [key]: facets[key].includes(value) ? facets[key].filter((item) => item !== value) : [...facets[key], value],
  };
}

/** One group of options, shared by the chip row and the sheet. */
function Group({
  legend,
  values,
  selected,
  onToggle,
  as,
}: {
  legend: string;
  values: [string, number | null][];
  selected: string[];
  onToggle: (value: string) => void;
  as: "chips" | "rows";
}) {
  if (!values.length) return null;
  return (
    <fieldset className={`filters__group filters__group--${as}`}>
      <legend>{legend}</legend>
      <div>
        {values.map(([value, count]) => {
          const on = selected.includes(value);
          return (
            <label key={value} className={`filters__opt${on ? " is-on" : ""}`}>
              <input type="checkbox" checked={on} onChange={() => onToggle(value)} />
              <span>{value}</span>
              {count === null ? null : <em>{count}</em>}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function Groups({
  counts,
  facets,
  onChange,
  as,
}: {
  counts: Counts;
  facets: Facets;
  onChange: (next: Facets) => void;
  as: "chips" | "rows";
}) {
  return (
    <>
      <Group
        legend="Category"
        as={as}
        values={counts.category}
        selected={facets.category}
        onToggle={(value) => onChange(toggle(facets, "category", value))}
      />
      <Group
        legend="Price"
        as={as}
        values={PRICE_BANDS.map((band) => [band.label, null] as [string, null])}
        selected={facets.price.map((id) => PRICE_BANDS.find((b) => b.id === id)?.label ?? id)}
        onToggle={(label) => {
          const band = PRICE_BANDS.find((b) => b.label === label);
          if (band) onChange(toggle(facets, "price", band.id));
        }}
      />
      <Group
        legend="Colour"
        as={as}
        values={counts.colour}
        selected={facets.colour}
        onToggle={(value) => onChange(toggle(facets, "colour", value))}
      />
      <fieldset className={`filters__group filters__group--${as}`}>
        <legend>Availability</legend>
        <div>
          <label className={`filters__opt${facets.inStock ? " is-on" : ""}`}>
            <input
              type="checkbox"
              checked={facets.inStock}
              onChange={() => onChange({ ...facets, inStock: !facets.inStock })}
            />
            <span>In stock only</span>
          </label>
        </div>
      </fieldset>
    </>
  );
}

export function FilterBar({
  counts,
  facets,
  resultCount,
  onChange,
  onClear,
}: {
  counts: Counts;
  facets: Facets;
  resultCount: number;
  onChange: (next: Facets) => void;
  onClear: () => void;
}) {
  const [sheet, setSheet] = useState(false);
  const { shown, on } = usePresence(sheet);
  const ref = useDialogFocus(sheet, () => setSheet(false));
  const active = activeCount(facets);

  /* Mobile pass §5. The page behind the sheet scrolled under the finger, which
     reads as the sheet itself failing to scroll. Locked while open; the sheet
     body keeps its own overflow so it still scrolls. */
  useEffect(() => {
    if (!sheet) return;
    const body = document.body;
    const previous = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previous;
    };
  }, [sheet]);

  /* Every selected value, flattened, so the grid can show them as removable
     chips. Order follows the facet groups rather than selection order, so the
     row does not reshuffle as filters are added. */
  const activeChips = [
    ...facets.category.map((value) => ({ key: "category" as const, value })),
    ...facets.colour.map((value) => ({ key: "colour" as const, value })),
    ...facets.price.map((value) => ({ key: "price" as const, value })),
  ];

  return (
    <>
      {/* Mobile: one bar. Desktop: chips. Which shows is CSS only, so both
          render the same state and there is no second source of truth. */}
      <div className="filters">
        <button type="button" className="filters__open" onClick={() => setSheet(true)} aria-expanded={sheet}>
          <SlidersHorizontal size={16} strokeWidth={1.6} aria-hidden="true" />
          Filter{active ? ` (${active})` : ""}
        </button>

        {/* Active filters, removable, above the grid. The desktop chip row
            below shows every option; this shows only what is on, and is the
            only filter feedback a phone gets once the sheet is closed. */}
        {activeChips.length || facets.inStock ? (
          <ul className="filters__active" aria-label="Active filters">
            {activeChips.map(({ key, value }) => (
              <li key={`${key}:${value}`}>
                <button type="button" onClick={() => onChange(toggle(facets, key, value))}>
                  {value}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            ))}
            {facets.inStock ? (
              <li>
                <button type="button" onClick={() => onChange({ ...facets, inStock: false })}>
                  On the floor
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove filter</span>
                </button>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="filters__chips">
          <Groups counts={counts} facets={facets} onChange={onChange} as="chips" />
          {active ? (
            <button type="button" className="text-link filters__clear" onClick={onClear}>
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      {shown ? (
        <>
          <button className={`overlay${on ? " is-on" : ""}`} aria-label="Close filters" onClick={() => setSheet(false)} />
          <aside
            ref={ref as React.RefObject<HTMLElement>}
            className={`filter-sheet${on ? " is-on" : ""}`}
            role="dialog"
            aria-modal="true"
            aria-label="Filter the range"
          >
            <header>
              <h2>Filter</h2>
              <button type="button" className="icon-btn" aria-label="Close filters" onClick={() => setSheet(false)}>
                <X size={18} strokeWidth={1.6} />
              </button>
            </header>
            <div className="filter-sheet__body">
              <Groups counts={counts} facets={facets} onChange={onChange} as="rows" />
            </div>
            <footer>
              {active ? (
                <button type="button" className="text-link" onClick={onClear}>
                  Clear all
                </button>
              ) : null}
              <button type="button" className="button button--solid" onClick={() => setSheet(false)}>
                Show {resultCount} {resultCount === 1 ? "piece" : "pieces"}
              </button>
            </footer>
          </aside>
        </>
      ) : null}
    </>
  );
}
