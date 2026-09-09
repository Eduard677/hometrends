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
  { slug: "sofas-chairs", label: "Living room", image: "/media/editorial/collection-living.webp", position: "50% 48%" },
  { slug: "dining", label: "Dining room", image: "/media/editorial/collection-dining.webp", position: "72% 50%" },
  { slug: "beds-mattresses", label: "Bedroom", image: "/media/editorial/collection-bedroom.webp", position: "50% 40%" },
  { slug: "flooring", label: "Flooring", image: "/media/category/flooring.jpg", position: "50% 55%" },
  { slug: "garden-furniture", label: "Garden", image: "/media/editorial/garden.webp", position: "50% 40%" },
] as const;

/**
 * The rooms other than the one being viewed.
 *
 * Matched on label as well as slug: /collections/living-room and the rail's
 * "Living room" (which points at sofas-chairs) are different collections about
 * the same room, and offering someone the room they are already in reads as a
 * bug. On a collection that is not one of the five, all five are "other".
 */
export function otherRooms(currentSlug?: string, currentLabel?: string) {
  const label = currentLabel?.trim().toLowerCase();
  return ROOMS.filter((room) => room.slug !== currentSlug && room.label.toLowerCase() !== label);
}
