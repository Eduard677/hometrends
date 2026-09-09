import { pageHead } from "@/lib/seo";
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
type ShopSearch = { page?: number; q?: string; category?: string; colour?: string; price?: string; stock?: boolean; sort?: string };

const list = (value: unknown) =>
  typeof value === "string" && value ? value.split(",").filter(Boolean) : [];

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    page: Number(search.page) > 1 ? Number(search.page) : undefined,
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
    colour: typeof search.colour === "string" && search.colour ? search.colour : undefined,
    price: typeof search.price === "string" && search.price ? search.price : undefined,
    stock: search.stock === true || search.stock === "true" ? true : undefined,
    sort: typeof search.sort === "string" && search.sort ? search.sort : undefined,
  }),
  component: ShopPage,
  /* Paginated pages self-canonicalise: page 2 points at page 2, not page 1. */
  head: ({ match }) => {
    const page = Number((match.search as { page?: number } | undefined)?.page ?? 1);
    const suffix = page > 1 ? ` — page ${page}` : "";
    return pageHead({
      title: `The range${suffix} | Home Trends Furniture`,
      description:
        "Browse the full Home Trends range — sofas, beds, mattresses, dining, flooring and rugs. Then plan a visit to the Ennis showroom.",
      path: page > 1 ? `/shop?page=${page}` : "/shop",
    });
  },
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
              page={search.page ?? 1}
              /* Real hrefs: the page survives a reload, is linkable, and the
                 controls work with JS disabled. */
              hrefForPage={(n) => {
                const next = new URLSearchParams();
                for (const [k, v] of Object.entries(search)) if (v !== undefined && k !== "page") next.set(k, String(v));
                if (n > 1) next.set("page", String(n));
                const qs = next.toString();
                return qs ? `/shop?${qs}` : "/shop";
              }}
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
