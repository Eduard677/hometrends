import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductMedia } from "./product-media";

/**
 * One track of slides serves both sketches, so no photograph is downloaded
 * twice:
 *
 *   desktop  only the active slide is displayed; the thumb row sets it.
 *   mobile   every slide is laid out in a horizontal scroll-snap row and the
 *            dots report, and set, the scroll position.
 *
 * Which of those applies is decided in CSS at the 900px breakpoint, not here,
 * so there is no resize listener and no server/client mismatch on first paint.
 */
export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const images = product.images ?? [];

  /* Mobile: derive the active dot from the scroll offset. Rounding to the
     nearest slide keeps the dot honest mid-flick without fighting the snap. */
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth;
    if (!width) return;
    const index = Math.min(Math.round(track.scrollLeft / width), images.length - 1);
    setActive((current) => (current === index ? current : index));
  }, [images.length]);

  /* Medium-style: once open, a real scroll or Escape closes it. Listening on
     the window rather than the overlay so a trackpad flick anywhere closes.
     Focusing the trigger makes the browser nudge it into view, which fires a
     scroll event in the same tick as opening — so close only once the page has
     actually moved a meaningful distance from where it opened. */
  useEffect(() => {
    if (!zoomed) return;
    const openedAt = window.scrollY;
    const close = () => setZoomed(false);
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAt) > 24) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [zoomed]);

  const goTo = useCallback((index: number) => {
    setActive(index);
    const track = trackRef.current;
    /* Only meaningful while the track scrolls, i.e. on mobile; on desktop the
       track has no overflow and this is a no-op beyond setting the state. */
    track?.scrollTo({ left: index * track.clientWidth, behavior: "smooth" });
  }, []);

  return (
    <div className="product-gallery">
      <div className="pdp__media product-gallery__track" ref={trackRef} onScroll={onScroll}>
        {images.map((image, index) => (
          <div
            key={image.src + index}
            className={`product-gallery__slide${active === index ? " is-active" : ""}`}
          >
            <button
              type="button"
              className="product-gallery__zoom"
              aria-label={`Enlarge photograph ${index + 1} of ${product.name}`}
              onClick={() => {
                setActive(index);
                setZoomed(true);
              }}
            >
              <ProductMedia
                product={product}
                image={image}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </button>
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <div
          className="product-gallery__dots"
          aria-label={`Photograph ${active + 1} of ${images.length}`}
        >
          {images.map((image, index) => (
            <button
              key={image.src + index}
              type="button"
              aria-label={`View photograph ${index + 1} of ${product.name}`}
              aria-current={active === index}
              className={active === index ? "is-active" : undefined}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      ) : null}
      {images.length > 1 ? (
        <div className="product-gallery__thumbs" aria-label={`Photographs of ${product.name}`}>
          {images.map((image, index) => (
            <button
              key={image.src + index}
              type="button"
              aria-label={`View photograph ${index + 1} of ${product.name}`}
              aria-pressed={active === index}
              onClick={() => goTo(index)}
            >
              <ProductMedia product={product} image={image} />
            </button>
          ))}
        </div>
      ) : null}
      {/* One frame, the image the gallery is already showing. Click anywhere,
          scroll, or press Escape to close. */}
      {zoomed && images[active] ? (
        <div
          className="product-zoom"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name}, enlarged`}
          onClick={() => setZoomed(false)}
        >
          <ProductMedia product={product} image={images[active]} loading="eager" />
        </div>
      ) : null}
    </div>
  );
}
