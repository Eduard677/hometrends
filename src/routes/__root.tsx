import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppChrome } from "@/components/chrome";
import bundleCss from "../styles.bundle.css?url";
import { localBusiness, safeJson } from "@/lib/seo";

const APP_NAME = "Home Trends Furniture";

export const Route = createRootRoute({
  head: () => ({
    scripts: [{ type: "application/ld+json", children: safeJson(localBusiness()) }],
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Sofas, beds, mattresses, dining, flooring and rugs at Home Trends, 29 Parnell Street, Ennis. Irish family-owned since 2013. Furniture you can trust, in person.",
      },
      { name: "theme-color", content: "#EFEAE1" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      /* Self-hosted fonts. Preload only the two faces used above the fold —
         the body sans and the display regular — so they are fetched in
         parallel with the CSS rather than discovered after it. The other five
         resolve normally; preloading all seven would compete for bandwidth
         with the LCP image. */
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/inter-400.woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        type: "font/woff2",
        href: "/fonts/cormorant-garamond-400.woff2",
        crossOrigin: "anonymous",
      },
      // One link, not nineteen. styles.bundle.css @imports them all in the
      // order they were linked here; Vite inlines it into a single file at
      // build time. The order lives in that file now — see its header.
      { rel: "stylesheet", href: bundleCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en-IE" className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <AppChrome>
            <Outlet />
          </AppChrome>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
