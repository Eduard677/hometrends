import { pageHead } from "@/lib/seo";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageFrame } from "@/components/page-frame";
import { ProductCard } from "@/components/product-card";
import { useWishlist, wishlistItems } from "@/lib/wishlist";
export const Route = createFileRoute("/saved")({ component: SavedPage, head: () => pageHead({ title: "Saved pieces | Home Trends Furniture", description: "Keep track of furniture you want to discuss with Home Trends in Ennis. Your saved pieces are stored on this device.", path: "/saved" }) });
function SavedPage() {
  const [ready, setReady] = useState(false);
  const slugs = useWishlist(s => s.slugs);
  const remove = useWishlist(s => s.remove);
  useEffect(() => setReady(true), []);
  const products = ready ? wishlistItems(slugs) : [];
  return <PageFrame title="Your saved pieces" lead="A shortlist for your next visit. Saved on this device.">
    {products.length ? <div className="product-grid">{products.map(product => <div key={product.id}><ProductCard product={product} /><button className="saved-remove" type="button" onClick={() => remove(slugs.find(slug => wishlistItems([slug])[0]?.id === product.id) ?? product.slug)}>Remove {product.name}</button></div>)}</div> : <p>No saved pieces yet. <Link to="/shop">Browse furniture</Link></p>}
  </PageFrame>;
}
