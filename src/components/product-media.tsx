import { useState } from "react";
import type { Product, ProductImage } from "@/lib/catalog";
import imageFit from "@/data/image-fit.json";

/* BRIEF.md 2.2. Lifestyle photographs fill the frame, cutouts must not be
   cropped into. Classified offline by scripts/classify-product-media.mjs.

   The stopgap, flagged as one: `contain` faithfully preserves the empty margin
   baked into the source file, so a cutout filling 9% of its frame still reads as
   adrift. Where fill is low, a scale is passed to CSS to close some of that gap.
   It is a demo measure - the real fix is re-exporting the assets, listed in
   reports/cutout-frame-fill.md. */
const FIT = imageFit as Record<string, { fit: "cover" | "contain"; fill?: number }>;
const TARGET_FILL = 0.55;
const MAX_SCALE = 1.6;

function fitFor(product: Product) {
  const entry = FIT[product.slug];
  if (!entry) return { className: "", scale: undefined };
  if (entry.fit === "cover") return { className: " product-media--cover", scale: undefined };
  const fill = entry.fill ?? 1;
  const scale = fill > 0 && fill < TARGET_FILL ? Math.min(MAX_SCALE, Math.sqrt(TARGET_FILL / fill)) : undefined;
  return { className: " product-media--contain", scale: scale ? Number(scale.toFixed(2)) : undefined };
}

export function ProductMedia({ product, image, alt, width = 800, height = 1000, loading = "lazy", className = "" }: {
  product: Product; image?: ProductImage; alt?: string; width?: number; height?: number;
  loading?: "lazy" | "eager"; className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const photo = image ?? product.images?.[0];
  const src = photo?.src ?? product.image;
  const description = alt || photo?.alt || product.imageAlt || `${product.name}, Home Trends Furniture, Ennis`;
  if (!src || failed) return <span className={`product-media is-missing ${className}`} role="img" aria-label={`Photograph unavailable: ${product.name}`}>Photograph unavailable</span>;
  const { className: fitClass, scale } = fitFor(product);
  return (
    <picture
      className={`product-media${fitClass} ${className}`}
      data-fill={scale ? "low" : undefined}
      style={{
        ...(photo?.blur ? { backgroundImage: `url("${photo.blur}")`, backgroundSize: "cover" } : {}),
        ...(scale ? ({ "--fit-scale": String(scale) } as React.CSSProperties) : {}),
      }}
    >
      {photo?.fallback ? <source type="image/webp" srcSet={src} /> : null}
      <img src={photo?.fallback ?? src} alt={description} width={width} height={height} loading={loading} decoding="async" onError={() => setFailed(true)} />
    </picture>
  );
}
