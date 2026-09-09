import type { Product, Collection } from "./catalog";
import { STORE } from "./store";
import { PRODUCTS } from "./catalog";

export const SITE_ORIGIN = "https://hometrends-deploy.vercel.app";
export function localBusiness() { return {
  "@context": "https://schema.org", "@type": ["LocalBusiness", "FurnitureStore"],
  "@id": `${SITE_ORIGIN}/#showroom`, name: STORE.name, url: `${SITE_ORIGIN}/showroom`,
  telephone: "+353656797853", email: STORE.email, foundingDate: "2013",
  address: { "@type": "PostalAddress", streetAddress: "29 Parnell Street", addressLocality: "Ennis", addressRegion: "Co. Clare", postalCode: "V95 ED79", addressCountry: "IE" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:30", closes: "18:00" }],
  hasMap: STORE.maps,
}; }
export function productDescription(product: Product) {
  const detail = product.description.replace(/\s+/g, " ");
  // Read catalogue data only while rendering, after SSR modules initialize.
  const duplicateName = PRODUCTS.some(other => other.id !== product.id && other.name === product.name);
  const name = duplicateName ? `${product.name} (ref. ${product.id})` : product.name;
  const excerpt = detail.slice(0, Math.max(30, 110 - name.length)).replace(/\s+\S*$/, "").replace(/[.,;:]$/, "");
  return `${name}. ${excerpt}… Enquire at Home Trends Furniture, Ennis.`;
}
export function collectionDescription(collection: Collection) {
  return `Explore ${collection.label.toLowerCase()} at Home Trends Furniture in Ennis. Browse the range, then plan a visit to our Parnell Street showroom.`;
}
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org", "@type": "Product", name: product.name, productID: product.id,
    description: product.description, image: product.images?.map(image => SITE_ORIGIN + image.src),
    url: `${SITE_ORIGIN}/products/${product.slug}`,
    offers: { "@type": "AggregateOffer", priceCurrency: "EUR", lowPrice: product.fromPrice / 100,
      highPrice: Math.max(...(product.variants?.map(v => v.price) ?? [product.fromPrice])) / 100, offerCount: product.variants?.length ?? 1,
      seller: { "@id": `${SITE_ORIGIN}/#showroom` }, url: `${SITE_ORIGIN}/products/${product.slug}`,
    },
  };
}
export function safeJson(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
