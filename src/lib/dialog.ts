import { useEffect, useRef, useState } from "react";

/* Lifted out of chrome.tsx unchanged so the bag drawer uses the same trap and
   the same enter/leave timing as the menu, search and wishlist panels rather
   than carrying its own copy. Body scroll locking stays central in chrome.tsx. */

export function usePresence(open: boolean, duration = 240) {
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

export /** Traps Tab inside an open dialog and closes it on Escape. Focus is placed on
 *  the first focusable element, or on `initial` when a specific field should
 *  take it - the search panel wants the field, not the first link. */
function useDialogFocus(open: boolean, onClose: () => void, initial?: string) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!open || !dialog) return;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = () =>
      Array.from(dialog.querySelectorAll<HTMLElement>(selector)).filter(
        (element) => !element.hidden && element.getClientRects().length > 0,
      );
    // The search panel's control is the header field, which lives outside the
    // dialog. So the scope is that field plus everything in the panel, and Tab
    // is driven explicitly - relying on native order would walk out of the
    // panel and into the page behind it.
    const scope = () => {
      const owner = initial ? document.getElementById(initial) : null;
      const inside = focusable();
      // An owner already inside the dialog is part of `inside`; prepending its
      // form group again would list the same elements twice and Tab would stick.
      if (!owner || dialog.contains(owner)) return inside;
      const form = owner.closest("form");
      const ownerGroup = form
        ? Array.from(form.querySelectorAll<HTMLElement>(selector)).filter(
            (element) => element.getClientRects().length > 0,
          )
        : [owner];
      return [...ownerGroup, ...inside];
    };
    // BRIEF.md 4.4: focus goes back where it came from on close, so closing the
    // bag returns the caret to the header bag button rather than the page top.
    const opener = document.activeElement as HTMLElement | null;
    const frame = window.requestAnimationFrame(() => {
      const target = initial ? document.getElementById(initial) : null;
      (target ?? focusable()[0])?.focus();
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = scope();
      if (!items.length) return;
      const index = items.indexOf(document.activeElement as HTMLElement);
      event.preventDefault();
      if (index === -1) {
        items[0].focus();
        return;
      }
      const next = event.shiftKey
        ? (index - 1 + items.length) % items.length
        : (index + 1) % items.length;
      items[next].focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      if (opener?.isConnected) opener.focus();
    };
  }, [open, onClose, initial]);
  return ref;
}
