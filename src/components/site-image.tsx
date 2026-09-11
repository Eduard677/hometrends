import type { CSSProperties } from "react";
import media from "@/data/site-media.json";
type ImageEntry = { src: string; srcset?: string; width?: number; height?: number; fallback: string; blur: string };

/**
 * `sizes` defaults to 100vw, which is what the browser assumes anyway when a
 * srcset carries `w` descriptors and no `sizes` is given. It is the safe
 * default: it can only over-select, never paint a card with too small a file.
 * Anything narrower than the viewport should pass its own `sizes` — that is
 * where the bandwidth is actually saved.
 */
export function SiteImage({ src, alt, width, height, sizes = "100vw", loading = "lazy", priority = false, style, draggable, decoding = "async" }: {
  src: string; alt: string; width?: number; height?: number; sizes?: string; loading?: "eager" | "lazy";
  priority?: boolean; style?: CSSProperties; draggable?: boolean; decoding?: "async" | "sync" | "auto";
}) {
  const image = (media as Record<string, ImageEntry>)[src];
  return <picture className="site-image" style={image ? { backgroundImage: `url("${image.blur}")`, backgroundSize: "cover" } : undefined}>
    {image ? <source type="image/webp" srcSet={image.srcset ?? image.src} sizes={image.srcset ? sizes : undefined} /> : null}
    <img src={image?.fallback ?? src} alt={alt} width={width ?? image?.width} height={height ?? image?.height} loading={loading} fetchPriority={priority ? "high" : undefined} style={style} draggable={draggable} decoding={decoding} />
  </picture>;
}
