import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useState } from "react";
import { bagCount, bagItems, bagSubtotal, lineKey, useBag } from "@/lib/bag";
import { useDialogFocus, usePresence } from "@/lib/dialog";
import { euro } from "@/lib/store";
import { QtyStepper } from "./qty-stepper";

/**
 * BRIEF.md 4.4 and 4.5. Local only — nothing in this path issues a network
 * request. Lines render from their own stored snapshot, so the drawer does not
 * depend on a catalogue lookup succeeding.
 */
export function BagDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { shown, on } = usePresence(open);
  const lines = useBag((state) => state.lines);
  const setQuantity = useBag((state) => state.setQuantity);
  const remove = useBag((state) => state.remove);
  const [checkout, setCheckout] = useState(false);
  const ref = useDialogFocus(open, onClose);

  const items = bagItems(lines);
  const count = bagCount(lines);
  const subtotal = bagSubtotal(lines);

  if (!shown) return null;

  return (
    <>
      <button className={`overlay overlay--bag${on ? " is-on" : ""}`} aria-label="Close bag" onClick={onClose} />
      <aside
        ref={ref as React.RefObject<HTMLElement>}
        className={`bag-drawer${on ? " is-on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
      >
        <header className="bag-drawer__head">
          <div>
            <p className="eyebrow">Bag</p>
            <h2>{count ? `${count} ${count === 1 ? "piece" : "pieces"}` : "Your bag is empty"}</h2>
          </div>
          <button type="button" className="icon-btn" aria-label="Close bag" onClick={onClose}>
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        {checkout ? (
          /* 4.5 - an interstitial, not a checkout. No payment form is built or faked. */
          <div className="bag-drawer__checkout">
            <h3>Order summary</h3>
            <ul className="bag-drawer__summary">
              {items.map(({ line }) => (
                <li key={lineKey(line)}>
                  <span>
                    {line.title}
                    {line.variantLabel ? ` — ${line.variantLabel}` : ""} × {line.quantity}
                  </span>
                  <span>{euro(line.unitPrice * line.quantity)}</span>
                </li>
              ))}
            </ul>
            <p className="bag-drawer__total">
              <span>Subtotal</span>
              <strong>{euro(subtotal)}</strong>
            </p>
            <p className="bag-drawer__note">
              In the live build, payment is handled by Shopify’s secure checkout. This demo stops here and takes no
              payment details.
            </p>
            <button type="button" className="text-link" onClick={() => setCheckout(false)}>
              Back to the bag
            </button>
          </div>
        ) : items.length ? (
          <>
            <ul className="bag-drawer__list">
              {items.map(({ line }) => {
                const key = lineKey(line);
                return (
                  <li key={key}>
                    <Link to="/products/$slug" params={{ slug: line.slug }} onClick={onClose} className="bag-drawer__thumb">
                      <img src={line.image} alt="" loading="lazy" />
                    </Link>
                    <div>
                      <Link to="/products/$slug" params={{ slug: line.slug }} onClick={onClose}>
                        {line.title}
                      </Link>
                      {line.variantLabel ? <p className="bag-drawer__variant">{line.variantLabel}</p> : null}
                      <p>{euro(line.unitPrice)}</p>
                      <QtyStepper
                        value={line.quantity}
                        onChange={(next) => setQuantity(key, next)}
                        label={`Quantity for ${line.title}${line.variantLabel ? `, ${line.variantLabel}` : ""}`}
                      />
                      <button className="cart__remove" type="button" onClick={() => remove(key)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="bag-drawer__foot">
              <p className="bag-drawer__total">
                <span>Subtotal</span>
                <strong>{euro(subtotal)}</strong>
              </p>
              <p className="bag-drawer__note">Delivery is calculated at checkout.</p>
              <button type="button" className="button button--solid" onClick={() => setCheckout(true)}>
                Checkout
              </button>
              <button type="button" className="text-link" onClick={onClose}>
                Continue browsing
              </button>
            </footer>
          </>
        ) : (
          <div className="bag-drawer__empty">
            <p>Nothing in the bag yet — the range is a good place to start.</p>
            <Link to="/shop" className="button button--solid" onClick={onClose}>
              Browse the range
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
