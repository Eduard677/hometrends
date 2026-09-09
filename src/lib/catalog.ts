import { euro } from "./store";
import shopJson from "@/data/ht-shop.json";
import productRedirects from "@/data/product-redirects.json";

export type ProductImage = { src: string; fallback?: string; blur?: string; alt: string; position?: number };
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  subcategory: string;
  shortDescription: string;
  description: string;
  material: string;
  dimensions: string;
  availability: string;
  image: string;
  images?: ProductImage[];
  /** From `hasRange`: display "From €" rather than a flat price. Independent of `cta`. */
  priceVaries?: boolean;
  /** From `cta`: "add" may add directly, "options" must route to the PDP. Never infer from `priceVaries`. */
  cta?: "add" | "options";
  /** False when every variant is unavailable. */
  inStock?: boolean;
  /** Option names vary well beyond Size and Colour — drive selectors off this, never a hardcoded list. */
  options?: { name: string; values: string[] }[];
  variants?: { id: string; title: string; label: string; price: number; compareAt?: number; available: boolean; options: string[] }[];
  imageAlt: string;
  featured?: boolean;
  newArrival?: boolean;
  irishMade?: boolean;
  bespoke?: boolean;
  showroomOnly?: boolean;
  /** Integer cents. Formatted only at render, via euro(). */
  fromPrice: number;
  priceMax?: number;
  priceUnit?: "cents";
  compareAt?: number;
  related: string[];
  tags: string[];
  origin?: string;
  sourceName?: string;
};

/** Vendor codes confirmed against Shopify `vendor` in public/data/ht-shop.json. */
const INTERNAL_NAME_SUFFIXES = new Set(["GI", "GIE", "GA", "HJ", "IM", "JB"]);

export function customerFacingName(name: string) {
  const trimmed = name.trim();
  const dashed = trimmed.match(/^(.*?)\s+-\s+([A-Z]{2,4})$/);
  const glued = trimmed.match(/^(.*?)-([A-Z]{2,4})$/);
  const spaced = trimmed.match(/^(.*?)\s+([A-Z]{2,4})$/);
  const match = dashed ?? glued ?? spaced;
  if (!match) return trimmed;
  if (!INTERNAL_NAME_SUFFIXES.has(match[2])) return trimmed;
  return match[1].replace(/[-\s]+$/, "").trim() || trimmed;
}

