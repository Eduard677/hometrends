import { useEffect, useState } from "react";

/**
 * Mobile pass §6. On a phone the Add button sits below the fold — measured at
 * 884px down an 844px viewport — so the price and the primary action are both
 * off screen for the whole of the gallery and the description.
 *
 * This bar mirrors them, and only once the inline button has actually scrolled
 * above the fold, measured from the real button so the bar can never
 * contradict what is on screen. It stays hidden on desktop, where the inline
 * button is visible anyway.
 *
 * Deliberately NOT an IntersectionObserver. The button starts below the
 * viewport and ends above it, both of which are "not intersecting", so on a
 * fast scroll the state never changes and the callback never fires — verified:
 * the bar stayed hidden at scrollY 1600 with the button at top -716. A scroll
 * listener reads the current position every frame instead, so it cannot miss
 * the transition.
 */
export function PdpStickyBar({
  watch,
  price,
  label,
  disabled,
  onAdd,
}: {
  watch: React.RefObject<HTMLElement | null>;
  price: string;
  label: string;
  disabled?: boolean;
  onAdd: () => void;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const target = watch.current;
    if (!target) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      // Shown once the inline button has left the top of the viewport.
      setShown(target.getBoundingClientRect().bottom < 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(measure);
    };
    /* Deferred: a synchronous getBoundingClientRect on mount forces layout
       while the gallery image is still painting. */
    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [watch]);

  return (
    <div className={`pdp-sticky${shown ? " is-on" : ""}`} aria-hidden={!shown}>
      <p className="pdp-sticky__price">{price}</p>
      <button
        type="button"
        className="button button--solid"
        disabled={disabled}
        /* Not focusable while hidden, so a keyboard user never lands on a
           control they cannot see. */
        tabIndex={shown ? 0 : -1}
        onClick={onAdd}
      >
        {label}
      </button>
    </div>
  );
}
