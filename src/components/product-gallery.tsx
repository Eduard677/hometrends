import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductMedia } from "./product-media";

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images ?? [];
  return <div className="product-gallery">
    <div className="pdp__media"><ProductMedia key={images[active]?.src ?? product.slug} product={product} image={images[active]} loading="eager" /></div>
    {images.length > 1 ? <div className="product-gallery__thumbs" aria-label={`Photographs of ${product.name}`}>
      {images.map((image, index) => <button key={image.src + index} type="button" aria-label={`View photograph ${index + 1} of ${product.name}`} aria-pressed={active === index} onClick={() => setActive(index)}><ProductMedia product={product} image={image} /></button>)}
    </div> : null}
  </div>;
}
