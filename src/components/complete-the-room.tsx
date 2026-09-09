import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { roomPhotoFor } from "./editorial-cell";
import { SiteImage } from "./site-image";

/**
 * Layout pass. Replaces RelatedRail on the product page: up to three related
 * cards plus one room photograph, per the sketch.
 *
 * A separate file rather than a change to chrome.tsx, which holds RelatedRail
 * alongside the header and has to stay byte-identical this pass.
 *
 * The room photo comes from the editorial pool, which lives under
 * /media/editorial. Related products are catalogue photography under
 * /media/catalogue, so the wide cell can never repeat a cutout in its own row.
 * If the pool yields nothing the cell is skipped rather than left empty.
 */
export function CompleteTheRoom({ products, slug, category }: { products: Product[]; slug: string; category?: string }) {
  if (!products.length) return null;
  const cards = products.slice(0, 3);
  const room = roomPhotoFor(slug, category);

  return (
    <section className="complete" aria-labelledby="complete-heading">
      <p className="eyebrow">The room around it</p>
      <h2 id="complete-heading">Complete the room</h2>
      <div className="complete__row">
        {cards.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
        {room ? (
          <figure className="complete__room">
            <SiteImage src={room.image} alt={room.alt} width={800} height={1000} loading="lazy" />
            <figcaption>{room.label}</figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
