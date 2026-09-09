import { X } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { useDialogFocus, usePresence } from "@/lib/dialog";

/**
 * BRIEF.md 4.6. Secondary to Add to bag and PDP-only. Nothing here touches the
 * network: the confirmation says so in as many words, because a confirmation
 * implying a real submission would mislead anyone using the demo, the client
 * included.
 */
export function ReserveModal({
  product,
  variantLabel,
  open,
  onClose,
}: {
  product: Product;
  variantLabel?: string;
  open: boolean;
  onClose: () => void;
}) {
  const { shown, on } = usePresence(open);
  const [sent, setSent] = useState(false);
  const ref = useDialogFocus(open, onClose);
  if (!shown) return null;

  const piece = `${product.name}${variantLabel ? ` — ${variantLabel}` : ""}`;

  return (
    <>
      <button className={`overlay${on ? " is-on" : ""}`} aria-label="Close" onClick={onClose} />
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`reserve-modal${on ? " is-on" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-heading"
      >
        <header>
          <h2 id="reserve-heading">{sent ? "Request noted" : "Reserve to view in Ennis"}</h2>
          <button type="button" className="icon-btn" aria-label="Close" onClick={onClose}>
            <X size={18} strokeWidth={1.6} />
          </button>
        </header>

        {sent ? (
          <div className="reserve-modal__done">
            <p className="reserve-modal__demo">Demo only — this request has not been sent.</p>
            <p>
              In the live build this reaches the showroom and someone confirms the piece is on the floor before you
              drive in.
            </p>
            <button type="button" className="button button--solid" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form
            onSubmit={(event) => {
              // No network call, by design — see 4.4's note on showroom wifi.
              event.preventDefault();
              setSent(true);
            }}
          >
            <p className="reserve-modal__piece">{piece}</p>
            <label>
              <span>Your name</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              <span>Phone</span>
              <input name="phone" type="tel" autoComplete="tel" required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              <span>Anything to add (optional)</span>
              <textarea name="note" rows={3} />
            </label>
            <button type="submit" className="button button--solid">
              Request a viewing
            </button>
          </form>
        )}
      </div>
    </>
  );
}
