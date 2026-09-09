import type { CSSProperties } from "react";
import media from "@/data/site-media.json";
type ImageEntry = { src: string; fallback: string; blur: string };

export function SiteImage({ src, alt, width, height, loading = "lazy", priority = false, style, draggable, decoding = "async" }: {
  src: string; alt: string; width?: number; height?: number; loading?: "eager" | "lazy";
  priority?: boolean; style?: CSSProperties; draggable?: boolean; decoding?: "async" | "sync" | "auto";
}) {
  const image = (media as Record<string, ImageEntry>)[src];
  return <picture className="site-image" style={image ? { backgroundImage: `url("${image.blur}")`, backgroundSize: "cover" } : undefined}>
    {image ? <source type="image/webp" srcSet={image.src} /> : null}
    <img src={image?.fallback ?? src} alt={alt} width={width} height={height} loading={loading} fetchPriority={priority ? "high" : undefined} style={style} draggable={draggable} decoding={decoding} />
  </picture>;
}
