import { pageHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { RoomTiles } from "@/components/room-tiles";
import { SocialStrip } from "@/components/social-strip";
import { ScrollReveal } from "@/components/scroll-reveal";
import { MosaicBreak } from "@/components/mosaic-break";
import { editorialFor } from "@/components/editorial-cell";
import { ProductGrid } from "@/components/product-card";
import { OwnersSection } from "@/components/owners-section";
import { VisitSection } from "@/components/visit-section";
import { Reviews } from "@/components/reviews";
import { homepageFeatured } from "@/lib/catalog";
import { HeroMedia } from "@/components/hero-media";
import { ROOMS } from "@/lib/rooms";
import { SiteImage } from "@/components/site-image";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => pageHead({ title: "Home Trends Furniture | Sofas, Beds, Dining & Flooring — Ennis, Co. Clare", description: "Sofas, beds, mattresses, dining, flooring and rugs at Home Trends, 29 Parnell Street, Ennis. Irish family-owned since 2013.", path: "/" }),
});

/* The spread already uses room-living-new (oatmeal sofa beside a fire).
   The mosaic's living-room tile must not repeat it, and must not reuse the
   Explore-by-space crop. */
const HOME_MOSAIC_ITEMS = editorialFor("home").map((item) =>
  item.image === "/media/editorial/room-living-new.jpg"
    ? {
        ...item,
        image: "/media/editorial/errigel-corner.jpg",
        alt: "A beige corner sofa in a living room",
      }
    : item,
);

function Home() {
  return <main id="main" className="ed-page">
    {/* Layout pass. Order: hero, explore by space, founders, couch photo, one
        product band of four, one existing sentence, social, reviews, visit. */}
    <section className="ed-hero">
      <HeroMedia poster="/media/editorial/from-shop-hero.jpg" alt="A Home Trends dining table and chairs, with a sofa, rug and lit fire beyond" />
      <div className="ed-hero__copy"><h1>Furniture for real rooms</h1><p>Explore sofas, beds, dining, flooring and more at our Ennis showroom.</p>
        <div className="ed-hero__actions"><Link to="/shop" className="button button--primary">Browse furniture</Link><Link to="/showroom" className="ed-hero__visit">Visit the showroom</Link></div>
      </div>
    </section>
    <RoomTiles heading="Explore by space" lead="Browse furniture and finishes for every part of your home." items={ROOMS} />
    <OwnersSection />
    <section className="spread"><ScrollReveal><figure><SiteImage src="/media/editorial/room-living-new.jpg" alt="An oatmeal sofa beside a fire in a living room" width={1792} height={1008} loading="lazy" /></figure></ScrollReveal>
      <p className="spread__cap"><span>Living room</span>Sofas made for everyday living<Link to="/collections/$slug" params={{ slug: "living-room" }}>Explore living room</Link></p>
    </section>
    <section className="ed-sec ed-band from-floor"><div className="from-floor__head"><div><h2>On the floor · up to 50% off</h2></div><Link to="/shop" className="text-link">View all furniture</Link></div><ProductGrid products={homepageFeatured()} showWas={false} />
      {/* §4. The same mosaic component the listing grid uses, so the featured
          section and the shop break share one layout rather than two that
          drift. */}
      <MosaicBreak items={HOME_MOSAIC_ITEMS} />
    </section>
    {/* One sentence already on the page, moved here rather than written new. It
        is the founders' second line; the living-room line is on the couch photo. */}
    <section className="ed-sec ed-note">
      <p>Visit us in the centre of Ennis to explore furniture, fabrics and flooring in person.</p>
    </section>
    <SocialStrip />
    <Reviews />
    <VisitSection />
  </main>;
}
