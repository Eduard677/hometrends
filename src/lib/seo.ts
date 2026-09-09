import type { Product, Collection } from "./catalog";
import { STORE } from "./store";
import { PRODUCTS } from "./catalog";

export const SITE_ORIGIN = "https://hometrends-deploy.vercel.app";
export const SITE_NAME = "Home Trends Furniture";
const TITLE_SUFFIX = ` | ${SITE_NAME}`;
const ENQUIRY_SUFFIX = " Enquire at Home Trends Furniture, Ennis.";
const META_MAX = 155;
/* The share card shipped with the site. 1200x630, confirmed on disk. */
export const DEFAULT_OG_IMAGE: OgImage = { src: "/og.jpg", width: 1200, height: 630 };
export type OgImage = { src: string; width: number; height: number; alt?: string };

export function absolute(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * One place that builds a page's title, description, canonical and share tags,
 * so the 16 routes stop each inventing their own. og:title is the <title>
 * minus the site suffix, per the brief.
 */
export function pageHead(input: {
  title: string;
  description: string;
  path: string;
  image?: OgImage;
  type?: "website" | "product";
}) {
  const { title, description, path, type = "website" } = input;
  const image = input.image ?? DEFAULT_OG_IMAGE;
  const url = absolute(path);
  const ogTitle = title.endsWith(TITLE_SUFFIX) ? title.slice(0, -TITLE_SUFFIX.length) : title;
  const imageUrl = absolute(image.src);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: ogTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_IE" },
      { property: "og:image", content: imageUrl },
      { property: "og:image:width", content: String(image.width) },
      { property: "og:image:height", content: String(image.height) },
      ...(image.alt ? [{ property: "og:image:alt", content: image.alt }] : []),
      { name: "twitter:title", content: ogTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

/** BreadcrumbList for PDPs and collection pages; the visual trail already exists. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: absolute(step.path),
    })),
  };
}
export function localBusiness() { return {
  "@context": "https://schema.org", "@type": ["LocalBusiness", "FurnitureStore"],
  "@id": `${SITE_ORIGIN}/#showroom`, name: STORE.name, url: `${SITE_ORIGIN}/showroom`,
  telephone: "+353656797853", email: STORE.email, foundingDate: "2013",
  address: { "@type": "PostalAddress", streetAddress: "29 Parnell Street", addressLocality: "Ennis", addressRegion: "Co. Clare", postalCode: "V95 ED79", addressCountry: "IE" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:30", closes: "18:00" }],
  hasMap: STORE.maps,
  /* Ennis, Co. Clare. Coordinates for 29 Parnell Street. */
  geo: { "@type": "GeoCoordinates", latitude: 52.8436, longitude: -8.9864 },
  sameAs: [STORE.instagram, STORE.maps],
}; }
export function productDescription(product: Product) {
  /* Phase 1. Was: `${name}. ${detail.slice(0, 110 - name.length)}…` — a fixed
     character budget that cut mid-sentence ("…velvet material. This…") and
     repeated the product name that already leads the <title>. Now: no name
     prefix, and the cut lands on a sentence boundary where one is available,
     otherwise a word boundary, never mid-word. Capped at 155 including the
     suffix. */
  const detail = product.description.replace(/\s+/g, " ").trim();
  const budget = META_MAX - ENQUIRY_SUFFIX.length;
  if (detail.length <= budget) return `${detail}${ENQUIRY_SUFFIX}`;
  const window = detail.slice(0, budget - 1);
  const sentence = window.lastIndexOf(". ");
  const space = window.lastIndexOf(" ");
  // Only honour a sentence break if it keeps a useful amount of the text.
  const cut = sentence >= budget * 0.5 ? sentence + 1 : space > 0 ? space : window.length;
  const trimmed = detail.slice(0, cut).replace(/[\s.,;:]+$/, "");
  return `${trimmed}…${ENQUIRY_SUFFIX}`;
}

export function collectionDescription(collection: Collection) {
  return `Explore ${collection.label.toLowerCase()} at Home Trends Furniture in Ennis. Browse the range, then plan a visit to our Parnell Street showroom.`;
}
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org", "@type": "Product", name: product.name, productID: product.id,
    /* sku is the shop's own catalogue id. brand and offers.availability are
       deliberately absent: ht-shop.json carries no brand field, and its
       `availability` string is empty on all 742 products, so either would be
       invented merchandising data. See CLAUDE.md. */
    sku: product.id, itemCondition: "https://schema.org/NewCondition",
    description: product.description, image: product.images?.map(image => SITE_ORIGIN + image.src),
    url: `${SITE_ORIGIN}/products/${product.slug}`,
    offers: { "@type": "AggregateOffer", priceCurrency: "EUR", lowPrice: product.fromPrice / 100,
      highPrice: Math.max(...(product.variants?.map(v => v.price) ?? [product.fromPrice])) / 100, offerCount: product.variants?.length ?? 1,
      seller: { "@id": `${SITE_ORIGIN}/#showroom` }, url: `${SITE_ORIGIN}/products/${product.slug}`,
    },
  };
}
export function safeJson(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
