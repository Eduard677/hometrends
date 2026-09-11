import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { searchProducts, type Product } from "@/lib/catalog";
import { applyDemoReset, bagCount, useBag } from "@/lib/bag";
import { useDialogFocus, usePresence } from "@/lib/dialog";
import { liveWishlist, useWishlist } from "@/lib/wishlist";
import { STORE, euro } from "@/lib/store";
import { ProductCard } from "./product-card";
import { ProductMedia } from "./product-media";
import { ChromeActions, useChromeActions } from "./chrome-actions";
import { BagDrawer } from "./bag-drawer";
import { WishlistDrawer } from "./wishlist-drawer";


export function SiteHeader({
  onMenu,
  onSearch,
  onCloseSearch,
  searchOpen,
  overHero,
  menuOpen,
  query,
  onQuery,
}: {
  onMenu: () => void;
  onSearch: () => void;
  onCloseSearch: () => void;
  searchOpen?: boolean;
  overHero?: boolean;
  menuOpen?: boolean;
  query: string;
  onQuery: (value: string) => void;
}) {
  const count = useBag((state) => bagCount(state.lines));
  const [ready, setReady] = useState(false);
  const [solid, setSolid] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    if (!overHero) {
      setSolid(false);
      return;
    }
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      setSolid(y > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);
  const shown = ready ? count : 0;
  const wishCount = useWishlist((state) => liveWishlist(state.slugs).length);
  const shownWish = ready ? wishCount : 0;
  const [bump, setBump] = useState(false);
  const prevCount = useRef(shown);
  useEffect(() => {
    if (shown === prevCount.current) return;
    prevCount.current = shown;
    setBump(true);
    const timer = window.setTimeout(() => setBump(false), 220);
    return () => window.clearTimeout(timer);
  }, [shown]);
  const { openBag, openWishlist } = useChromeActions();
  return (
    <header
      className={`site-header${overHero ? " is-over-hero" : ""}${solid || searchOpen || menuOpen ? " is-solid" : ""}`}
    >
      <div className="site-header__bar">
        <div className="header-start">
          <button id="header-menu" className="icon-btn" type="button" onClick={onMenu} aria-label="Menu" aria-expanded={Boolean(menuOpen)} aria-controls="site-menu">
            <Menu size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className="icon-btn__label">Menu</span>
          </button>
        </div>
        <Link to="/" className="brand" aria-label="Home Trends Furniture home">
          <img className="brand__logo brand__logo--ink" src="/media/brand/ht-logo-test-ink.svg" alt="Home Trends Furniture" width={221} height={64} />
          <img className="brand__logo brand__logo--gold" src="/media/brand/ht-logo-test.svg" alt="" width={221} height={64} />
        </Link>
        <div className="header-actions">
          {/* Always visible, not a toggle: the field itself is the affordance.
              It opens the panel on click or on typing - deliberately NOT on
              focus, because Escape returns focus here and that would reopen
              the panel it just closed. */}
          <form
            className="header-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              if (!query.trim()) return;
              onCloseSearch();
              void navigate({ to: "/find", search: { q: query } });
            }}
          >
            <label className="vh" htmlFor="header-search-open">
              Search the range
            </label>
            {/* BRIEF.md 2.14: the field carried the same weight as the logo, so
                it is collapsed at every width and this button is now the whole
                control. It opens the existing full-screen overlay unchanged. */}
            <button
              className="header-search__glyph"
              type="button"
              aria-label="Search the range"
              onClick={() => {
                if (!searchOpen) onSearch();
              }}
            >
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
            <input
              id="header-search-open"
              className="header-search__input"
              type="search"
              placeholder="Search the range"
              value={query}
              autoComplete="off"
              aria-expanded={Boolean(searchOpen)}
              aria-controls="search-panel"
              onClick={() => {
                if (!searchOpen) onSearch();
              }}
              onChange={(event) => {
                onQuery(event.target.value);
                if (!searchOpen) onSearch();
              }}
            />
            {query || searchOpen ? (
              <button
                className="header-search__clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  onQuery("");
                  onCloseSearch();
                }}
              >
                <X size={15} strokeWidth={1.6} aria-hidden="true" />
              </button>
            ) : null}
          </form>
          <button
            id="header-wishlist"
            className="icon-btn"
            type="button"
            onClick={openWishlist}
            aria-label={shownWish ? `Wishlist, ${shownWish} saved` : "Wishlist"}
          >
            <Heart size={18} strokeWidth={1.6} fill={shownWish ? "currentColor" : "none"} aria-hidden="true" />
            {shownWish ? <span className="bag-count">{shownWish}</span> : null}
          </button>
          <button id="header-bag" className="icon-btn" type="button" onClick={openBag} aria-label={shown === 0 ? "Bag, empty" : `Bag, ${shown} ${shown === 1 ? "item" : "items"}`}>
            <ShoppingBag size={18} strokeWidth={1.6} aria-hidden="true" />
            <span className={`bag-count${bump ? " is-bump" : ""}`} hidden={shown === 0}>{shown}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="footer-brand">
            <img className="brand__logo" src="/media/brand/ht-logo-test.svg" alt="Home Trends Furniture" width={221} height={64} />
            <p className="site-line">Furniture for real rooms, in Ennis.</p>
            <p className="footer-stamp">
              {STORE.owners}
            </p>
          </div>
          <a href={STORE.phoneHref}>{STORE.phone}</a>
          <a href={STORE.emailHref}>{STORE.email}</a>
        </div>
        <div>
          <h3>Shop</h3>
          <Link to="/shop">All furniture</Link>
          <Link to="/collections/$slug" params={{ slug: "living-room" }}>
            Sofas & chairs
          </Link>
          <Link to="/collections/$slug" params={{ slug: "beds-mattresses" }}>
            Beds & mattresses
          </Link>
          <Link to="/collections/$slug" params={{ slug: "dining" }}>
            Dining
          </Link>
          <Link to="/collections/$slug" params={{ slug: "flooring" }}>
            Flooring
          </Link>
          <Link to="/bespoke">Upholstery</Link>
        </div>
        <div>
          <h3>Visit</h3>
          <Link to="/showroom">Plan your visit</Link>
          <a href={STORE.maps}>Directions</a>
          <Link to="/about">About Home Trends</Link>
          <Link to="/contact">Contact</Link>
          <a href={STORE.instagram} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
        <div>
          <h3>Help</h3>
          <Link to="/showroom">Find your pieces</Link>
          <Link to="/saved">Saved pieces</Link>
          <Link to="/delivery">Delivery</Link>
          <Link to="/returns">Returns</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <Link to="/cookies">Cookie preferences</Link>
        </div>
      </div>
      <div className="footer-legal">
        <span>© {new Date().getFullYear()} Home Trends Furniture</span>
        <span>
          {STORE.address} · {STORE.hoursShort}
        </span>
      </div>
    </footer>
  );
}