export type Collection = {
  slug: string;
  label: string;
  eyebrow: string;
  headline: string;
  support: string;
  image: string;
  aliases?: string[];
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "sofas-chairs",
    label: "Sofas & Chairs",
    eyebrow: "Living",
    headline: "Sofas, armchairs and loungers",
    support: "Sit with them in Ennis before you decide. Irish handmade pieces and the chairs that stay.",
    image: "/media/editorial/from-shop-living.jpg",
    aliases: ["sofas"],
  },
  {
    slug: "chairs-footstools",
    label: "Chairs & Footstools",
    eyebrow: "Living",
    headline: "Chairs for staying",
    support: "Fireside chairs, accent chairs, recliners and matching footstools.",
    image: "/media/editorial/search-seating.jpg",
  },
  {
    slug: "beds-mattresses",
    label: "Beds & Mattresses",
    eyebrow: "Bedroom",
    headline: "Beds and mattresses, tried on the floor",
    support:
      "Oak frames, upholstered beds, storage and mattresses in every size. Lie on them in the showroom — it is the only way to know.",
    image: "/media/editorial/from-shop-bedroom.jpg",
    aliases: ["bedroom"],
  },
  {
    slug: "beds",
    label: "Beds",
    eyebrow: "Bedroom",
    headline: "Wooden, fabric and storage beds",
    support: "From compact singles to king frames with drawers underneath.",
    image: "/media/editorial/from-shop-mink.jpg",
  },
  {
    slug: "mattresses",
    label: "Mattresses",
    eyebrow: "Rest",
    headline: "Mattresses to lie on first",
    support:
      "Pocket sprung, memory foam, and the Natural Sleep Co. range. Try them on the floor in Ennis.",
    image: "/media/editorial/from-shop-mattress.jpg",
  },
  {
    slug: "bedroom-furniture",
    label: "Bedroom furniture",
    eyebrow: "Bedroom",
    headline: "Headboards, lockers and storage",
    support: "The pieces that finish a bedroom once the bed is right.",
    image: "/media/editorial/room-bedroom-new.jpg",
  },
  {
    slug: "dining",
    label: "Dining",
    eyebrow: "Dining",
    headline: "Tables you gather at",
    support: "Extending oak, round breakfast tables, chairs, benches and sideboards.",
    image: "/media/editorial/from-shop-dining.jpg",
  },
  {
    slug: "dining-tables",
    label: "Dining Tables",
    eyebrow: "Dining",
    headline: "Dining tables",
    support: "Extending oak, round breakfast tables and fixed-top tables.",
    image: "/media/editorial/from-shop-dining.jpg",
  },
  {
    slug: "dining-chairs-benches",
    label: "Dining Chairs & Benches",
    eyebrow: "Dining",
    headline: "Dining chairs and benches",
    support: "Upholstered and timber chairs, benches and bar stools.",
    image: "/media/editorial/from-shop-dining.jpg",
  },
  {
    slug: "dining-sets",
    label: "Dining Sets",
    eyebrow: "Dining",
    headline: "Dining sets",
    support: "Table and seating sold together, sized for the room.",
    image: "/media/editorial/from-shop-dining.jpg",
  },
  {
    slug: "living-room",
    label: "Living Room",
    eyebrow: "Living",
    headline: "The quiet living room",
    support: "Coffee tables, media units, bookcases and the chairs that sit beside them.",
    image: "/media/living.webp",
  },
  {
    // DRAFT COPY - awaiting owner approval. The collection itself was
    // approved; the headline and support line below are mine, not the
    // shop's, and should be signed off before this ships.
    slug: "home-office",
    label: "Home office",
    eyebrow: "Working from home",
    headline: "Desks and chairs to work from",
    support:
      "Writing desks, corner desks and office chairs. Sit in the chair before you decide.",
    image: "/media/shopify/oak-writing-desk.jpg",
  },
  {
    slug: "rugs",
    label: "Rugs",
    eyebrow: "The second floor",
    headline: "Rugs that change a room",
    support:
      "Wool, flatweave, runners, traditional patterns and shaggy piles. Eileen’s note: a rug will change a room before anything else does.",
    image: "/media/editorial/from-shop-rugs.jpg",
  },
  {
    slug: "rugs-modern",
    label: "Modern rugs",
    eyebrow: "Rugs",
    headline: "Cleaner patterns, quieter floors",
    support: "Flatweaves and wool in contemporary colourways.",
    image: "/media/shopify/alisarug-beige-brown.jpg",
  },
  {
    slug: "rugs-traditional",
    label: "Traditional rugs",
    eyebrow: "Rugs",
    headline: "Pattern with a longer memory",
    support: "Woven patterns and runners that sit well with oak and walnut.",
    image: "/media/shopify/accrarug-cream-red.jpg",
  },
  {
    slug: "rugs-shaggy",
    label: "Shaggy rugs",
    eyebrow: "Rugs",
    headline: "Deep pile, soft underfoot",
    support: "Thick oatmeal and ivory piles for bedrooms and sitting rooms.",
    image: "/media/shopify/asherrug-grey-beige.jpg",
  },
  {
    slug: "kids-furniture",
    label: "Kids Furniture",
    eyebrow: "Children",
    headline: "Beds, desks and storage that grow with them",
    support: "Cabin beds, compact desks and wardrobes built for real bedrooms.",
    image: "/media/editorial/from-shop-kids.jpg",
  },
  {
    slug: "lighting",
    label: "Lighting",
    eyebrow: "Objects",
    headline: "Lamps within reach",
    support: "Table lamps and floor lamps to finish a corner.",
    image: "/media/editorial/menu-sconce.jpg",
  },
  {
    slug: "accessories",
    label: "Accessories",
    eyebrow: "Objects",
    headline: "Mirrors and the smaller pieces",
    support: "The last things a room needs — chosen in the showroom, not from a screen.",
    image: "/media/editorial/rooms-vase.jpg",
  },
  {
    slug: "objects",
    label: "Objects",
    eyebrow: "The finish",
    headline: "Lamps, mirrors and smaller pieces",
    support: "The things that complete a room once the furniture is in.",
    image: "/media/editorial/furniture-gallery-editorial.webp",
  },
  {
    slug: "flooring",
    label: "Flooring",
    eyebrow: "Underfoot",
    headline: "Flooring for the renovation",
    support:
      "Oak, herringbone and carpet samples on the showroom floor. We will walk you through the ranges — bring measurements.",
    image: "/rooms/flooring-samples.webp",
  },
  {
    slug: "garden-furniture",
    label: "Garden furniture",
    eyebrow: "Outside",
    headline: "Teak for Irish weather",
    support: "Outdoor dining and lounge pieces for the patio. Seasonal stock — telephone before you travel.",
    image: "/media/editorial/from-shop-garden.jpg",
  },
];

