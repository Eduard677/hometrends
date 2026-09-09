import type { Product } from "./catalog";

/**
 * BRIEF.md 5.1. Facets for the range page: category, price band, colour and
 * availability. All filtering happens in memory over the parsed catalogue —
 * no network, no re-fetch.
 *
 * Size is deliberately not a facet. Bed sizes are normalised but still share the
 * `Size` option name with rug dimensions ("Medium 120x170"), so a size facet
 * would mix incompatible vocabularies. Future work: split the option name at the
 * scrape, then facet on bed sizes alone.
 */
export type Facets = {
  category: string[];
  colour: string[];
  price: string[];
  inStock: boolean;
};

export const EMPTY_FACETS: Facets = { category: [], colour: [], price: [], inStock: false };

/** Bands in cents, chosen off the catalogue's own spread rather than round numbers. */
export const PRICE_BANDS = [
  { id: "0-20000", label: "Under €200", min: 0, max: 20000 },
  { id: "20000-50000", label: "€200 to €500", min: 20000, max: 50000 },
  { id: "50000-100000", label: "€500 to €1,000", min: 50000, max: 100000 },
  { id: "100000-250000", label: "€1,000 to €2,500", min: 100000, max: 250000 },
  { id: "250000-", label: "Over €2,500", min: 250000, max: Infinity },
] as const;

/**
 * 161 distinct colour values, 85 of them used by a single product, so the raw
 * values make an unusable facet. Values are folded into families by keyword.
 * Order matters: "Light Grey" must not be caught by a bare "light" rule, and
 * "Cream and Oak" reads as oak.
 */
const COLOUR_FAMILIES: { label: string; test: RegExp }[] = [
  { label: "Oak", test: /oak|sonoma|artisan/ },
  { label: "Walnut", test: /walnut|chestnut|mahogany|cognac/ },
  // `stee` rather than `steel`: the source data contains "Wool Stee".
  { label: "Grey", test: /grey|gray|charcoal|slate|stee|graphite|pewter|concrete|shadow|aluminium|anchor/ },
  { label: "White", test: /white|snow|chalk|ivory/ },
  { label: "Black", test: /black|ink|onyx|jet/ },
  { label: "Blue", test: /blue|navy|ocean|denim|teal|indigo|midnight|petrol/ },
  { label: "Green", test: /green|sage|moss|olive|forest|jade/ },
  { label: "Natural", test: /beige|t[ao]upe|cream|stone|sand|oatmeal|linen|natural|marble|nude|ash|biscuit|oyster|capp[au]c?[cu]/ },
  // `ter+a` rather than `terra`: the source data contains "Deep Tera".
  { label: "Brown", test: /brown|clay|ter+a|\btan\b|caramel|chocolate|coffee|mocha|camel/ },
  { label: "Pink", test: /pink|blush|rose|salmon|coral/ },
  { label: "Purple", test: /purple|lilac|lavender|plum|heather|aubergine|mulberry/ },
  { label: "Red", test: /\bred|burg[au]ndy|wine|rust|pumpkin|paprika/ },
  { label: "Yellow", test: /yellow|mustard|ochre|gold|honey|t[u]?[rm]+eric|amber/ },
  { label: "Silver", test: /silver|chrome/ },
  { label: "Orange", test: /orange|apricot|tangerine/ },
];

export function colourFamily(value: string) {
  const needle = value.toLowerCase();
  return COLOUR_FAMILIES.find((family) => family.test.test(needle))?.label;
}

export function productColours(product: Product) {
  const values = (product.options ?? []).filter((option) => option.name === "Colour").flatMap((option) => option.values);
  return [...new Set(values.map(colourFamily).filter((family): family is string => Boolean(family)))];
}

function inBand(price: number, id: string) {
  const band = PRICE_BANDS.find((candidate) => candidate.id === id);
  return band ? price >= band.min && price < band.max : true;
}

/** Each predicate is separate so the empty state can say which one to relax. */
const PREDICATES: { key: keyof Facets; label: string; test: (product: Product, facets: Facets) => boolean }[] = [
  {
    key: "category",
    label: "category",
    test: (product, facets) => !facets.category.length || facets.category.includes(product.category),
  },
  {
    key: "price",
    label: "price",
    test: (product, facets) => !facets.price.length || facets.price.some((id) => inBand(product.fromPrice, id)),
  },
  {
    key: "colour",
    label: "colour",
    test: (product, facets) => {
      if (!facets.colour.length) return true;
      const colours = productColours(product);
      return facets.colour.some((colour) => colours.includes(colour));
    },
  },
  {
    key: "inStock",
    label: "availability",
    test: (product, facets) => !facets.inStock || product.inStock !== false,
  },
];

export function applyFacets(products: Product[], facets: Facets) {
  return products.filter((product) => PREDICATES.every((predicate) => predicate.test(product, facets)));
}

/**
 * Names the single facet that, relaxed on its own, would bring results back, so
 * the empty state can say which one to drop rather than only "no results".
 */
export function blockingFacet(products: Product[], facets: Facets) {
  const active = PREDICATES.filter((predicate) =>
    predicate.key === "inStock" ? facets.inStock : facets[predicate.key].length > 0,
  );
  if (active.length < 2) return active[0]?.label;
  for (const predicate of active) {
    const without = PREDICATES.filter((other) => other.key !== predicate.key);
    if (products.some((product) => without.every((other) => other.test(product, facets)))) return predicate.label;
  }
  return undefined;
}

const HIDDEN_CATEGORY = "Sofas & Chairs";

export function facetCounts(products: Product[]) {
  const category = new Map<string, number>();
  const colour = new Map<string, number>();
  for (const product of products) {
    if (product.category) category.set(product.category, (category.get(product.category) ?? 0) + 1);
    for (const family of productColours(product)) colour.set(family, (colour.get(family) ?? 0) + 1);
  }
  const bySize = (a: [string, number], b: [string, number]) => b[1] - a[1];
  return {
    /* Decided: "Sofas & Chairs" is no longer offered as a top-level category,
       since /collections/sofas-chairs now 301s to living-room. The facet is
       hidden, not deleted — product data is untouched, so the 38 pieces still
       appear in unfiltered listings and in search. Recorded in CHANGES.md. */
    category: [...category.entries()].filter(([name]) => name !== HIDDEN_CATEGORY).sort(bySize),
    colour: [...colour.entries()].sort(bySize),
  };
}
