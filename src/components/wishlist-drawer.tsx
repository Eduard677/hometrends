import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { RefObject } from "react";
import { useDialogFocus, usePresence } from "@/lib/dialog";
import { useWishlist, wishlistItems } from "@/lib/wishlist";

import { ProductMedia } from "./product-media";

export function WishlistDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { shown, on } = usePresence(open);
  const ref = useDialogFocus(open && shown, onClose);
  const slugs = useWishlist((state) => state.slugs);
  const remove = useWishlist((state) => state.remove);
  const items = wishlistItems(slugs);

  if (!shown) return null;

  return (
    <>
      <button className={`overlay overlay--bag${on ? " is-on" : ""}`} aria-label="Close wishlist" onClick={onClose} />
      <aside
        ref={ref as RefObject<HTMLElement>}
        className={`bag-drawer wishlist-drawer${on ? " is-on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your saved pieces"
      >
        <header className="bag-drawer__head">
          <h2>Your saved pieces</h2>
          <button type="button" className="icon-btn" aria-label="Close wishlist" onClick={onClose}>
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>
        {items.length ? (
          <ul className="wishlist-drawer__list">
            {items.map((product) => (
              <li key={product.slug} className="wishlist-drawer__row">
                <Link to="/products/$slug" params={{ slug: product.slug }} onClick={onClose} className="wishlist-drawer__thumb">
                  <ProductMedia product={product} />
                </Link>
                <Link to="/products/$slug" params={{ slug: product.slug }} onClick={onClose} className="wishlist-drawer__name">
                  {product.name}
                </Link>
                <button
                  className="wishlist-drawer__remove"
                  type="button"
                  onClick={() => remove(product.slug)}
                  aria-label={`Remove ${product.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="wishlist-drawer__empty">
            <p>Save furniture you would like to revisit here.</p>
          </div>
        )}
        <footer className="wishlist-drawer__foot">
          <Link to="/shop" className="button button--solid" onClick={onClose}>
            Explore furniture
          </Link>
        </footer>
      </aside>
    </>
  );
}
