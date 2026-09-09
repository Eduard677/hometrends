import { useState } from "react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
import { EditorialCell, type Editorial } from "./editorial-cell";

const PAGE_SIZE = 24;

/* Structural pass §3: at most two editorial cells, after row 3 and row 9.
   Rows are counted at the widest grid, four across, so the cells land in the
   same reading position as the design intends. Both sit on the first page;
   later pages get none rather than repeating them. */
const EDITORIAL_AFTER = [12, 36];

export function PaginatedProducts({ products, editorial = [] }: { products: Product[]; editorial?: Editorial[] }) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  function go(next: number) {
    setPage(next);
    document.querySelector(".toolbar")?.scrollIntoView({ behavior: "instant", block: "start" });
  }
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
      <button type="button" disabled={current === 1} onClick={() => go(current - 1)}>Previous</button>
      <p aria-live="polite">{start + 1}–{Math.min(start + PAGE_SIZE, products.length)} of {products.length} · Page {current} of {pages}</p>
      <button type="button" disabled={current === pages} onClick={() => go(current + 1)}>Next</button>
    </nav> : null}
  </>;
}
