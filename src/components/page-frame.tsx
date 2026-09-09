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
        <h1>
          {title}
          {typeof count === "number" ? <span className="count"> [{count}]</span> : null}
        </h1>
        {lead ? <p>{lead}</p> : null}
      </header>
      {plate ? (
        <figure className="issue__plate">
          <SiteImage src={plate} alt={plateAlt || `${title} at Home Trends Furniture, Ennis`} width={1600} height={700} />
        </figure>
      ) : null}
      <div className="issue__body">{children}</div>
    </main>
  );
}
