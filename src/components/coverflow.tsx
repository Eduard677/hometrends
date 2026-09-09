import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type CoverItem = {
  id: string;
  image: string;
  alt: string;
  href?: string;
  slug?: string;
  cta?: string;
};

export function CoverFlow({
  items,
  heading,
  lead,
  followHref,
  followLabel,
  theme = "ink",
  layout = "portrait",
  autoplay = false,
}: {
  items: CoverItem[];
  heading: string;
  lead?: string;
  followHref?: string;
  followLabel?: string;
  theme?: "ink" | "paper";
  layout?: "portrait" | "scene";
  autoplay?: boolean;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = items.length;

  const go = useCallback((next: number) => {
    const el = scroller.current;
    if (!el) return;
    const clamped = (next + total) % total;
    const card = el.children[clamped] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setIndex(clamped);
  }, [total]);

  useEffect(() => {
    if (!autoplay || paused || total < 2) return;
    const timer = window.setInterval(() => go(index + 1), 7000);
    return () => window.clearInterval(timer);
  }, [autoplay, paused, go, index, total]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (!el.contains(document.activeElement) && document.activeElement !== el) return;
      event.preventDefault();
      go(index + (event.key === "ArrowRight" ? 1 : -1));
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [go, index]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let dist = Infinity;
      Array.from(el.children).forEach((node, i) => {
        const card = node as HTMLElement;
        const center = card.offsetLeft + card.offsetWidth / 2;
        const d = Math.abs(center - mid);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setIndex(best);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className={`catalog-reel catalog-reel--${theme} catalog-reel--${layout}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="catalog-reel__head">
        <div>
          <h2>{heading}</h2>
          {lead ? <p>{lead}</p> : null}
        </div>
        {followHref ? (
          <a href={followHref} target="_blank" rel="noreferrer">
            {followLabel}
            <ArrowUpRight size={14} strokeWidth={1.6} />
          </a>
        ) : null}
      </div>
      <div className="catalog-reel__viewport">
        <div className="catalog-reel__track" ref={scroller} tabIndex={0} aria-label={heading}>
          {items.map((item) => {
            const media = <img src={item.image} alt={item.alt} width={800} height={1000} draggable={false} />;
            const label = <span className="catalog-reel__cap">{item.alt}</span>;
            if (item.slug) {
              return (
                <Link
                  key={item.id}
                  className="catalog-reel__card"
                  to="/collections/$slug"
                  params={{ slug: item.slug }}
                >
                  <figure>{media}</figure>
                  {label}
                </Link>
              );
            }
            return (
              <a key={item.id} className="catalog-reel__card" href={item.href} target="_blank" rel="noreferrer">
                <figure>{media}</figure>
                {label}
              </a>
            );
          })}
        </div>
      </div>
      <div className="catalog-reel__nav">
        <button type="button" aria-label="Previous" onClick={() => go(index - 1)}>
          <ChevronLeft size={18} strokeWidth={1.4} />
        </button>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button type="button" aria-label="Next" onClick={() => go(index + 1)}>
          <ChevronRight size={18} strokeWidth={1.4} />
        </button>
      </div>
    </section>
  );
}