type MenuLink = { label: string; slug: string } | { label: string; to: "/shop" | "/bespoke" };

/* Five columns, as briefed. Every slug below is a real collection in
   COLLECTIONS - nothing here invents a category to fill a column out. */
const MENU_COLUMNS: { heading: string; items: MenuLink[] }[] = [
  {
    heading: "Living",
    items: [
      { label: "Sofas", slug: "living-room" },
      { label: "Chairs & footstools", slug: "chairs-footstools" },
      { label: "Living room", slug: "living-room" },
      { label: "Objects", slug: "objects" },
    ],
  },
  {
    heading: "Dining",
    items: [
      { label: "Dining Tables", slug: "dining-tables" },
      { label: "Dining Chairs & Benches", slug: "dining-chairs-benches" },
      { label: "Dining Sets", slug: "dining-sets" },
    ],
  },
  {
    heading: "Bedroom",
    items: [
      { label: "Beds", slug: "beds" },
      { label: "Mattresses", slug: "mattresses" },
      { label: "Bedroom furniture", slug: "bedroom-furniture" },
      { label: "Kids furniture", slug: "kids-furniture" },
    ],
  },
  {
    heading: "Flooring",
    items: [
      { label: "Flooring", slug: "flooring" },
      { label: "Rugs", slug: "rugs" },
      { label: "Modern rugs", slug: "rugs-modern" },
      { label: "Traditional rugs", slug: "rugs-traditional" },
      { label: "Shaggy rugs", slug: "rugs-shaggy" },
    ],
  },
  {
    heading: "More",
    items: [
      { label: "Lighting", slug: "lighting" },
      { label: "Garden furniture", slug: "garden-furniture" },
      { label: "Home office", slug: "home-office" },
      { label: "Accessories", slug: "accessories" },
    ],
  },
];

