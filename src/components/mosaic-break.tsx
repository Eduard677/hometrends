import { SiteImage } from "./site-image";
import type { Editorial } from "./editorial-cell";

/**
 * Desktop pass §4. An editorial break in the product flow: one large tile at
 * 2/3 width beside two smaller tiles stacked at 1/3.
 *
 * `flip` alternates the large tile between left and right on successive
 * blocks, so a long listing does not settle into a repeating pattern. The
 * caller owns that index, since only it knows how many blocks came before.
 *
 * Editorial only — never product cards. The images come from the same
 * editorial pool the single-cell break uses, all of which live under
 * /media/editorial, so a mosaic can never repeat a catalogue cutout sitting in
 * the same grid.
 */
export function MosaicBreak({ items, flip = false }: { items: Editorial[]; flip?: boolean }) {
  const [lead, ...rest] = items;
  if (!lead) return null;
  const stacked = rest.slice(0, 2);

  return (
    <section className={`mosaic${flip ? " mosaic--flip" : ""}`} aria-label="Featured">
      <figure className="mosaic__lead">
        <SiteImage src={lead.image} alt={lead.alt} width={1200} height={900} sizes="(min-width: 900px) 840px, 92vw" loading="lazy" />
        <figcaption>{lead.label}</figcaption>
      </figure>
      <div className="mosaic__stack">
        {stacked.map((item) => (
          <figure key={item.image}>
            <SiteImage src={item.image} alt={item.alt} width={800} height={600} sizes="(min-width: 900px) 420px, 46vw" loading="lazy" />
            <figcaption>{item.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