export const MENU = [
  {
    label: "Bedroom",
    items: [
      { label: "Mattresses", slug: "mattresses" },
      { label: "Beds", slug: "beds" },
      { label: "Bedroom furniture", slug: "bedroom-furniture" },
    ],
  },
  {
    label: "Sofas & chairs",
    items: [
      { label: "Sofas", slug: "living-room" },
      { label: "Chairs & footstools", slug: "chairs-footstools" },
      { label: "Living room", slug: "living-room" },
    ],
  },
  {
    label: "Rugs",
    items: [
      { label: "Modern", slug: "rugs-modern" },
      { label: "Traditional", slug: "rugs-traditional" },
      { label: "Shaggy", slug: "rugs-shaggy" },
    ],
  },
  {
    label: "Dining & more",
    items: [
      { label: "Dining", slug: "dining" },
      { label: "Kids furniture", slug: "kids-furniture" },
      { label: "Flooring", slug: "flooring" },
      { label: "Garden furniture", slug: "garden-furniture" },
    ],
  },
] as const;

export const HOME_MOSAIC: {
  slug: string;
  figure: string;
  alt: string;
  shape: "landscape" | "portrait" | "square";
  cutout?: boolean;
  from: number;
  span: number;
  row: number;
  offset: number;
  position?: string;
}[] = [
  {
    slug: "sofas-chairs",
    figure: "/media/editorial/shop-room-living.webp",
    alt: "A living room with a sofa, armchair and lamp",
    shape: "landscape",
    from: 1,
    span: 6,
    row: 1,
    offset: 0,
    position: "50% 56%",
  },
  {
    slug: "beds-mattresses",
    figure: "/media/editorial/collection-bedroom.webp",
    alt: "A considered bedroom with a timber bed",
    shape: "landscape",
    from: 7,
    span: 6,
    row: 1,
    offset: 2,
    position: "50% 48%",
  },
  {
    slug: "dining",
    figure: "/media/editorial/shop-room-dining.webp",
    alt: "A dining table set for a meal",
    shape: "landscape",
    from: 1,
    span: 6,
    row: 2,
    offset: 2,
    position: "50% 48%",
  },
  {
    slug: "living-room",
    figure: "/media/editorial/rooms-sofa.jpg",
    alt: "A sofa in late-afternoon light",
    shape: "landscape",
    from: 7,
    span: 6,
    row: 2,
    offset: 0,
    position: "38% 58%",
  },
  {
    slug: "rugs",
    figure: "/media/shopify/accrarug-grey-gold.jpg",
    alt: "A patterned wool rug",
    shape: "landscape",
    from: 1,
    span: 6,
    row: 3,
    offset: 0,
    position: "center center",
  },
  {
    slug: "flooring",
    figure: "/rooms/flooring.webp",
    alt: "Flooring in the Home Trends showroom",
    shape: "landscape",
    from: 7,
    span: 6,
    row: 3,
    offset: 2,
    position: "50% 50%",
  },
  {
    slug: "kids-furniture",
    figure: "/media/editorial/shop-room-bedroom.webp",
    alt: "A children’s bed with a canopy",
    shape: "landscape",
    from: 1,
    span: 6,
    row: 4,
    offset: 2,
    position: "50% 45%",
  },
  {
    slug: "objects",
    figure: "/media/editorial/furniture-gallery-editorial.webp",
    alt: "Showroom shelves of vases, bowls and lamps",
    shape: "landscape",
    from: 7,
    span: 6,
    row: 4,
    offset: 0,
    position: "50% 50%",
  },
];

/** Owner-confirmed non-stock. Kept so old URLs, bags and sitemaps can reject them. */
export const RETIRED_PRODUCT_SLUGS = ["modular-sofa", "corner-sofa"] as const;
export const RETIRED_PRODUCT_IDS = ["ERR-001", "ERR-002"] as const;
/* living-room is canonical; pointing at sofas-chairs would chain 301->301. */
export const RETIRED_PRODUCT_REDIRECT = "/collections/living-room" as const;

