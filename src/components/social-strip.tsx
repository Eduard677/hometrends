import { Instagram } from "lucide-react";
import { STORE } from "@/lib/store";

/**
 * Layout pass §7. Reads as a profile rather than a photo row: an account
 * header with a Follow affordance, then a square grid.
 *
 * TikTok is deliberately absent. No TikTok URL exists in the repo or in
 * src/lib/store, and the pass forbids guessing a handle or rendering a dead
 * button. Add `tiktok` and `tiktokHandle` to STORE and a second account row
 * belongs beside the Instagram one.
 *
 * Every tile links to the profile, not to a post URL nobody has:
 * public/media/instagram/manifest.json records "fetched": [], so there are no
 * permalinks. No captions, no like counts, no comment counts, no timestamps,
 * and no follower number — that figure is not known.
 */
const HANDLE = "@hometrends.ennis";

/**
 * The tiles are the images in public/media/instagram that survive a square
 * crop intact. Three files in that folder are deliberately not here:
 *
 *   c1-65573527.jpg  byte-identical to 1-DWPTopHDCc2.jpg (same md5). Showing
 *                    one photograph twice under two different descriptions
 *                    would invent a distinction that does not exist.
 *   queen-ann.jpg    both are screen captures of the Instagram web app rather
 *   desk.jpg         than photographs: a strip of browser sidebar is baked
 *                    into the left edge and survives an object-fit: cover
 *                    square crop. antrim-bed.jpg and bedroom-sage.jpg come
 *                    from the same capture session, but their chrome sits in
 *                    the band a square crop discards, so they are clean.
 *
 * Alt text describes what is actually in each frame, including the text burned
 * into the posts that carry an overlay.
 */
const TILES = [
  {
    src: "/media/instagram/1-DWPTopHDCc2.jpg",
    alt: "A Natural Sleep Company Sleep Rest 800 mattress on the showroom floor, photographed close along its quilted edge, with slatted wooden bed frames behind.",
  },
  {
    src: "/media/instagram/bedroom-sage.jpg",
    alt: "A dark grey channel-stitched headboard against a sage green wall, dressed in cream and sage bedding beneath two framed botanical prints.",
  },
  {
    src: "/media/instagram/3-DQCoQyJDMLJ.jpg",
    alt: "Two members of the Home Trends team at the reception desk beneath the showroom wordmark, in a post captioned about a team meeting.",
  },
  {
    src: "/media/instagram/antrim-bed.jpg",
    alt: "A pale grey upholstered bed on black tapered legs beside a matching two-drawer bedside locker, under a framed print.",
  },
  {
    src: "/media/instagram/4-DYz-Vu-Mmn2.jpg",
    alt: "A mattress on an upholstered divan base on the showroom floor, in a post captioned Shop for less with Home Trends Furniture.",
  },
  {
    src: "/media/instagram/2-DQ2IhG3jHAb.jpg",
    alt: "A post sharing two five-star customer reviews of Home Trends Ennis, laid out over a phone graphic.",
  },
];

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
      <ul className="social__grid">
        {TILES.map((tile) => (
          <li key={tile.src}>
            {/* Links to the profile: no post permalinks exist for these files. */}
            <a href={STORE.instagram} target="_blank" rel="noreferrer">
              <img src={tile.src} alt={tile.alt} loading="lazy" decoding="async" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
