import { Instagram } from "lucide-react";
import { STORE } from "@/lib/store";

/**
 * Layout pass §7. Replaces the four loose showroom photographs with something
 * that reads as a profile: a handle row, then a square grid.
 *
 * TikTok is deliberately absent. No TikTok URL exists in the repo or in
 * src/lib/store, and the pass forbids guessing a handle or rendering a dead
 * button. Add the real URL to STORE and this block will carry it.
 *
 * Every tile is a real image already in the repo and links to the profile, not
 * to a post URL nobody has: public/media/instagram/manifest.json records
 * "fetched": [], so there are no post permalinks to link to. No like counts, no
 * captions, no invented usernames.
 */
const HANDLE = "@hometrends.ennis";

/** Photographs already in the repo, under public/media/instagram. */
const TILES = [
  { src: "/media/instagram/1-DWPTopHDCc2.jpg", alt: "A room set on the Home Trends floor, Ennis" },
  { src: "/media/instagram/2-DQ2IhG3jHAb.jpg", alt: "Furniture on display at Home Trends, Ennis" },
  { src: "/media/instagram/3-DQCoQyJDMLJ.jpg", alt: "A corner of the Home Trends showroom, Ennis" },
  { src: "/media/instagram/4-DYz-Vu-Mmn2.jpg", alt: "A styled setting at Home Trends, Ennis" },
  { src: "/media/instagram/antrim-bed.jpg", alt: "The Antrim bed dressed on the Home Trends floor, Ennis" },
  { src: "/media/instagram/bedroom-sage.jpg", alt: "A sage bedroom setting at Home Trends, Ennis" },
  { src: "/media/instagram/queen-ann.jpg", alt: "A Queen Anne chair at Home Trends, Ennis" },
  { src: "/media/instagram/desk.jpg", alt: "A desk set up in the Home Trends showroom, Ennis" },
  { src: "/media/instagram/c1-65573527.jpg", alt: "Seating on the Home Trends floor, Ennis" },
];

export function SocialStrip() {
  return (
    <section className="social ed-sec" aria-labelledby="social-heading">
      <div className="social__accounts">
        <a className="social__account" href={STORE.instagram} target="_blank" rel="noreferrer">
          <Instagram size={20} strokeWidth={1.6} aria-hidden="true" />
          <span className="social__handle">
            <strong id="social-heading">{HANDLE}</strong>
            <span>Follow on Instagram</span>
          </span>
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
