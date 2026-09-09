import { SiteImage } from "./site-image";
export function OwnersSection() {
  return <section className="owners-section ed-sec" id="intro" aria-labelledby="owners-heading">
    <div className="owners-section__copy"><p className="eyebrow">Your local furniture shop</p><h2 id="owners-heading">Finbar and Eileen</h2>
      <p>Home Trends is a family-owned furniture showroom in Ennis, run by Finbar and Eileen Keaveney since 2013.</p>
      <p>Visit us in the centre of Ennis to explore furniture, fabrics and flooring in person.</p>
    </div>
    {/* Structural pass §4. The supplied crop, 4:5, no CSS filter - the grade is
        taken as correct.

        Now served through SiteImage, so it gets the webp source, jpg fallback
        and blur placeholder every other photograph already had. It was the
        last raw <picture> on the homepage. site-media.json carries an entry
        for /media/story/finbar-eileen.jpg, generated with the same settings as
        scripts/optimize-site-media.mjs but for that one file - the wholesale
        pass regenerates unrelated entries under a different sharp build.

        The wrapper keeps the .owners-section__portrait hook, which owns the
        4:5 frame; `main .site-image` is already display:block at 100%/100%, so
        it fills that frame without new CSS. */}
    <div className="owners-section__portrait">
      <SiteImage
        src="/media/story/finbar-eileen.jpg"
        alt="Finbar and Eileen Keaveney in their Ennis furniture showroom."
        width={1106}
        height={1382}
        loading="lazy"
      />
    </div>
  </section>;
}
