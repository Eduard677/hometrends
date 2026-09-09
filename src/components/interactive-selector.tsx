import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { STORE } from "@/lib/store";
import { SiteImage } from "./site-image";

const LOOKS = [
  {
    id: "oak-bedroom",
    title: "Oak bed",
    subtitle: "Bedroom furniture in the Ennis showroom",
    image: "/media/editorial/from-shop-bedroom.jpg",
    objectPosition: "22% 48%",
  },
  {
    id: "fireside-chair",
    title: "Upholstered armchair",
    subtitle: "Seating photographed for the showroom",
    image: "/media/editorial/search-seating.jpg",
    objectPosition: "50% 48%",
  },
  {
    id: "dining-table",
    title: "Dining table",
    subtitle: "Dining furniture in afternoon light",
    image: "/media/editorial/search-tables.jpg",
    objectPosition: "50% 50%",
  },
  {
    id: "upholstered-bed",
    title: "Upholstered bed",
    subtitle: "Bedroom display in the Ennis showroom",
    image: "/media/editorial/from-shop-mink.jpg",
    objectPosition: "50% 48%",
  },
] as const;

function band(distance: number) {
  if (distance === 0) return "is-on";
  if (distance === 1) return "is-near";
  if (distance === 2) return "is-mid";
  return "is-edge";
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function InteractiveSelector({
  heading = "Your homes",
  lead = "Tag us using #HomeTrendsEnnis.",
}: {
  heading?: string;
  lead?: string;
}) {
  const [active, setActive] = useState(Math.floor(LOOKS.length / 2));
  const startX = useRef<number | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const current = LOOKS[active] ?? LOOKS[0];

  const go = useCallback((next: number) => {
    const clamped = (next + LOOKS.length) % LOOKS.length;
    setActive(clamped);
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    const card = row?.querySelector<HTMLElement>(".insta-select__card.is-on");
    if (!row || !card) return;
    if (!window.matchMedia("(max-width: 768px)").matches) return;

    const align = () => {
      const left = card.offsetLeft - (row.clientWidth - card.clientWidth) / 2;
      row.scrollTo({
        left: Math.max(0, left),
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(align);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [active]);

  function onKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(active + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(active - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      go(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      go(LOOKS.length - 1);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
    }
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    startX.current = event.clientX;
  }

  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current == null) return;
    const delta = event.clientX - startX.current;
    startX.current = null;
    if (Math.abs(delta) < 48) return;
    go(active + (delta < 0 ? 1 : -1));
  }

  return (
    <section className="insta-select" id="image-book" aria-label={heading}>
      <header className="insta-select__head">
        <h2>{heading}</h2>
        <p>{lead}</p>
      </header>
      <div
        ref={rowRef}
        className="insta-select__row"
        role="listbox"
        aria-label={heading}
        aria-activedescendant={`home-look-${current.id}`}
        tabIndex={0}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
        }}
      >
        {LOOKS.map((look, index) => {
          const distance = Math.abs(index - active);
          const on = index === active;
          return (
            <button
              key={look.id}
              id={`home-look-${look.id}`}
              type="button"
              role="option"
              aria-selected={on}
              className={`insta-select__card ${band(distance)}`}
              aria-label={`${look.title}. ${look.subtitle}`}
              onClick={() => setActive(index)}
            >
              <SiteImage
                src={look.image}
                alt={`${look.title} — ${look.subtitle}`}
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ objectFit: "cover", objectPosition: look.objectPosition }}
              />
              <span className="insta-select__shade" />
              {/* BRIEF.md 2.8 asked for uniform tiles and the single caption
                  dropped. That caption was naming whichever tile was active
                  rather than being an orphan, so removing it alone would have
                  left the row unlabelled. Each tile carries its own label now:
                  the grid is uniform and nothing is orphaned. */}
              <span className="insta-select__label">
                <strong>{look.title}</strong>
                <span>{look.subtitle}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="insta-select__follow">
        <a href={STORE.instagram} target="_blank" rel="noreferrer">
          Follow us on Instagram
        </a>
      </p>
    </section>
  );
}
