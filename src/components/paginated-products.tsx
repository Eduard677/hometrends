import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { EditorialCell, type Editorial } from "./editorial-cell";

const PAGE_SIZE = 24;

/* Structural pass §3: at most two editorial cells, after row 3 and row 9.
   Rows are counted at the widest grid, four across, so the cells land in the
   same reading position as the design intends. Both sit on the first page;
   later pages get none rather than repeating them. */
const EDITORIAL_AFTER = [12, 36];

/**
 * Crawlability. The page used to live in useState and the controls were
 * <button>, so pages 2-31 had no URL, were invisible to crawlers and did
 * nothing with JS disabled. The page now comes from the caller's search params
 * and the controls are real anchors, so every page is linkable and works
 * without JS.
 */
export function PaginatedProducts({
  products,
  editorial = [],
  page = 1,
  hrefForPage,
}: {
  products: Product[];
  editorial?: Editorial[];
  page?: number;
  hrefForPage?: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * PAGE_SIZE;
  const href = (n: number) => hrefForPage?.(n) ?? `?page=${n}`;
  const slice = products.slice(start, start + PAGE_SIZE);
  const cells: React.ReactNode[] = [];
  slice.forEach((product, index) => {
    cells.push(<ProductCard key={product.slug} product={product} />);
    const absolute = start + index + 1;
    const slot = EDITORIAL_AFTER.indexOf(absolute);
    if (slot !== -1 && editorial[slot]) {
      cells.push(<EditorialCell key={`editorial-${slot}`} item={editorial[slot]} />);
    }
  });
  return <>
    {slice.length ? <div className="product-grid">{cells}</div> : null}
    {pages > 1 ? <nav className="pagination" aria-label="Furniture pages">
      {current > 1 ? <a href={href(current - 1)} rel="prev">Previous</a> : <span aria-disabled="true">Previous</span>}
      <p aria-live="polite">{start + 1}–{Math.min(start + PAGE_SIZE, products.length)} of {products.length} · Page {current} of {pages}</p>
      {current < pages ? <a href={href(current + 1)} rel="next">Next</a> : <span aria-disabled="true">Next</span>}
    </nav> : null}
  </>;
}
