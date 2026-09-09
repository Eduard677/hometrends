# Task 5 — catalogue reconciliation

Source: products-catalogue.json, the supplied 7 September 2026 live snapshot. Reproducible command: `node scripts/reconcile-catalogue.mjs`. Baseline for auditing: commit 829f45f, before these tasks.

- Imported all 742 products (nine missing from the 733-product demo). Restored live descriptions as safe plain text with paragraphs; removed supplier HTML and corrected the requested spelling/punctuation errors. No missing descriptions were invented.
- Kerry Recliner Sofa Range / kingsley-recliner-sofa-range, Antrim bedframe / waterford-bedframe-copy and Waterloo Fabric Recliner Sofa / washington-fabric-recliner-sofa already have those title/handle mismatches in the live snapshot. They are live naming, not evidence of demo import corruption.
- Generated clean slugs from cleaned live titles and permanent 301 redirects from both live handles and prior demo paths. 383 redirects. One duplicate title uses a stable product-ID suffix; the product already owning the canonical path retains it. See slug-collisions.csv.
- Stripped the specified supplier suffixes plus previously confirmed GI/JB codes, title-cased all-capital descriptive titles and preserved SKU-led names. 48 SKU-led names are in sku-products-for-owners.csv with image and collection.
- Classified using specific title nouns, tags and specific product types. Generic Living Room/Furniture is not used as a catch-all. Living Room now has 70 products, with wardrobes, rugs, office desks and gift vouchers routed separately. Full reasoning is in catalogue-collection-diff.csv; six ambiguous products are in unclassified-products.csv.
- Recovered size options and stated dimensions for 480 products, including explicit dimensions in SKU titles. 262 still need dimensions: missing-dimensions.csv. No measurements were guessed. Material fields are shown only where explicitly labelled in the source description.
- Collection and all-furniture pages render 24 products per page, with accessible previous/next controls and sorting resetting pagination. Images are lazy loaded.
- Header/search/menu remain untouched. Catalogue lookup accepts old handles so existing saved items continue to resolve, while product routes redirect to canonical slugs.
- Business decisions deferred: ambiguous collection assignments, actual names for SKU products, absent dimensions/materials, physical stock/lead times and enabling checkout.
