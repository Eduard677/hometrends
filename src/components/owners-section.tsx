export function OwnersSection() {
  return <section className="owners-section ed-sec" id="intro" aria-labelledby="owners-heading">
    <div className="owners-section__copy"><p className="eyebrow">Your local furniture shop</p><h2 id="owners-heading">Finbar and Eileen</h2>
      <p>Home Trends is a family-owned furniture showroom in Ennis, run by Finbar and Eileen Keaveney since 2013.</p>
      <p>Visit us in the centre of Ennis to explore furniture, fabrics and flooring in person.</p>
    </div>
    {/* Structural pass §4. The supplied crop, 4:5, no CSS filter - the grade is
        taken as correct. The placeholder slot it replaced is gone. webp is
        declared directly rather than through SiteImage, which only serves
        entries present in the generated site-media.json. */}
    <picture className="owners-section__portrait">
      <source type="image/webp" srcSet="/media/story/finbar-eileen.webp" />
      <img
        src="/media/story/finbar-eileen.jpg"
        alt="Finbar and Eileen Keaveney in their Ennis furniture showroom."
        width={1106}
        height={1382}
        loading="lazy"
        decoding="async"
      />
    </picture>
  </section>;
}
