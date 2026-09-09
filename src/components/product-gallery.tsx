import { useCallback, useRef, useState } from "react";
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
            <ProductMedia
              product={product}
              image={image}
              loading={index === 0 ? "eager" : "lazy"}
            />
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
    </div>
  );
}
