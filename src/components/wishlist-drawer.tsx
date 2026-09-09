import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { featuredProducts, priceLabel } from "@/lib/catalog";
import { useWishlist, wishlistItems } from "@/lib/wishlist";
import { bagLineFrom } from "@/lib/bag";

import { useChromeActions } from "./chrome-actions";
import { ProductMedia } from "./product-media";

function usePresence(open: boolean, duration = 240) {
  const [shown, setShown] = useState(open);
  const [on, setOn] = useState(open);
  useEffect(() => {
    if (open) {
      setShown(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setOn(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setOn(false);
    const timer = window.setTimeout(() => setShown(false), duration);
    return () => window.clearTimeout(timer);
  }, [open, duration]);
  return { shown, on };
}

export function WishlistDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { shown, on } = usePresence(open);
  const slugs = useWishlist((state) => state.slugs);
  const remove = useWishlist((state) => state.remove);
  const { addToBag } = useChromeActions();
  const items = wishlistItems(slugs);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!shown) return null;

  return (
    <>
      <button className={`overlay overlay--bag${on ? " is-on" : ""}`} aria-label="Close wishlist" onClick={onClose} />
      <aside className={`bag-drawer${on ? " is-on" : ""}`} role="dialog" aria-label="Your wishlist">
        <header className="bag-drawer__head">
          <div>
            <p className="eyebrow">Wishlist</p>
            <h2>{items.length ? `${items.length} saved` : "Your saved pieces"}</h2>
            <Link to="/saved" onClick={onClose}>View saved pieces</Link>
          </div>
          <button type="button" className="icon-btn" aria-label="Close wishlist" onClick={onClose}>
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>
        {items.length ? (
          <ul className="bag-drawer__list">
            {items.map((product) => (
              <li key={product.slug}>
                <Link to="/products/$slug" params={{ slug: product.slug }} onClick={onClose} className="bag-drawer__thumb">
                  <ProductMedia product={product} />
                </Link>
                <div>
                  <Link to="/products/$slug" params={{ slug: product.slug }} onClick={onClose}>
                    {product.name}
                  </Link>
                  <p>{priceLabel(product)}</p>
                  {/* Same 3.1 rule as the cards: a multi-variant piece cannot go
                      straight to the bag, it has to pick a variant on the PDP. */}
                  {product.cta === "add" ? (
                    <button
                      className="button button--solid"
                      type="button"
                      onClick={() => {
                        const line = bagLineFrom(product);
                        if (!line) return;
                        addToBag(line);
                        remove(product.slug);
                      }}
                    >
                      Move to bag
                    </button>
                  ) : (
                    <Link className="button button--solid" to="/products/$slug" params={{ slug: product.slug }} onClick={onClose}>
                      Choose options
                    </Link>
                  )}
                  <button className="cart__remove" type="button" onClick={() => remove(product.slug)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="bag-drawer__empty">
            <p>Save furniture you would like to revisit here.</p>
            <ul className="bag-drawer__suggest">
              {featuredProducts()
                .slice(0, 2)
                .map((product) => (
                  <li key={product.slug}>
                    <Link to="/products/$slug" params={{ slug: product.slug }} onClick={onClose}>
                      <ProductMedia product={product} />
                      <span>{product.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>
            <Link to="/shop" className="button button--solid" onClick={onClose}>
              Explore furniture
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
