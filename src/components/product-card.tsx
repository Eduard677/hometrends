import { Link } from "@tanstack/react-router";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { priceLabel, variantSummary } from "@/lib/catalog";
import { Price } from "./price";
import { bagLineFrom } from "@/lib/bag";
import { useChromeActions } from "./chrome-actions";
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
  const { addToBag } = useChromeActions();
  const [added, setAdded] = useState(false);
  const canAddDirectly = product.cta === "add";
  const soldOut = product.inStock === false;

  return (
    <article className={`product-card${soldOut ? " is-sold-out" : ""}`}>
      <figure>
        <Link to="/products/$slug" params={{ slug: product.slug }} tabIndex={-1} aria-hidden="true">
          <ProductMedia product={product} loading="lazy" />
        </Link>
        {soldOut ? (
          <span className="product-card__stock">Not currently available</span>
        ) : product.availability === "On the floor now" ? (
          <span className="product-card__availability">On the floor now</span>
        ) : null}
      </figure>
      <div className="product-card__body">
        <h3>
          <Link to="/products/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        {/* §2 - plain text, never colour dots; the catalogue holds no hex values. */}
        {variantSummary(product) ? <p className="product-card__variants">{variantSummary(product)}</p> : null}
        <Price label={priceLabel(product)} was={product.compareAt} showWas={showWas} />
        {product.availability && product.availability !== "On the floor now" && !soldOut ? (
          <p className="product-availability">{product.availability}</p>
        ) : null}
        {soldOut ? (
          <Link className="product-card__cta" to="/products/$slug" params={{ slug: product.slug }}>
            View details
          </Link>
        ) : canAddDirectly ? (
          <button
            className={`product-card__cta${added ? " is-added" : ""}`}
            type="button"
            onClick={() => {
              const line = bagLineFrom(product);
              if (!line) return;
              addToBag(line);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1600);
            }}
          >
            {added ? "Added" : "Add to bag"}
          </button>
        ) : (
          <Link className="product-card__cta" to="/products/$slug" params={{ slug: product.slug }}>
            Choose options
          </Link>
        )}
      </div>
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
