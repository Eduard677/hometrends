import { Link } from "@tanstack/react-router";
import { otherRooms } from "@/lib/rooms";
import { SiteImage } from "./site-image";

/**
 * Structural pass §3. Links the other rooms already on the homepage rail.
 * Headed "More rooms" — explicitly not "Also on this floor".
 */
export function MoreRooms({ currentSlug, currentLabel }: { currentSlug?: string; currentLabel?: string }) {
  const rooms = otherRooms(currentSlug, currentLabel);
  if (!rooms.length) return null;
  return (
    <section className="more-rooms" aria-labelledby="more-rooms-heading">
      <h2 id="more-rooms-heading">More rooms</h2>
      <ul>
        {rooms.map((room) => (
          <li key={room.slug}>
            <Link to="/collections/$slug" params={{ slug: room.slug }}>
              <figure>
                <SiteImage
                  src={room.image}
                  alt={`${room.label} furniture at Home Trends Furniture, Ennis`}
                  width={600}
                  height={450}
                  loading="lazy"
                  style={{ objectPosition: room.position ?? "50% 50%" }}
                />
              </figure>
              <span>{room.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
