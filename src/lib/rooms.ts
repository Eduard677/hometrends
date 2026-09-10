/**
 * The five rooms already on the homepage rail. Lifted out of index.tsx so the
 * "More rooms" block on listing pages links the same five without a second
 * definition drifting from it.
 *
 * Structural pass §1: do not add a room, do not change which five appear.
 */
export type Room = {
  slug: string;
  label: string;
  image: string;
  position?: string;
};

export const ROOMS: readonly Room[] = [
  /* Phase 2. Was labelled "Living room" while linking to sofas-chairs, so the
     tile promised one collection and delivered another, and the homepage
     disagreed with the footer and mega menu. The two collections are disjoint
     — living-room is 70 tables/storage pieces, sofas-chairs is 78 seating
     pieces, zero products in both — so nothing is merged or redirected; the
     label now names where the tile actually goes. */
  { slug: "living-room", label: "Living room", image: "/media/editorial/collection-living.webp", position: "50% 50%" },
  { slug: "dining", label: "Dining room", image: "/media/editorial/collection-dining.webp", position: "50% 50%" },
  { slug: "beds-mattresses", label: "Bedroom", image: "/media/editorial/collection-bedroom.webp", position: "50% 40%" },
  { slug: "flooring", label: "Flooring", image: "/media/category/flooring.jpg", position: "50% 55%" },
  { slug: "garden-furniture", label: "Garden", image: "/media/editorial/garden.webp", position: "50% 40%" },
] as const;

/**
 * The rooms other than the one being viewed.
 *
 * Matched on label as well as slug. The label case mattered while the rail's
 * "Living room" pointed at sofas-chairs; the label now matches its slug, so
 * this is belt and braces rather than a live special case. On a collection
 * that is not one of the five, all five are "other".
 */
export function otherRooms(currentSlug?: string, currentLabel?: string) {
  const label = currentLabel?.trim().toLowerCase();
  return ROOMS.filter((room) => room.slug !== currentSlug && room.label.toLowerCase() !== label);
}
