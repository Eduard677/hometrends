import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, isRetiredProductSlug, priceLabel, productDimensions, productRedirect, relatedProducts } from "@/lib/catalog";
import { ProductGallery } from "@/components/product-gallery";
import { CompleteTheRoom } from "@/components/complete-the-room";
import { SavePiece } from "@/components/save-piece";
import { VariantPicker, useVariantSelection } from "@/components/variant-picker";
import { ReserveModal } from "@/components/reserve-modal";
import { useChromeActions } from "@/components/chrome-actions";
import { bagLineFrom } from "@/lib/bag";
import { euro } from "@/lib/store";
import { breadcrumbSchema, pageHead, productDescription, productSchema, safeJson } from "@/lib/seo";

export const Route = createFileRoute("/products/$slug")({
  beforeLoad: ({ params }) => {
    if (isRetiredProductSlug(params.slug)) throw redirect({ to: "/collections/$slug", params: { slug: "sofas-chairs" }, statusCode: 301 });
    const canonical = productRedirect(params.slug);
    if (canonical) throw redirect({ to: "/products/$slug", params: { slug: canonical }, statusCode: 301 });
  },
  component: ProductPage,
  head: ({ params }) => {
    const product = getProduct(params.slug);
    if (!product) {
      return pageHead({
        title: "Product not found | Home Trends Furniture",
        description:
          "This piece is not in the current Home Trends catalogue. Browse furniture and plan a visit to Ennis.",
        path: `/products/${params.slug}`,
      });
    }
    /* Share card is the product's own first photograph, per the brief. These
       are the catalogue crop, 800x1000 — not 1200x630; see CLAUDE.md. */
    const photo = product.images?.[0];
    const head = pageHead({
      title: `${product.name} | Home Trends Furniture`,
      description: productDescription(product),
      path: `/products/${product.slug}`,
      type: "product",
      image: photo
        ? { src: photo.src, width: 800, height: 1000, alt: photo.alt ?? product.name }
        : undefined,
    });
    return {
      ...head,
      scripts: [
        { type: "application/ld+json", children: safeJson(productSchema(product)) },
        {
          type: "application/ld+json",
          children: safeJson(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Furniture", path: "/shop" },
              { name: product.name, path: `/products/${product.slug}` },
            ]),
          ),
        },
      ],
    };
  },
});

function ProductPage() {
  const { slug } = Route.useParams();
  const product = getProduct(slug);
  if (!product) return <main id="main" className="issue"><h1>Product not found</h1><Link to="/shop">Browse the range</Link></main>;
  return <ProductDetail key={product.slug} product={product} />;
}

function ProductDetail({ product }: { product: NonNullable<ReturnType<typeof getProduct>> }) {
  const { addToBag } = useChromeActions();
  const selection = useVariantSelection(product);
  const [reserving, setReserving] = useState(false);
  const [added, setAdded] = useState(false);
  const soldOut = product.inStock === false;
  const variant = selection.selected;

  /* 3.2 - selecting a variant replaces the range with that variant's exact
     price; until then the product-level label stands. */
  const price = variant ? euro(variant.price) : priceLabel(product);
  const was = variant ? variant.compareAt : product.compareAt;

  /* The button states its reason rather than sitting silently inert. */
  const blockedReason = soldOut
    ? "Not currently available"
    : selection.missing.length
      ? `Choose ${selection.missing.join(" and ").toLowerCase()} first`
      : variant
        ? null
        : "This combination is unavailable";

  /* Only render a line the product actually has. No dimensions are parsed out
     of a supplier title. */
  const delivery = product.availability === "On the floor now"
    ? "On the floor now — delivery across Clare and the mid-west, usually within a week."
    : "To order, approximately 4–6 weeks. Delivery across Clare and the mid-west.";
  const dimensions = productDimensions(product);

  return <main id="main" className="issue pdp-page">
    <nav className="crumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/shop">Furniture</Link><span>/</span><span>{product.name}</span></nav>
    {/* Two columns on desktop, one stacked column at 375. The order below is the
        mobile order from the sketch: image, name, price, add, lines, then the
        secondary actions. Description and the remaining facts follow. */}
    <article className="pdp">
      <ProductGallery key={product.id} product={product} />
      <div className="pdp__buy">
        <p className="eyebrow">{product.category}</p>
        {/* Sketch: the name and the heart share a line. */}
        <div className="pdp__title"><h1>{product.name}</h1><SavePiece slug={product.slug} variant="icon" /></div>
        <p className="price">{price}{was ? <s>{euro(was)}</s> : null}</p>
        {soldOut ? <p className="pdp-stock">Not currently available. Call the showroom to ask when it is next in.</p> : null}
        <VariantPicker selection={selection} />
        <div className="pdp-actions">
          <button
            type="button"
            className={`button button--solid${added ? " is-added" : ""}`}
            disabled={Boolean(blockedReason)}
            onClick={() => {
              const line = bagLineFrom(product, variant);
              if (!line) return;
              addToBag(line);
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1600);
            }}
          >
            {added ? "Added to bag" : "Add to bag"}
          </button>
        </div>
        {blockedReason ? <p className="pdp-blocked" role="status">{blockedReason}</p> : null}
        {/* Two quiet lines under the button: dimensions then delivery, each only
            when the product carries the field. */}
        <dl className="pdp-lines">
          {dimensions ? <div><dt>Dimensions</dt><dd>{dimensions}</dd></div> : null}
          <div><dt>Delivery</dt><dd>{delivery} <Link to="/delivery">Delivery and assembly</Link></dd></div>
        </dl>
        {/* Secondary, and visibly quieter than Add. */}
        <div className="pdp-secondary">
          <button type="button" className="text-link" onClick={() => setReserving(true)}>
            Reserve to view in Ennis
          </button>
        </div>
        <p className="lead">{product.description}</p>
        {product.material && !/confirm|in the showroom \/ to order/i.test(product.material) ? (
          <dl className="facts">
            <div><dt>Material</dt><dd>{product.material}</dd></div>
          </dl>
        ) : null}
        <ReserveModal
          product={product}
          variantLabel={variant && (product.options?.length ?? 0) > 0 ? variant.label : undefined}
          open={reserving}
          onClose={() => setReserving(false)}
        />
      </div>
    </article>
    <CompleteTheRoom products={relatedProducts(product)} slug={product.slug} category={product.category} />
  </main>;
}
