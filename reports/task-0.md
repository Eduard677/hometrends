# Task 0 — demo indexing safeguards

- Added global `noindex, nofollow` robots meta, `Disallow: /` in robots.txt and a site-wide `X-Robots-Tag: noindex, nofollow` Vercel response header.
- Build, lint and typecheck passed. Lint has four pre-existing warnings; header files are unchanged.
- Vercel rejected `ssoProtection.deploymentType = all` with HTTP 428: “Vercel Authentication is not available on your plan for production deployments”. No paid upgrade was made.
- Requested Standard Protection (`prod_deployment_urls_and_all_previews`) for the linked project `hometrends-deploy`. This protects deployment URLs and previews but leaves the main production alias public. Full production authentication requires an owner plan decision.
- Noindex reduces indexing exposure but is not access control, nor an instant removal of any previously indexed pages.