type VisitLink = {
  label: string;
  to?: "/showroom" | "/come-in" | "/find" | "/about" | "/contact" | "/delivery" | "/returns" | "/privacy" | "/terms";
  href?: string;
};

/* Built lazily, not as a module-level const. STORE lives in its own chunk in
   the SSR bundle, and reading STORE.maps at module-evaluation time threw
   "Cannot read properties of undefined (reading 'maps')" on the server while
   working fine in dev. Anything touching STORE has to be deferred to render. */
function menuVisit(): { heading: string; items: VisitLink[] }[] {
  return [
  {
    heading: "The floor",
    items: [
      { label: "Showroom", to: "/showroom" },
      { label: "Come in", to: "/come-in" },
      { label: "Find your pieces", to: "/find" },
    ],
  },
  {
    heading: "House",
    items: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Directions", href: STORE.maps },
    ],
  },
    {
      heading: "Help",
      items: [
        { label: "Delivery", to: "/delivery" },
        { label: "Returns", to: "/returns" },
        { label: "Privacy", to: "/privacy" },
        { label: "Terms", to: "/terms" },
      ],
    },
  ];
}

function MenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<"shop" | "visit">("shop");
  const { shown, on } = usePresence(open);
  const dialogRef = useDialogFocus(open && shown, onClose);
  useEffect(() => {
    if (open) setTab("shop");
  }, [open]);
  if (!shown) return null;
  return (
    <aside
      ref={dialogRef}
      id="site-menu"
      className={`menu-panel${on ? " is-on" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
    >
      <div className="menu-split__image">
        {/* BRIEF.md 1.2. Was menu-sconce.jpg — despite the filename and its alt
            text, that file is a red coral-branch lamp with fabric shades, which
            fights the muted palette and shows no furniture. Replaced with a
            room set already in the repo. */}
        <img
          src="/media/editorial/shop-room-living.webp"
          alt="A linen sofa, dark timber coffee table and boucle chair in the Home Trends showroom, Ennis"
        />
      </div>
      <div className="menu-split__body">
        <button id="menu-close" className="menu-split__close" type="button" onClick={onClose} aria-label="Close menu">
          <X size={22} strokeWidth={1.2} aria-hidden="true" />
        </button>
        <div className="menu-split__tabs" role="tablist" aria-label="Menu sections">
          <button
            type="button"
            role="tab"
            id="menu-tab-shop"
            aria-selected={tab === "shop"}
            aria-controls="menu-pane-shop"
            className={tab === "shop" ? "is-on" : undefined}
            onClick={() => setTab("shop")}
          >
            Shop
          </button>
          <button
            type="button"
            role="tab"
            id="menu-tab-visit"
            aria-selected={tab === "visit"}
            aria-controls="menu-pane-visit"
            className={tab === "visit" ? "is-on" : undefined}
            onClick={() => setTab("visit")}
          >
            Visit
          </button>
        </div>
        {tab === "shop" ? (
          <nav className="menu-cols" id="menu-pane-shop" role="tabpanel" aria-labelledby="menu-tab-shop" aria-label="Shop">
            {MENU_COLUMNS.map((group) => (
              <div key={group.heading}>
                <p>{group.heading}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      {"to" in item ? (
                        <Link to={item.to}>
                          {item.label}
                        </Link>
                      ) : (
                        <Link to="/collections/$slug" params={{ slug: item.slug }}>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Link className="menu-cols__all" to="/shop">
              Shop all
            </Link>
          </nav>
        ) : (
          <nav className="menu-cols" id="menu-pane-visit" role="tabpanel" aria-labelledby="menu-tab-visit" aria-label="Visit">
            {menuVisit().map((group) => (
              <div key={group.heading}>
                <p>{group.heading}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <a href={item.href} onClick={onClose}>
                          {item.label}
                        </a>
                      ) : (
                        <Link to={item.to!}>
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}
        <div className="menu-split__foot">
          <a className="menu-split__phone" href={STORE.phoneHref}>
            {STORE.phone}
          </a>
          <span>{STORE.address}</span>
        </div>
      </div>
    </aside>
  );
}

const SEARCH_POPULAR = [
  { label: "sofas", slug: "living-room" },
  { label: "chairs", slug: "chairs-footstools" },
  { label: "beds", slug: "beds" },
  { label: "dining tables", slug: "dining" },
  { label: "rugs", slug: "rugs" },
  { label: "flooring", slug: "flooring" },
  { label: "garden", slug: "garden-furniture" },
  { label: "lamps", slug: "lighting" },
];

const SEARCH_HELP: { label: string; to: "/contact" | "/come-in" | "/delivery" | "/returns" }[] = [
  { label: "Contact us", to: "/contact" },
  { label: "Come in", to: "/come-in" },
  { label: "Delivery", to: "/delivery" },
  { label: "Returns", to: "/returns" },
];

/* Four category cards. These photographs already exist, so per the brief they
   are used as they are rather than replaced with boxes or new /media/nav art. */
const SEARCH_TILES = [
  { label: "Dining", slug: "dining", image: "/media/editorial/search-tables.jpg", alt: "A dining table laid in afternoon light in the Home Trends showroom, Ennis" },
  { label: "Seating", slug: "chairs-footstools", image: "/media/editorial/search-seating.jpg", alt: "An upholstered fireside chair on the Home Trends floor, Ennis" },
  { label: "Lighting", slug: "lighting", image: "/media/editorial/search-lamp.jpg", alt: "A table lamp lit against a quiet wall in the Home Trends showroom, Ennis" },
  { label: "Sofas", slug: "living-room", image: "/media/editorial/search-sofa.jpg", alt: "An oatmeal linen sofa in the Home Trends showroom, Ennis" },
];

function SearchDrawer({
  open,
  onClose,
  query,
  onQuery,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onQuery: (value: string) => void;
}) {
  const navigate = useNavigate();
  const results = useMemo(() => (query.trim() ? searchProducts(query) : []), [query]);
  const shownResults = results.slice(0, 6);
  const { shown, on } = usePresence(open);
  // BRIEF.md 2.14 collapsed the header field to an icon, so focus lands on the
  // panel's own field. The overlay itself is otherwise unchanged.
  const dialogRef = useDialogFocus(open && shown, onClose, "search-panel-field");
  if (!shown) return null;
  const trimmed = query.trim();
  return (
    <>
      <button className={`overlay overlay--search${on ? " is-on" : ""}`} aria-label="Close search" onClick={onClose} />
      <aside
        ref={dialogRef}
        id="search-panel"
        className={`search-panel${on ? " is-on" : ""}`}
        role="dialog"
        aria-label="Search the range"
      >
        <div className="search-panel__inner">
          {/* On small screens the header field is too narrow to type into
              comfortably, so the panel carries its own. */}
          <form
            className="search-panel__mobile"
            onSubmit={(event) => {
              event.preventDefault();
              if (!trimmed) return;
              onClose();
              void navigate({ to: "/find", search: { q: query } });
            }}
          >
            <label className="vh" htmlFor="search-panel-field">
              Search the range
            </label>
            <input
              id="search-panel-field"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Search the range"
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              <Search size={16} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </form>

          <div className="search-drop">
            <div className="search-drop__side">
              <nav className="search-drop__popular" aria-label="Popular searches">
                <p>Popular searches</p>
                <ul>
                  {SEARCH_POPULAR.map((item) => (
                    <li key={item.slug + item.label}>
                      <Link to="/collections/$slug" params={{ slug: item.slug }}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <nav className="search-drop__help" aria-label="Can we help">
                <p>Can we help?</p>
                <ul>
                  {SEARCH_HELP.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {trimmed && shownResults.length ? (
              <div className="search-drop__results">
                {shownResults.map((product) => (
                  <Link
                    key={product.slug}
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="search-panel__hit"
                  >
                    <ProductMedia product={product} width={56} height={70} />
                    <span>
                      <strong>{product.name}</strong>
                      <span>From {euro(product.fromPrice)}</span>
                    </span>
                  </Link>
                ))}
                <Link className="search-drop__all" to="/find" search={{ q: query }}>
                  {results.length > 6 ? `View all ${results.length} results` : "View all results"}
                </Link>
              </div>
            ) : trimmed ? (
              <div className="search-drop__empty" role="status">
                <p>No matching pieces. Try a room, a product type or a material.</p>
                <Link to="/contact">
                  Ask the showroom →
                </Link>
              </div>
            ) : (
              <div className="search-drop__tiles">
                {SEARCH_TILES.map((tile) => (
                  <Link
                    key={tile.slug}
                    to="/collections/$slug"
                    params={{ slug: tile.slug }}
                    className="search-tile"
                  >
                    <figure>
                      <img src={tile.image} alt={tile.alt} loading="lazy" />
                    </figure>
                    <span>
                      {tile.label} <span aria-hidden="true">→</span>
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [bag, setBag] = useState(false);
  const [wish, setWish] = useState(false);
  const [query, setQuery] = useState("");
  const add = useBag((state) => state.add);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const dark = pathname === "/";
  const pruneRetired = useBag((state) => state.pruneRetired);
  const pruneWish = useWishlist((state) => state.pruneRetired);

  useEffect(() => {
    pruneRetired();
    pruneWish();
  }, [pruneRetired, pruneWish]);

  useEffect(() => {
    setMenu(false);
    setSearch(false);
    setBag(false);
    setWish(false);
    setQuery("");
  }, [pathname]);

  /* Mobile pass §4. Close-on-route-change, Escape-with-focus-return and the
     Cmd/Ctrl+K shortcut already existed. These three did not. */
  const overlayOpen = menu || search || bag || wish;
  const closeAll = useCallback(() => {
    setMenu(false);
    setSearch(false);
    setBag(false);
    setWish(false);
  }, []);

  /* Android back closes the overlay instead of leaving the site. A history
     entry is pushed on open and consumed on close, so the button that users
     expect to mean "dismiss this" does not exit to the previous page. */
  useEffect(() => {
    if (!overlayOpen) return;
    window.history.pushState({ htOverlay: true }, "");
    const onPop = () => closeAll();
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      /* Closed by Escape, a link or the close control rather than by Back:
         drop the entry we added so Back is not left as a no-op. */
      if (window.history.state?.htOverlay) window.history.back();
    };
  }, [overlayOpen, closeAll]);

  /* Focus trap. Tab used to walk straight out of an open drawer and into the
     page behind it, which is invisible to a keyboard or switch user. */
  useEffect(() => {
    if (!overlayOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const panel = document.querySelector<HTMLElement>(
        ".menu-panel, .search-panel, .bag-drawer, .wishlist-drawer",
      );
      if (!panel) return;
      const focusable = [...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )].filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!panel.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [overlayOpen]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (search) {
          setSearch(false);
          setQuery("");
          requestAnimationFrame(() => document.getElementById("header-search-open")?.focus());
          return;
        }
        if (menu) {
          setMenu(false);
          requestAnimationFrame(() => document.getElementById("header-menu")?.focus());
          return;
        }
        if (bag) {
          setBag(false);
          requestAnimationFrame(() => document.getElementById("header-bag")?.focus());
          return;
        }
        if (wish) {
          setWish(false);
          requestAnimationFrame(() => document.getElementById("header-wishlist")?.focus());
          return;
        }
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMenu(false);
        setBag(false);
        setWish(false);
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [search, menu, bag, wish]);

  /* BRIEF.md 4.7. ?reset clears the bag between run-throughs. Deliberately not
     a visible control; documented in the README. */
  useEffect(() => {
    applyDemoReset();
  }, []);

  /* Body scroll lock. This already existed; §4 only adds the scrollbar-gutter
     compensation so desktop does not shift horizontally when a drawer opens.
     Deliberately NOT duplicated in the §4 block above: a second lock captured
     "hidden" as its restore value and left the page permanently unscrollable
     after the overlay closed. */
  useEffect(() => {
    if (!menu && !search && !bag && !wish) return;
    const previous = document.body.style.overflow;
    const previousHtml = document.documentElement.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (gutter > 0) document.body.style.paddingRight = `${gutter}px`;
    return () => {
      document.body.style.overflow = previous;
      document.documentElement.style.overflow = previousHtml;
      document.body.style.paddingRight = previousPadding;
    };
  }, [menu, search, bag, wish]);

  return (
    <ChromeActions.Provider
      value={{
        openBag: () => {
          setWish(false);
          setSearch(false);
          setBag(true);
        },
        openWishlist: () => {
          setBag(false);
          setSearch(false);
          setWish(true);
        },
        addToBag: (line, quantity = 1) => {
          add(line, quantity);
          setWish(false);
          setSearch(false);
          setBag(true);
        },
      }}
    >
      <div className={dark ? "theme-dark" : "theme-light"}>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader
          onMenu={() => {
            setSearch(false);
            setBag(false);
            setWish(false);
            setMenu(true);
          }}
          onSearch={() => {
            setMenu(false);
            setBag(false);
            setWish(false);
            setSearch(true);
          }}
          onCloseSearch={() => {
            setSearch(false);
            setQuery("");
          }}
          query={query}
          onQuery={setQuery}
          searchOpen={search}
          menuOpen={menu}
          overHero={dark && !menu && !search}
        />
        {children}
        <div className="site-close">
          <SiteFooter />
        </div>
        <MenuDrawer
          open={menu}
          onClose={() => {
            setMenu(false);
            requestAnimationFrame(() => document.getElementById("header-menu")?.focus());
          }}
        />
        <BagDrawer
          open={bag}
          onClose={() => {
            setBag(false);
            requestAnimationFrame(() => document.getElementById("header-bag")?.focus());
          }}
        />
        <WishlistDrawer
          open={wish}
          onClose={() => {
            setWish(false);
            requestAnimationFrame(() => document.getElementById("header-wishlist")?.focus());
          }}
        />
        <SearchDrawer
          open={search}
          onClose={() => {
            setSearch(false);
            setQuery("");
            requestAnimationFrame(() => document.getElementById("header-search-open")?.focus());
          }}
          query={query}
          onQuery={setQuery}
        />
      </div>
    </ChromeActions.Provider>
  );
}

export function ListingToolbar({
  count,
  sort,
  onSort,
}: {
  count: number;
  sort: string;
  onSort: (value: string) => void;
}) {
  return (
    <div className="toolbar">
      <p>
        {count} {count === 1 ? "piece" : "pieces"}
      </p>
      <label>
        Sort{" "}
        <select value={sort} onChange={(event) => onSort(event.target.value)}>
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="name">Name A–Z</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </label>
    </div>
  );
}

export function sortProducts<T extends { featured?: boolean; newArrival?: boolean; name: string; fromPrice: number }>(
  items: T[],
  sort: string,
) {
  const copy = [...items];
  if (sort === "newest") return copy.sort((a, b) => Number(b.newArrival) - Number(a.newArrival));
  if (sort === "name") return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price-asc") return copy.sort((a, b) => a.fromPrice - b.fromPrice);
  if (sort === "price-desc") return copy.sort((a, b) => b.fromPrice - a.fromPrice);
  return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
}

export function RelatedRail({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="related">
      <p className="eyebrow">The room around it</p>
      <h2 className="ed-copy" style={{ fontFamily: "var(--font-display)", fontSize: "var(--t-title)", margin: "0 0 1.25rem" }}>
        Complete the room
      </h2>
      <div className="product-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
