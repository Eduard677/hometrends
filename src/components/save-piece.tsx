import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist";
export function SavePiece({ slug }: { slug: string }) {
  const [ready, setReady] = useState(false);
  const slugs = useWishlist(state => state.slugs);
  const toggle = useWishlist(state => state.toggle);
  useEffect(() => setReady(true), []);
  const saved = ready && slugs.includes(slug);
  return <button type="button" className="saved-remove" aria-pressed={saved} onClick={() => toggle(slug)}>{saved ? "Saved for your visit" : "Save for your visit"}</button>;
}
