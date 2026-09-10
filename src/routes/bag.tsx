import { pageHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { bagCount, bagItems, bagSubtotal, lineKey, useBag } from "@/lib/bag";
import { featuredProducts } from "@/lib/catalog";
import { STORE, euro } from "@/lib/store";
import { ProductGrid } from "@/components/product-card";
import { QtyStepper } from "@/components/qty-stepper";

export const Route = createFileRoute("/bag")({
  component: BagPage,
  head: () => pageHead({ title: "Your bag | Home Trends Furniture", description: "The pieces you are considering at Home Trends Furniture, Ennis. Confirm your order with the showroom.", path: "/bag" }),
});

function BagPage() {
  const lines = useBag((state) => state.lines);
  const setQuantity = useBag((state) => state.setQuantity);
  const remove = useBag((state) => state.remove);
  const items = bagItems(lines);
  const count = bagCount(lines);
  const subtotal = bagSubtotal(lines);
  const [checkout, setCheckout] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState(false);

  if (!items.length) {
    return (
      <main id="main" className="cart cart--empty">
        <header className="cart__empty-copy">
          <p className="eyebrow">Bag</p>
          <h1>Your bag is empty</h1>
          <p>Nothing in the bag yet — the range is a good place to start.</p>
          <Link to="/shop" className="button button--solid">
            Explore furniture
          </Link>
        </header>
        <section className="cart__suggest">
          <h2>Pieces to see in store</h2>
          <ProductGrid products={featuredProducts().slice(0, 4)} />
        </section>
      </main>
    );
  }

  return (
    <main id="main" className="cart">
      <div className="cart__wrap">
        <section className="cart__items">
          <header className="cart__head">
            <h1>Your bag</h1>
            <p>
              {count} {count === 1 ? "item" : "items"}
            </p>
          </header>
          <ul className="cart__list">
            {items.map(({ line }) => {
              const key = lineKey(line);
              return (
                <li className="cart__line" key={key}>
                  <Link to="/products/$slug" params={{ slug: line.slug }} className="cart__thumb">
                    <img src={line.image} alt="" loading="lazy" />
                  </Link>
                  <div className="cart__meta">
                    <Link to="/products/$slug" params={{ slug: line.slug }}>
                      <h2>{line.title}</h2>
                    </Link>
                    {line.variantLabel ? <p>{line.variantLabel}</p> : null}
                    <p>{euro(line.unitPrice)} each</p>
                    <QtyStepper
                      value={line.quantity}
                      onChange={(next) => setQuantity(key, next)}
                      label={`Quantity for ${line.title}${line.variantLabel ? `, ${line.variantLabel}` : ""}`}
                    />
                    <button className="cart__remove" type="button" onClick={() => remove(key)}>
                      Remove
                    </button>
                  </div>
                  <p className="cart__price">{euro(line.unitPrice * line.quantity)}</p>
                </li>
              );
            })}
          </ul>
          <Link to="/shop" className="text-link cart__continue">
            Continue shopping →
          </Link>
        </section>

        <aside className="cart__summary">
          <h2>Summary</h2>
          <dl>
            <div>
              <dt>Subtotal</dt>
              <dd>{euro(subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Calculated at checkout</dd>
            </div>
            <div className="cart__total">
              <dt>Subtotal</dt>
              <dd>{euro(subtotal)}</dd>
            </div>
          </dl>
          {/* Sketch sheet 1's promo field. There is no discount system, so the
              field validates nothing and stores nothing — submitting it says
              where codes are actually redeemed, which is the same thing the
              checkout interstitial below already says. No code is invented, no
              total is altered, and nothing is silently swallowed. */}
          <form
            className="cart__promo"
            onSubmit={(event) => {
              event.preventDefault();
              setPromoNote(true);
            }}
          >
            <label htmlFor="promo-code">Promotion code</label>
            <div className="cart__promo-row">
              <input
                id="promo-code"
                name="promo-code"
                type="text"
                autoComplete="off"
                /* Promo codes are entered in caps and are not words. */
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="done"
                value={promo}
                onChange={(event) => {
                  setPromo(event.target.value);
                  setPromoNote(false);
                }}
              />
              <button type="submit" className="button" disabled={!promo.trim()}>
                Apply
              </button>
            </div>
            {promoNote ? (
              <p className="cart__promo-note" role="status">
                Promotion codes are applied at Shopify’s secure checkout, not here.
              </p>
            ) : null}
          </form>
          {/* 4.5 - an interstitial, not a checkout, and no payment form. */}
          {checkout ? (
            <div className="cart__interstitial">
              <p>
                In the live build, payment is handled by Shopify’s secure checkout. This demo stops
                here and takes no payment details.
              </p>
              <button type="button" className="text-link" onClick={() => setCheckout(false)}>
                Back to the bag
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="button button--solid cart__checkout"
              onClick={() => setCheckout(true)}
            >
              Checkout
            </button>
          )}
          {/* Sketch sheet 1: expandable delivery / returns / security rows.
              /delivery and /returns carry no policy terms of their own — both
              are enquiry pages that point at the official site — so these rows
              repeat only what is already written there and link on. No terms,
              windows or charges are stated here, because none exist to state. */}
          <div className="cart__details">
            <details className="cart__detail">
              <summary>Delivery</summary>
              <p>
                Charges, availability and timing are confirmed by the showroom before you make
                arrangements.
              </p>
              <Link to="/delivery" className="text-link">
                Delivery enquiries
              </Link>
            </details>
            <details className="cart__detail">
              <summary>Returns</summary>
              <p>Call or email the team with your order details.</p>
              <Link to="/returns" className="text-link">
                Returns enquiries
              </Link>
            </details>
            <details className="cart__detail">
              <summary>Payment security</summary>
              {/* Same wording as the checkout interstitial above, which is the
                  only claim about payment this build actually makes. */}
              <p>
                Payment is handled by Shopify’s secure checkout. This demo stops before payment and
                takes no card details.
              </p>
            </details>
          </div>
          <a className="text-link" href={STORE.phoneHref}>
            Or call {STORE.phone} →
          </a>
        </aside>
      </div>
    </main>
  );
}
