import { Instagram } from "lucide-react";
import { STORE } from "@/lib/store";
import { SiteImage } from "./site-image";

/**
 * The account header, then one wide image with three beneath it.
 *
 * TikTok is deliberately absent. No TikTok URL exists in the repo or in
 * src/lib/store, and guessing a handle or rendering a dead button is not on.
 * Add `tiktok` and `tiktokHandle` to STORE and a second account row belongs
 * beside the Instagram one.
 *
 * No captions, like counts, comment counts, timestamps or follower number —
 * none of that data exists here.
 */
const HANDLE = "@hometrends.ennis";

/**
 * Curated set of six showroom and product shots. Not a live Instagram pull —
 * `public/media/instagram/manifest.json` records `"fetched": []`.
 *
 * The meme reel still (`2-DQ2IhG3jHAb`) and the customer-review graphic
 * (`3-DQCoQyJDMLJ`) are excluded. So is the duplicate mattress file
 * (`c1-65573527`) and the delivery-truck shot.
 *
 * Layout is one full-width lead plus three in a row. The page shows the
 * first four of this six-shot set; the last two stay in the list so post
 * IDs map 1:1 when supplied. `postId` is empty until then — see CHANGES.md.
 * Until then every tile links to the profile; a fabricated permalink would 404.
 */
type Tile = { src: string; alt: string; postId: string | null };

const SHOTS: [Tile, Tile, Tile, Tile, Tile, Tile] = [
  {
    src: "/media/gallery/01.jpg",
    alt: "A sage channel-stitched bed dressed in cream and green bedding on the Home Trends showroom floor.",
    postId: null,
  },
  {
    src: "/media/instagram/1-DWPTopHDCc2.jpg",
    alt: "A Natural Sleep Company Sleep Rest 800 mattress on the showroom floor, photographed close along its quilted edge.",
    postId: null,
  },
  {
    src: "/media/gallery/02.jpg",
    alt: "A tan buttoned leather wing chair beside nested glass side tables and a black floor lamp.",
    postId: null,
  },
  {
    src: "/media/gallery/03.jpg",
    alt: "An oak desk and black chair against a sage wall, with a bookcase and a desk lamp.",
    postId: null,
  },
  {
    src: "/media/gallery/04.jpg",
    alt: "A grey channel-stitched sleigh bed with white bedding on a patterned rug.",
    postId: null,
  },
  {
    src: "/media/editorial/from-shop-mink.jpg",
    alt: "A mink buttoned velvet sleigh bed dressed in white linen.",
    postId: null,
  },
];

const LEAD = SHOTS[0];
const ROW = SHOTS.slice(1, 4);

const hrefFor = (tile: Tile) =>
  tile.postId ? `https://www.instagram.com/p/${tile.postId}/` : STORE.instagram;

export function SocialStrip() {
  return (
    <section className="social ed-sec" aria-labelledby="social-heading">
      <div className="social__accounts">
        <a className="social__account" href={STORE.instagram} target="_blank" rel="noreferrer">
          <span className="social__badge" aria-hidden="true">
            <Instagram size={20} strokeWidth={1.6} />
          </span>
          <span className="social__handle">
            <strong id="social-heading">{HANDLE}</strong>
            <span>
              {STORE.name}, {STORE.town}
            </span>
          </span>
          {/* A link, not a button: following happens on Instagram. */}
          <span className="social__follow">Follow</span>
        </a>
      </div>
      <figure className="social__lead">
        <a href={hrefFor(LEAD)} target="_blank" rel="noreferrer">
          <SiteImage
            src={LEAD.src}
            alt={LEAD.alt}
            sizes="(min-width: 900px) 1248px, 92vw"
            loading="lazy"
            decoding="async"
          />
        </a>
      </figure>
      <ul className="social__row">
        {ROW.map((tile) => (
          <li key={tile.src}>
            <a href={hrefFor(tile)} target="_blank" rel="noreferrer">
              <SiteImage
                src={tile.src}
                alt={tile.alt}
                sizes="(min-width: 900px) 410px, 30vw"
                loading="lazy"
                decoding="async"
              />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
