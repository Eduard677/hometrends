import { Link } from "@tanstack/react-router";
import type { Product } from "@/lib/catalog";
import { priceLabel, variantSummary } from "@/lib/catalog";
import { Price } from "./price";
import { ProductMedia } from "./product-media";

/**
 * BRIEF.md 3.1. Two rules that are never conflated:
 *
 *   CTA   from `cta`        - "add" may add directly, "options" must route to the PDP
 *   Price from `priceVaries` - flat price, or "From EUR"
 *
 * They are independent. Capri Bar Stool is five colours at one price: a flat
 * EUR 149 *and* "Choose options". Never infer the CTA from the price display.
 *
 * `showWas` is off in the homepage featured rows (2.6): 86% of the catalogue
 * carries a markdown, and a strikethrough on nearly every card reads as a
 * clearance outlet.
 */
export function ProductCard({
  product,
  showWas = true,
}: {
  product: Product;
  lookbook?: boolean;
  showWas?: boolean;
}) {
  const soldOut = product.inStock === false;

  return (
    /* Desktop pass §3. The whole card is the link now and the CTA button is
       gone — purchase happens on the PDP. One <a> wrapping everything means a
       screen reader announces one target instead of three, and there is no
       longer a button inside a link, which was never valid.

       useChromeActions / bagLineFrom are no longer needed here; adding to the
       bag is the PDP's job. */
    <article className={`product-card${soldOut ? " is-sold-out" : ""}`}>
      <Link className="product-card__link" to="/products/$slug" params={{ slug: product.slug }}>
        <figure>
          <ProductMedia product={product} loading="lazy" />
          {soldOut ? (
            <span className="product-card__stock">Not currently available</span>
          ) : product.availability === "On the floor now" ? (
            <span className="product-card__availability">On the floor now</span>
          ) : null}
        </figure>
        <div className="product-card__body">
          <h3>{product.name}</h3>
          <p className="product-card__variants">{variantSummary(product) ?? "\u00a0"}</p>
          <Price label={priceLabel(product)} was={product.compareAt} showWas={showWas} />
          {product.availability && product.availability !== "On the floor now" && !soldOut ? (
            <p className="product-availability">{product.availability}</p>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

export function ProductGrid({ products, showWas = true }: { products: Product[]; lookbook?: boolean; showWas?: boolean }) {
  if (!products.length)
    return (
      <div className="empty">
        <p>No pieces are listed in this collection yet. Call the showroom to discuss what you’re looking for.</p>
      </div>
    );
  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} showWas={showWas} />
      ))}
    </div>
  );
}