const RETIRED_SLUG_SET = new Set<string>(RETIRED_PRODUCT_SLUGS);
const RETIRED_ID_SET = new Set<string>(RETIRED_PRODUCT_IDS);

export function isRetiredProductSlug(slug: string) {
  return RETIRED_SLUG_SET.has(slug);
}

export function isRetiredProduct(item: Pick<Product, "id" | "slug">) {
  return RETIRED_ID_SET.has(item.id) || RETIRED_SLUG_SET.has(item.slug);
}

const SHOP: Product[] = (shopJson as Product[])
  .filter((item) => !isRetiredProduct(item))
  .map((item) => {
    const vendorish = /^(GIE|GI|Gannons|Wholesale|HJFurniture|HJ|Image|Home Trends|JB |Decor|IM\b)/i.test(item.material);
    return {
      ...item,
      sourceName: item.sourceName ?? item.name,
      name: customerFacingName(item.name),
      imageAlt: customerFacingName(item.imageAlt || item.name),
      compareAt: item.compareAt ?? undefined,
      material: vendorish ? "" : item.material,
    };
  });

for (const item of SHOP) {
  item.related = SHOP.filter(
    (other) => other.slug !== item.slug && other.tags.some((tag) => item.tags.includes(tag)),
  )
    .slice(0, 4)
    .map((other) => other.slug);
}

export const PRODUCTS: Product[] = SHOP;

const bySlug = new Map(PRODUCTS.map((item) => [item.slug, item]));
const collectionBySlug = new Map<string, Collection>();
for (const collection of COLLECTIONS) {
  collectionBySlug.set(collection.slug, collection);
  for (const alias of collection.aliases ?? []) collectionBySlug.set(alias, collection);
}

export function getProduct(slug: string) {
  return bySlug.get(productRedirect(slug) ?? slug);
}

export function productRedirect(slug: string) {
  return (productRedirects as Record<string, string>)[slug];
}

export function getCollection(slug: string) {
  return collectionBySlug.get(slug);
}

export function collectionProducts(slug: string) {
  const collection = getCollection(slug);
  const key = collection?.slug ?? slug;
  return PRODUCTS.filter((item) => item.tags.includes(key) || item.tags.includes(slug));
}

export function relatedProducts(product: Product) {
  return product.related.map((slug) => bySlug.get(slug)).filter((item): item is Product => Boolean(item));
}

