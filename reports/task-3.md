# Task 3 — product presentation

- Product cards use one 4:5 object-cover treatment. Scripted edge-connected white/near-white replacement uses #EFEAE1 without recolouring disconnected white upholstery. Original sources remain cached outside the deployed tree.
- Full-resolution download is limited to the exact Shopify shop prefix already in the supplied catalogue. Size suffixes and width restrictions are removed. All 2,956 image entries processed across 742 products; 1,250 backgrounds changed. An adaptive export size resolved the 17 detailed rug images that initially exceeded the byte budget. Every processed image is available to the detail gallery, subject to the signage audit.
- Both WebP and JPEG exports are below 200,000 bytes, with embedded small blur placeholders.
- 716 of 742 live products have at least one compare_at_price. The minimum-price variant determines both the displayed price and its matching compare-at price; empty live compare-at values are removed. Price decimals are retained. See prices-and-availability.csv for the demo/live diff.
- Default action: Reserve to view in Ennis, with product title, ID and URL prefilled in email to hometrendsennis@gmail.com. Add to bag is opt-in via enableBag, false by default. No checkout decision was made.
- Deferred: no outbound mail service is configured. The action opens the visitor’s email composer and does not claim to submit or reserve automatically.
- Deferred: no source confirms physical showroom stock or a 4–6 week lead time. Both UI treatments are supported only when an owner provides a value; unsupported claims are hidden and reported.
- Removed product-card and product-detail wishlist hearts, PDP supplier origin, empty specifications, ambiguous availability and unsupported delivery boilerplate. Header is unchanged; it has an existing functional saved-items drawer.
- Task 0 verification: Standard Protection was read back successfully, and the deployment URL redirects to Vercel authentication. The main alias remains public under Hobby. Added a build-output finalizer because prebuilt deployment ignored the root vercel.json header; robots meta and robots.txt were already live.
- The working-copy startup script now resolves its own directory instead of hardcoding the original Linux sandbox path.
