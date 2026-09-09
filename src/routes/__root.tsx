import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { AppChrome } from "@/components/chrome";
import appCss from "../styles.css?url";
import appleCss from "../styles.apple.css?url";
import stage2Css from "../styles.stage2.css?url";
import stage3Css from "../styles.stage3.css?url";
import stage4Css from "../styles.stage4.css?url";
import stage5Css from "../styles.stage5.css?url";
import stage6Css from "../styles.stage6.css?url";
import showroomCss from "../styles.showroom.css?url";
import stage7Css from "../styles.stage7.css?url";
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
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: appleCss },
      { rel: "stylesheet", href: stage2Css },
      { rel: "stylesheet", href: stage3Css },
      { rel: "stylesheet", href: stage4Css },
      { rel: "stylesheet", href: stage5Css },
      { rel: "stylesheet", href: stage6Css },
      { rel: "stylesheet", href: showroomCss },
      { rel: "stylesheet", href: stage7Css },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&display=swap",
      },
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
