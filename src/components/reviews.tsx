import { useCallback, useEffect, useRef, useState } from "react";
import { GOOGLE_REVIEWS_URL, REVIEWS } from "@/lib/reviews";

/* Desktop pass §6. Roughly 45 words, cut on a word boundary — never mid-word —
   with the full review a click away on Google. */
const WORD_LIMIT = 45;

function truncate(text: string) {
  const words = text.trim().split(/\s+/);
  if (words.length <= WORD_LIMIT) return { text, clipped: false };
  return { text: `${words.slice(0, WORD_LIMIT).join(" ").replace(/[.,;:]$/, "")}…`, clipped: true };
}

/**
 * A horizontal carousel of every review, not a fixed three.
 *
 * It is a scroll container, not a transform track: the browser supplies
 * snapping, touch and trackpad gestures for free, and under
 * `prefers-reduced-motion` it degrades to exactly what the brief asks for — a
 * static scrollable row — by simply never auto-advancing.
 *
 * Auto-advance is 7s with a 900ms slide, paused on hover, on focus anywhere
 * inside, and on touch. It is not a marquee: it rests between moves, so a
 * review is readable while stationary.
 */
export function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  /* One "page" is however many cards fit, so the dots match what a viewer
     actually sees: 3 desktop, 2 tablet, 1 mobile, driven entirely by CSS. */
  const pageCount = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 1;
    const card = track.querySelector("article");
    if (!card) return 1;
    const perPage = Math.max(1, Math.round(track.clientWidth / card.getBoundingClientRect().width));
    return Math.max(1, Math.ceil(REVIEWS.length / perPage));
  }, []);

  const goTo = useCallback(
    (page: number) => {
      const track = trackRef.current;
      if (!track) return;
      const pages = pageCount();
      const next = ((page % pages) + pages) % pages;
      setIndex(next);
      track.scrollTo({ left: next * track.clientWidth, behavior: "smooth" });
    },
    [pageCount],
  );

  useEffect(() => {
    if (reduced || paused) return;
    const timer = window.setInterval(() => goTo(index + 1), 7000);
    return () => window.clearInterval(timer);
  }, [reduced, paused, index, goTo]);

  /* Keep the dots honest when someone swipes or scrolls by hand. */
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || !track.clientWidth) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(index - 1);
    }
  };

  const pages = Array.from({ length: Math.max(1, Math.ceil(REVIEWS.length / 3)) });

  return (
    <section className="reviews-section ed-sec" id="reviews" aria-labelledby="reviews-heading">
      <header>
        <h2 id="reviews-heading">What customers say</h2>
        <a
          className="reviews-section__aggregate"
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noreferrer"
        >
          <span>4.9 / 5</span> · 94 Google reviews
        </a>
      </header>

      <div
        className="reviews-carousel"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        <div
          ref={trackRef}
          className="reviews-carousel__track"
          onScroll={onScroll}
          onKeyDown={onKeyDown}
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
        >
          {REVIEWS.map((review) => {
            const { text, clipped } = truncate(review.text);
            return (
              <article key={review.name}>
                <p aria-label={`${review.stars} out of 5 stars`}>{"★".repeat(review.stars)}</p>
                <blockquote>{text}</blockquote>
                <p>
                  <cite>{review.name}</cite>
                </p>
                <a href={review.sourceUrl} target="_blank" rel="noreferrer">
                  {clipped ? "Read the full review on Google" : "Read on Google"}
                </a>
              </article>
            );
          })}
        </div>

        <div className="reviews-carousel__controls">
          <button type="button" aria-label="Previous reviews" onClick={() => goTo(index - 1)}>
            ‹
          </button>
          <div className="reviews-carousel__dots">
            {pages.map((_, page) => (
              <button
                key={page}
                type="button"
                aria-label={`Reviews page ${page + 1}`}
                aria-current={index === page}
                className={index === page ? "is-active" : undefined}
                onClick={() => goTo(page)}
              />
            ))}
          </div>
          <button type="button" aria-label="Next reviews" onClick={() => goTo(index + 1)}>
            ›
          </button>
        </div>
      </div>
    </section>
  );
}
