import { Link, createFileRoute } from "@tanstack/react-router";
import { RoomTiles } from "@/components/room-tiles";
import { SocialStrip } from "@/components/social-strip";
import { ProductGrid } from "@/components/product-card";
import { OwnersSection } from "@/components/owners-section";
import { VisitSection } from "@/components/visit-section";
import { Reviews } from "@/components/reviews";
import { homepageFeatured, homepageFeaturedSecond } from "@/lib/catalog";
import { HeroMedia } from "@/components/hero-media";
import { ROOMS } from "@/lib/rooms";
import { SiteImage } from "@/components/site-image";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({ meta: [{ title: "Home Trends Furniture | Sofas, Beds, Dining & Flooring — Ennis, Co. Clare" }] }),
});


function Home() {
  return <main id="main" className="ed-page">
    {/* Layout pass. Order: hero, explore by space, founders, couch photo, first
        product row, one existing sentence, social, second product row, reviews,
        visit. Copy and photography are unchanged; only the sequence moved. */}
    <section className="ed-hero">
      <HeroMedia poster="/media/editorial/from-shop-hero.jpg" alt="A Home Trends dining table and chairs, with a sofa, rug and lit fire beyond" />
      <div className="ed-hero__copy"><h1>Furniture for real rooms</h1><p>Explore sofas, beds, dining, flooring and more at our Ennis showroom.</p>
        {/* Two actions, side by side at every width. The sketch has no third
            control, so the scroll cue that sat here is gone. */}
        <div className="ed-hero__actions"><Link to="/shop" className="button button--primary">Browse furniture</Link><Link to="/showroom" className="ed-hero__visit">Visit the showroom</Link></div>
      </div>
    </section>
    <RoomTiles heading="Explore by space" lead="Browse furniture and finishes for every part of your home." items={ROOMS} />
    <OwnersSection />
    <section className="spread"><figure><SiteImage src="/media/editorial/room-living-new.jpg" alt="An oatmeal sofa beside a fire in a living room" width={1792} height={1008} loading="lazy" /></figure>
      <p className="spread__cap"><span>Living room</span>Sofas made for everyday living<Link to="/collections/$slug" params={{ slug: "living-room" }}>Explore living room</Link></p>
    </section>
    <section className="ed-sec ed-band from-floor"><div className="from-floor__head"><div><p className="eyebrow">Featured furniture</p><h2>Find your next piece</h2></div><Link to="/shop" className="text-link">View all furniture</Link></div><ProductGrid products={homepageFeatured()} showWas={false} /></section>
    {/* One sentence already on the page, moved here rather than written new. It
        is the founders' second line; the living-room line is on the couch photo. */}
    <section className="ed-sec ed-note">
      <p>Visit us in the centre of Ennis to explore furniture, fabrics and flooring in person.</p>
    </section>
    <SocialStrip />
    {/* §8: no new heading. The existing "Featured furniture" eyebrow and the
        existing View all link only — the h2 belongs to the first row. */}
    <section className="ed-sec ed-band from-floor from-floor--second"><div className="from-floor__head"><p className="eyebrow">Featured furniture</p><Link to="/shop" className="text-link">View all furniture</Link></div><ProductGrid products={homepageFeaturedSecond()} showWas={false} /></section>
    <Reviews />
    <VisitSection />
  </main>;
}
