import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ListingToolbar, sortProducts } from "@/components/chrome";
import { PageFrame } from "@/components/page-frame";
import { PaginatedProducts } from "@/components/paginated-products";
import { FilterBar } from "@/components/filter-bar";
import { MoreRooms } from "@/components/more-rooms";
import { editorialFor } from "@/components/editorial-cell";
import { collectionProducts, getCollection } from "@/lib/catalog";
import { EMPTY_FACETS, applyFacets, blockingFacet, facetCounts, type Facets } from "@/lib/filters";
import { STORE } from "@/lib/store";
import { breadcrumbSchema, pageHead, safeJson, collectionDescription } from "@/lib/seo";

/** Same URL-backed filter and sort state as /shop, so both listings behave alike. */
type CollectionSearch = { category?: string; colour?: string; price?: string; stock?: boolean; sort?: string };

const list = (value: unknown) => (typeof value === "string" && value ? value.split(",").filter(Boolean) : []);

export const Route = createFileRoute("/collections/$slug")({
  validateSearch: (search: Record<string, unknown>): CollectionSearch => ({
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    colour: typeof search.colour === "string" && search.colour ? search.colour : undefined,
    price: typeof search.price === "string" && search.price ? search.price : undefined,
    stock: search.stock === true || search.stock === "true" ? true : undefined,
    sort: typeof search.sort === "string" && search.sort ? search.sort : undefined,
  }),
  component: CollectionPage,
  head: ({ params }) => {
    const collection = getCollection(params.slug);
    if (!collection) {
      return pageHead({
        title: "Collection | Home Trends Furniture",
        description: "Browse the furniture collections at Home Trends Furniture in Ennis.",
        path: `/collections/${params.slug}`,
      });
    }
    const head = pageHead({
      title: `${collection.label} | Home Trends Furniture`,
      description: collectionDescription(collection),
      path: `/collections/${collection.slug}`,
    });
    return {
      ...head,
      scripts: [
        {
          type: "application/ld+json",
          children: safeJson(
            breadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Furniture", path: "/shop" },
              { name: collection.label, path: `/collections/${collection.slug}` },
            ]),
          ),
        },
      ],
    };
  },
});

function CollectionPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/collections/$slug" });
  const collection = getCollection(slug);
  const { sort = "featured" } = search;

  const facets: Facets = useMemo(
    () => ({
      category: list(search.category),
      colour: list(search.colour),
      price: list(search.price),
      inStock: Boolean(search.stock),
    }),
    [search.category, search.colour, search.price, search.stock],
  );

  const inCollection = useMemo(() => collectionProducts(slug), [slug]);
  const counts = useMemo(() => facetCounts(inCollection), [inCollection]);
  const products = useMemo(() => sortProducts(applyFacets(inCollection, facets), sort), [inCollection, facets, sort]);

  const setFacets = (next: Facets) =>
    navigate({
      search: (previous) => ({
        ...previous,
        category: next.category.join(",") || undefined,
        colour: next.colour.join(",") || undefined,
        price: next.price.join(",") || undefined,
        stock: next.inStock || undefined,
      }),
      replace: true,
    });

  if (!collection) {
    return (
      <PageFrame
        title="Not on this floor"
        lead={`That department is not here. Call ${STORE.phone}, or browse the range.`}
      >
        <Link to="/shop" className="button button--solid">
          The range
        </Link>
      </PageFrame>
    );
  }

  const relax = products.length ? undefined : blockingFacet(inCollection, facets);

  return (
    <PageFrame
      eyebrow={collection.eyebrow}
      title={collection.label}
      count={products.length}
      lead={collection.support}
      plate={collection.image}
      plateAlt={`${collection.label} furniture and interiors, Home Trends Furniture, Ennis`}
      crumbs={[
        { to: "/", label: "Home" },
        { label: collection.label },
      ]}
    >
      <div className="listing">
        <div className="listing__results">
          <div className="listing__controls">
            <FilterBar
              counts={counts}
              facets={facets}
              resultCount={products.length}
              onChange={setFacets}
              onClear={() => setFacets(EMPTY_FACETS)}
            />
            <ListingToolbar
              count={products.length}
              sort={sort}
              onSort={(value) =>
                navigate({ search: (previous) => ({ ...previous, sort: value === "featured" ? undefined : value }), replace: true })
              }
            />
          </div>
          {products.length ? (
            <PaginatedProducts
              key={`${slug}:${sort}:${JSON.stringify(facets)}`}
              products={products}
              // The collection's own plate is excluded so a cell never repeats it.
              editorial={editorialFor(slug, collection.image)}
            />
          ) : (
            <div className="empty">
              <p>
                Nothing in {collection.label.toLowerCase()} matches all of these filters
                {relax ? <> — try relaxing {relax}.</> : "."}
              </p>
              <button type="button" className="text-link" onClick={() => setFacets(EMPTY_FACETS)}>
                Clear all filters
              </button>
            </div>
          )}
          <MoreRooms currentSlug={slug} currentLabel={collection.label} />
        </div>
      </div>
    </PageFrame>
  );
}
