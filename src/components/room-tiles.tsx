import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SiteImage } from "./site-image";

export type RoomTile = {
  slug: string;
  label: string;
  image: string;
  position?: string;
};

export function RoomTiles({
  heading,
  lead,
  items,
}: {
  heading: string;
  lead?: string;
  items: readonly RoomTile[];
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [active, setActive] = useState(0);

  const sync = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    setAtStart(rail.scrollLeft <= 1);
    setAtEnd(rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1);
  }, []);

  useEffect(() => {
    sync();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      rail.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  function scrollBy(direction: 1 | -1) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector<HTMLElement>(".room-tiles__card");
    const step = card ? card.getBoundingClientRect().width + 18 : rail.clientWidth * 0.7;
    rail.scrollBy({
      left: step * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  function goTo(index: number) {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelectorAll<HTMLElement>(".room-tiles__card")[index];
    if (!card) return;
    rail.scrollTo({
      left: card.offsetLeft - rail.offsetLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const onScroll = () => {
      const cards = [...rail.querySelectorAll<HTMLElement>(".room-tiles__card")];
      if (!cards.length) return;
      const mid = rail.scrollLeft + rail.clientWidth / 2;
      let nearest = 0;
      let best = Infinity;
      cards.forEach((card, i) => {
        const center = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < best) {
          best = d;
          nearest = i;
        }
      });
      setActive(nearest);
    };
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => rail.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="room-tiles" aria-label={heading}>
      <header className="room-tiles__head">
        <div>
          <h2>{heading}</h2>
          {lead ? <p>{lead}</p> : null}
        </div>
      </header>
      <div className="room-tiles__stage">
        <div className="room-tiles__scroller">
          <div ref={railRef} className="room-tiles__rail" role="list">
            {items.map((item) => (
              <Link
                key={item.slug}
                className="room-tiles__card"
                role="listitem"
                to="/collections/$slug"
                params={{ slug: item.slug }}
              >
                <figure>
                  <SiteImage
                    src={item.image}
                    alt=""
                    width={800}
                    height={600}
                    style={{ objectPosition: item.position ?? "50% 50%" }}
                  />
                </figure>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="room-tiles__controls room-tiles__controls--stage">
          <button type="button" onClick={() => scrollBy(-1)} disabled={atStart} aria-label="Previous spaces">
            <ChevronLeft size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => scrollBy(1)} disabled={atEnd} aria-label="Next spaces">
            <ChevronRight size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="room-tiles__dots">
        {items.map((item, index) => (
          <button
            key={item.slug}
            type="button"
            aria-label={`Show ${item.label}`}
            aria-current={active === index}
            className={active === index ? "is-active" : undefined}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </section>
  );
}
