import { useEffect, useState } from "react";
import { STORE } from "@/lib/store";
import { showroomStatus } from "@/lib/showroom-hours";
import { SiteImage } from "./site-image";

export function VisitSection() {
  const [status, setStatus] = useState<string | null>(null);
  useEffect(() => {
    const update = () => setStatus(showroomStatus(new Date()));
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return <section className="visit-section ed-sec" id="visit" aria-labelledby="visit-heading">
    <div className="visit-section__copy">
      <p className="eyebrow">Visit Home Trends</p><h2 id="visit-heading">See it, try it,<br />take your time</h2>
      <p>Explore furniture, flooring and fabrics in person.</p>
      <p className="visit-section__status" role="status">{status ?? "Mon–Sat 09:30–18:00 · Sunday closed"}</p>
      <div className="visit-section__actions"><a className="button visit-section__phone" href={STORE.phoneHref}>Call {STORE.phone}</a><a className="visit-section__directions" href={STORE.maps} target="_blank" rel="noreferrer">Get directions →</a></div>
      <address>{STORE.address}</address>
      {/* Phase 2. The hours were printed twice in this one block — once by the
          live status line above (which falls back to this exact string) and
          again here. The footer carries the third. Status line and footer kept. */}
      <p>Public parking on Parnell Street and a short walk from Friary &amp; Cornmarket car parks.</p>
      <p className="visit-section__family">Family-owned since 2013</p>
    </div>
    <figure><SiteImage src="/media/story/shopfront-parnell-street.jpg" alt="Home Trends Furniture shopfront at 29 Parnell Street, Ennis" width={1200} height={900} sizes="(min-width: 900px) 600px, 92vw" loading="lazy" /></figure>
  </section>;
}
