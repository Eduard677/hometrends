import { SiteImage } from "./site-image";

/**
 * Structural pass §3. At most two editorial cells per listing page, after row 3
 * and row 9, using a room-set image from the site that is not a product photo.
 * If no suitable image is left for a page, the cell is skipped rather than
 * repeating one already on screen.
 *
 * Product photography lives under /media/catalogue/; everything here is
 * editorial, so a cell can never duplicate a card in its own grid.
 */
export type Editorial = { image: string; label: string; alt: string };

const POOL: Editorial[] = [
  {
    image: "/media/editorial/room-living-new.jpg",
    label: "Sofas made for everyday living",
    alt: "An oatmeal sofa beside a fire in a living room",
  },
  {
    image: "/media/editorial/shop-room-bedroom.webp",
    label: "Beds built for a full night",
    alt: "A made bed with linen bedding in the Home Trends showroom, Ennis",
  },
  {
    image: "/media/editorial/from-shop-dining.jpg",
    label: "Tables you gather at",
    alt: "A dining table laid in the Home Trends showroom, Ennis",
  },
  {
    image: "/media/editorial/room-bedroom-new.jpg",
    label: "Bedroom furniture that lasts",
    alt: "A bedroom set in soft daylight",
  },
];

/**
 * A room photograph that suits the product's own room, so a dining page does not
 * illustrate "Complete the room" with a bedroom. Falls back to the deterministic
 * pick when the category has no match in the pool.
 */
const ROOM_BY_CATEGORY: [RegExp, string][] = [
  [/dining/i, "/media/editorial/from-shop-dining.jpg"],
  [/sofa|living|chair|footstool/i, "/media/editorial/room-living-new.jpg"],
  [/bed|mattress/i, "/media/editorial/shop-room-bedroom.webp"],
];

export function roomPhotoFor(key: string, category?: string): Editorial | undefined {
  const match = category ? ROOM_BY_CATEGORY.find(([test]) => test.test(category)) : undefined;
  const preferred = match ? POOL.find((item) => item.image === match[1]) : undefined;
  return preferred ?? editorialFor(key)[0];
}

/**
 * Two cells for a page, skipping any image already used as that page's plate.
 * Deterministic per page so the same listing does not reshuffle on re-render.
 */
export function editorialFor(key: string, exclude?: string): Editorial[] {
  const available = POOL.filter((item) => item.image !== exclude);
  if (!available.length) return [];
  let seed = 0;
  for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const first = available[seed % available.length];
  const second = available[(seed + 1) % available.length];
  return second && second.image !== first.image ? [first, second] : [first];
}

export function EditorialCell({ item }: { item: Editorial }) {
  return (
    <figure className="editorial-cell">
      <SiteImage
        src={item.image}
        alt={item.alt}
        width={800}
        height={1000}
        sizes="(min-width: 900px) 420px, 46vw"
        loading="lazy"
      />
      <figcaption>{item.label}</figcaption>
    </figure>
  );
}
