import { useEffect, useRef, useState } from "react";

/**
 * One slow scroll-driven open, used once on the homepage couch photograph.
 *
 * The child is masked to ~60% of the content width and opens to full width via
 * clip-path, so nothing reflows and the caption below never moves. It fires
 * once and then stops observing — no scrubbing, no bounce, no parallax.
 *
 * It starts open when the viewer prefers reduced motion, and also when
 * IntersectionObserver is unavailable, so the photograph is never left masked.
 */
export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!node || reduced || typeof IntersectionObserver === "undefined") {
      setOpen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`scroll-reveal${open ? " is-open" : ""}`}>
      {children}
    </div>
  );
}
