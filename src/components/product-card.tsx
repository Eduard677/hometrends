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
  listing = false,
}: {
  product: Product;
  lookbook?: boolean;
  showWas?: boolean;
  listing?: boolean;
}) {
  const soldOut = product.inStock === false;

  return (
    /* The whole card is the PDP link. Purchase happens on the PDP.
       Listing cards (/shop, collections) are only image, name, optional
       variant line, and price — no Add to bag / Choose options / View details. */
    <article className={`product-card${soldOut ? " is-sold-out" : ""}${listing ? " product-card--listing" : ""}`}>
      <Link className="product-card__link" to="/products/$slug" params={{ slug: product.slug }}>
        <figure>
          <ProductMedia product={product} loading="lazy" />
          {listing ? null : soldOut ? (
            <span className="product-card__stock">Not currently available</span>
          ) : product.availability === "On the floor now" ? (
            <span className="product-card__availability">On the floor now</span>
          ) : null}
        </figure>
        <div className="product-card__body">
          <h3>{product.name}</h3>
          <p className="product-card__variants">{variantSummary(product) ?? "\u00a0"}</p>
          <Price label={priceLabel(product)} was={product.compareAt} showWas={showWas} />
          {listing || !(product.availability && product.availability !== "On the floor now" && !soldOut) ? null : (
            <p className="product-availability">{product.availability}</p>
          )}
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
