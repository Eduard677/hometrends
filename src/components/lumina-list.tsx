import { Link } from "@tanstack/react-router";
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

export type LuminaItem = {
  name: string;
  color: string;
  line: string;
};

function padCount(index: number) {
  return String(index + 1).padStart(2, "0");
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LuminaList({
  items,
  eyebrow = "Errigel upholstery",
  heading = "Colour for your room",
  note = "Illustrative colour study. Fabric availability may vary—ask in the showroom.",
  ctaLabel = "Discuss Errigel in the showroom",
  defaultIndex = 0,
}: {
  items: LuminaItem[];
  eyebrow?: string;
  heading?: string;
  note?: string;
  ctaLabel?: string;
  defaultIndex?: number;
}) {
  const [active, setActive] = useState(() => {
    if (!items.length) return 0;
    return Math.min(Math.max(defaultIndex, 0), items.length - 1);
  });
  const headingId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const swatchRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const item = items[active] ?? items[0];
  if (!item) return null;

  const total = items.length;
  const countLabel = `${padCount(active)} / ${String(total).padStart(2, "0")}`;

  function select(index: number, opts?: { focus?: boolean; scroll?: boolean }) {
    if (index < 0 || index >= items.length) return;
    setActive(index);
    const node = swatchRefs.current[index];
    const rail = railRef.current;
    if (opts?.focus) node?.focus();
    if (opts?.scroll && node && rail && rail.scrollWidth > rail.clientWidth + 1) {
      const railBox = rail.getBoundingClientRect();
      const nodeBox = node.getBoundingClientRect();
      const delta = (nodeBox.left + nodeBox.right) / 2 - (railBox.left + railBox.right) / 2;
      rail.scrollTo({
        left: rail.scrollLeft + delta,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  }

  function onSwatchKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys = ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") {
      select(0, { focus: true, scroll: true });
      return;
    }
    if (event.key === "End") {
      select(items.length - 1, { focus: true, scroll: true });
      return;
    }
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const next = forward ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    select(next, { focus: true, scroll: true });
  }

  return (
    <section
      id="errigel"
      className="lumina lumina--errigel"
      aria-labelledby={headingId}
      style={{ "--errigel-swatch": item.color } as CSSProperties}
    >
      <div className="lumina__stage">
        <div className="lumina__copy">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={headingId}>{heading}</h2>
          <p className="lumina__name">{item.name}</p>
          <p className="lumina__desc">{item.line}</p>
          <p className="lumina__note">{note}</p>
          <Link to="/bespoke" className="lumina__cta">
            {ctaLabel}
          </Link>
        </div>

        <div className="lumina__library">
          <div className="lumina__panel" aria-hidden="true">
            <span className="lumina__cloth" />
          </div>
          <div className="lumina__rail-head">
            <p className="lumina__count">{countLabel}</p>
            <p className="lumina__rail-active">{item.name}</p>
          </div>
          <div
            ref={railRef}
            className="lumina__rail"
            role="radiogroup"
            aria-orientation="horizontal"
            aria-label="Errigel upholstery colours"
          >
            {items.map((look, index) => {
              const on = index === active;
              const number = padCount(index);
              return (
                <button
                  key={look.color}
                  ref={(node) => {
                    swatchRefs.current[index] = node;
                  }}
                  type="button"
                  role="radio"
                  className={`lumina__swatch${on ? " is-on" : ""}`}
                  style={{ "--swatch": look.color } as CSSProperties}
                  aria-checked={on}
                  aria-label={`${look.name}, ${number} of ${String(total).padStart(2, "0")}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(index, { scroll: true })}
                  onKeyDown={(event) => onSwatchKeyDown(event, index)}
                >
                  <span className="lumina__chip" />
                  <span className="lumina__swatch-label" aria-hidden={!on}>
                    <span className="lumina__swatch-num">{number}</span>
                    <span className="lumina__swatch-name">{look.name}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
