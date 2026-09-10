import { Link } from "@tanstack/react-router";
import { Fragment, type ReactNode } from "react";
import { SiteImage } from "./site-image";

type Crumb = { to?: string; label: string; params?: Record<string, string> };

export function PageFrame({
  eyebrow,
  title,
  lead,
  count,
  plate,
  plateAlt = "",
  crumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  count?: number;
  plate?: string;
  plateAlt?: string;
  crumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <main id="main" className="issue">
      {crumbs?.length ? (
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => (
            <Fragment key={`${crumb.label}-${index}`}>
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {crumb.to ? (
                <Link to={crumb.to as never} params={crumb.params as never}>
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </nav>
      ) : null}
      <header className="issue__head">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {/* Phase 2. The count used to sit inside the <h1> as " [742]", which
            read as a leaked template variable and put a number in the page's
            main heading. It now travels with the lead line instead. */}
        <h1>{title}</h1>
        {lead || typeof count === "number" ? (
          <p>
            {lead}
            {typeof count === "number" ? (
              <span className="count">
                {lead ? " " : ""}
                {count} pieces
              </span>
            ) : null}
          </p>
        ) : null}
      </header>
      {plate ? (
        <figure className="issue__plate">
          {/* Mobile pass §9. This plate is the LCP element on /shop and on every
              collection page, and it was inheriting SiteImage's lazy default —
              Lighthouse mobile flagged lcp-lazy-loaded as failing, with LCP at
              8.84s on /shop and 6.98s on a collection. It is above the fold on
              every page that renders it, so it loads eagerly at high priority. */}
          <SiteImage
            src={plate}
            alt={plateAlt || `${title} at Home Trends Furniture, Ennis`}
            width={1600}
            height={700}
            loading="eager"
            priority
          />
        </figure>
      ) : null}
      <div className="issue__body">{children}</div>
    </main>
  );
}
