import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ListingToolbar, sortProducts } from "@/components/chrome";
import { PageFrame } from "@/components/page-frame";
import { PaginatedProducts } from "@/components/paginated-products";
import { FilterBar } from "@/components/filter-bar";
import { MoreRooms } from "@/components/more-rooms";
import { editorialFor } from "@/components/editorial-cell";
import { searchProducts } from "@/lib/catalog";
import { EMPTY_FACETS, applyFacets, blockingFacet, facetCounts, type Facets } from "@/lib/filters";

/**
 * BRIEF.md 5.1 and 5.2. Filter and sort state lives in the query string, so a
 * filtered view is linkable and survives a reload.
 */
type ShopSearch = { q?: string; category?: string; colour?: string; price?: string; stock?: boolean; sort?: string };

const list = (value: unknown) =>
  typeof value === "string" && value ? value.split(",").filter(Boolean) : [];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    colour: typeof search.colour === "string" && search.colour ? search.colour : undefined,
    price: typeof search.price === "string" && search.price ? search.price : undefined,
    stock: search.stock === true || search.stock === "true" ? true : undefined,
    sort: typeof search.sort === "string" && search.sort ? search.sort : undefined,
  }),
  component: ShopPage,
  head: () => ({ meta: [{ title: "The range | Home Trends Furniture" }] }),
});

function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { q = "", sort = "featured" } = search;

  const facets: Facets = useMemo(
    () => ({
      category: list(search.category),
      colour: list(search.colour),
      price: list(search.price),
      inStock: Boolean(search.stock),
    }),
    [search.category, search.colour, search.price, search.stock],
  );

  const searched = useMemo(() => searchProducts(q), [q]);
  const counts = useMemo(() => facetCounts(searched), [searched]);
  const products = useMemo(() => sortProducts(applyFacets(searched, facets), sort), [searched, facets, sort]);

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

  const relax = products.length ? undefined : blockingFacet(searched, facets);

  return (
    <PageFrame
      eyebrow="The floor"
      title={q ? `Results for “${q}”` : "The range"}
      count={products.length}
      lead="Oak beds, dining, sofas and flooring. Sit with them in Ennis."
      plate="/media/editorial/shop-room-living.webp"
      plateAlt="Living room furniture on the Home Trends floor"
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
              key={`${sort}:${q}:${JSON.stringify(facets)}`}
              products={products}
              editorial={editorialFor("shop", "/media/editorial/shop-room-living.webp")}
            />
          ) : (
            <div className="empty">
              {/* 5.1 - name the filter to relax rather than only "no results". */}
              <p>
                Nothing matches all of these filters
                {relax ? <> — try relaxing {relax}.</> : "."}
              </p>
              <button type="button" className="text-link" onClick={() => setFacets(EMPTY_FACETS)}>
                Clear all filters
              </button>
            </div>
          )}
          <MoreRooms />
        </div>
      </div>
    </PageFrame>
  );
}