export function searchProducts(query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return PRODUCTS;
  return PRODUCTS.filter((item) => {
    const hay = [
      item.name,
      item.sourceName ?? "",
      item.category,
      item.subcategory,
      item.shortDescription,
      item.material,
      item.origin ?? "",
      ...item.tags,
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(needle);
  });
}

/**
 * Layout pass. The dimensions line for the product page.
 *
 * 480 products carry a `dimensions` field. For the other 85 the sizes are
 * written into the description instead — the Chrissie table's "Table Size
 * 200 x 100 x 77cm" is the case the pass names. Those are read out of the
 * description only, and only where the text says so explicitly.
 *
 * Never parsed out of a supplier title, and nothing is inferred: a product with
 * neither a field nor an explicit size phrase returns undefined and the row is
 * omitted rather than guessed.
 */
const SIZE_PHRASE = /\b(?:[\w&]+\s+)?(?:size|dimensions?)\b[^.\n]*?\d+\s*x\s*\d+(?:\s*x\s*\d+)?\s*(?:cm|mm)?[^.\n]*/gi;

export function productDimensions(product: Product): string | undefined {
  const field = product.dimensions?.trim();
  if (field && !/confirm|in the showroom \/ to order/i.test(field)) return field;
  const matches = (product.description ?? "").match(SIZE_PHRASE);
  if (!matches?.length) return undefined;
  return matches.slice(0, 2).map((line) => line.trim().replace(/\s+/g, " ")).join(" · ");
}

export function priceLabel(product: Product) {
  const from = `${product.priceVaries ? "From " : ""}${euro(product.fromPrice)}`;
  if (product.showroomOnly) return `${from} / m²`;
  return from;
}

/**
 * Structural pass §2. A plain-text variant count under the title, driven off the
 * option name already in the data.
 *
 * Deliberately not colour dots: only 199 products carry a Colour option, those
 * hold 161 distinct colour names, and the catalogue stores no hex value or
 * swatch image for any of them. 227 of the 425 multi-variant products vary by
 * Size alone, so dots would be blank for most of the range. Revisit only if real
 * swatches or hex values are added.
 *
 * Six multi-variant products use neither Colour nor Size (Style, Storage,
 * Material, Headboard Design, Drawers, Amount). The spec does not cover them, so
 * they fall back to the option's own name rather than losing the information.
 */
export function variantSummary(product: Product): string | undefined {
  const options = product.options ?? [];
  if (!options.length) return undefined;
  // 18 single-variant products still carry an options array. "1 colour" offers
  // no choice, so they read as having none.
  if ((product.variants?.length ?? 0) < 2) return undefined;
  const count = (name: string) => options.find((option) => option.name === name)?.values.length ?? 0;
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

  const colours = count("Colour");
  const sizes = count("Size");
  if (colours && sizes) return `${plural(colours, "colour")} · ${plural(sizes, "size")}`;
  if (colours) return plural(colours, "colour");
  if (sizes) return `Available in ${plural(sizes, "size")}`;

  const other = options[0];
  if (!other?.values.length) return undefined;
  return plural(other.values.length, other.name.toLowerCase());
}

export function featuredProducts() {
  return PRODUCTS.filter((item) => item.featured);
}

/**
 * BRIEF.md 3.3, applied after the proposal in reports/featured-row-proposal.md
 * was accepted. The row previously offered one direct add-to-bag against five
 * "Choose options", which is a poor row to walk a basket through in front of
 * the owners. It now offers four of six.
 *
 * Also satisfies 2.4: the Cedarwood Nore Oak Bed and Erik Round Table shots
 * fight the muted palette and are no longer here. Both still appear in the
 * range listing.
 *
 * An explicit order, not a filter, because this is a merchandising decision:
 * the two additions were chosen from the 114 products that are single-variant,
 * in stock, multi-image and between EUR 200 and EUR 2,500, picking categories
 * the row did not already cover. Both additions are lifestyle shots: a white
 * gloss cutout on the cream ground washes out at card size, which is what the
 * first pick did.
 */
const HOMEPAGE_FEATURED = [
  "chrissie-dining-set",
  "vicenza-dining-chair-tuape",
  "chrissie-coffee-table",
  "lynn-accent-chair",
  "kilkenny-mink-bed",
  "capri-bar-stool",
] as const;

export function homepageFeatured() {
  return HOMEPAGE_FEATURED.map((slug) => bySlug.get(slug)).filter((item): item is Product => Boolean(item));
}

/**
 * Layout pass §8. The second homepage row: six more, never a repeat of the first
 * six.
 *
 * Four come from the remaining featured set. The other two featured products —
 * Cedarwood Nore Oak Bed and Erik Round Table — stay off the homepage: their
 * shots (a striped rug with rainbow pencil artwork, and a low-res
 * white-background composite) fight the muted palette, which is why they were
 * pulled earlier. This pass allows a catalogue source as well as featured, so
 * they are topped up from the catalogue rather than reinstated.
 *
 * The two additions are single-variant lifestyle shots, so the row carries some
 * direct add-to-bag: every remaining featured product needs variant selection.
 */
const HOMEPAGE_FEATURED_SECOND = [
  "brandon-armchair",
  "bray-accent-chair",
  "boston-sofa-bed",
  "kenmare-chair-and-footstool",
  "skye-rug-242",
  "stratford-2-door-wardrobe",
] as const;

export function homepageFeaturedSecond() {
  return HOMEPAGE_FEATURED_SECOND.map((slug) => bySlug.get(slug)).filter((item): item is Product => Boolean(item));
}




const SITE_PATHS = [
  "/",
  "/shop",
  "/find",
  "/about",
  "/showroom",
  "/come-in",
  "/contact",
  "/bespoke",
  "/delivery",
  "/returns",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

export function sitemapPaths() {
  const seen = new Set<string>();
  const paths: string[] = [];
  const push = (path: string) => {
    if (seen.has(path) || RETIRED_SLUG_SET.has(path.replace("/products/", ""))) return;
    seen.add(path);
    paths.push(path);
  };
  for (const path of SITE_PATHS) push(path);
  for (const collection of COLLECTIONS) push(`/collections/${collection.slug}`);
  for (const product of PRODUCTS) {
    if (isRetiredProduct(product)) continue;
    push(`/products/${product.slug}`);
  }
  return paths;
}
