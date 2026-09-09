import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

/**
 * Both product sketches put a heart on the name line rather than a text link in
 * the secondary row. The `icon` variant serves that position; the default text
 * variant is unchanged, so every existing caller looks exactly as before.
 */
export function SavePiece({ slug, variant = "text" }: { slug: string; variant?: "text" | "icon" }) {
  const [ready, setReady] = useState(false);
  const slugs = useWishlist(state => state.slugs);
  const toggle = useWishlist(state => state.toggle);
  useEffect(() => setReady(true), []);
  const saved = ready && slugs.includes(slug);
  const label = saved ? "Saved for your visit" : "Save for your visit";
  if (variant === "icon") return <button type="button" className={`save-heart${saved ? " is-saved" : ""}`} aria-pressed={saved} aria-label={label} title={label} onClick={() => toggle(slug)}><Heart size={22} strokeWidth={1.6} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button>;
  return <button type="button" className="saved-remove" aria-pressed={saved} onClick={() => toggle(slug)}>{label}</button>;
}
