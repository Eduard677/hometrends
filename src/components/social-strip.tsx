import { Instagram } from "lucide-react";
import { STORE } from "@/lib/store";

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
 * Desktop pass §5. A curated, fixed set — not a live "latest 6" pull, which
 * this build never had anyway (the manifest records "fetched": [], so there
 * are no post permalinks).
 *
 * `postId` is the field that will carry the real Instagram post IDs once
 * supplied; see the TODO in CHANGES.md. Until then every tile links to the
 * profile, which is honest — a fabricated permalink would 404.
 *
 * Interim selection is showroom and product photography only. The meme reel
 * still and the customer-review graphic are deliberately excluded: they read
 * as social filler in a layout this size, where the lead image is full width.
 */
type Tile = { src: string; alt: string; postId: string | null };

const LEAD: Tile = {
  src: "/media/instagram/1-DWPTopHDCc2.jpg",
  alt: "A Natural Sleep Company Sleep Rest 800 mattress on the showroom floor, photographed close along its quilted edge, with slatted wooden bed frames behind.",
  postId: null,
};

const ROW: Tile[] = [
  {
    src: "/media/instagram/bedroom-sage.jpg",
    alt: "A dark grey channel-stitched headboard against a sage green wall, dressed in cream and sage bedding beneath two framed botanical prints.",
    postId: null,
  },
  {
    src: "/media/instagram/antrim-bed.jpg",
    alt: "A pale grey upholstered bed on black tapered legs beside a matching two-drawer bedside locker, under a framed print.",
    postId: null,
  },
  {
    src: "/media/instagram/4-DYz-Vu-Mmn2.jpg",
    alt: "A mattress on an upholstered divan base on the showroom floor, in a post captioned Shop for less with Home Trends Furniture.",
    postId: null,
  },
];

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
          <img src={LEAD.src} alt={LEAD.alt} loading="lazy" decoding="async" />
        </a>
      </figure>
      <ul className="social__row">
        {ROW.map((tile) => (
          <li key={tile.src}>
            <a href={hrefFor(tile)} target="_blank" rel="noreferrer">
              <img src={tile.src} alt={tile.alt} loading="lazy" decoding="async" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
