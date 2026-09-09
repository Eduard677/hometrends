# What the current HomeTrends catalogue data shows

From a full scrape of hometrendsfurniture.ie, 7 Sep 2026. 742 products, 2,156 variants.

This is about their existing Shopify data, not the demo. Some of it is worth raising in
the pitch — it's concrete evidence that someone has looked properly, and each item is
something you'd fix as part of the work.

---

## 1. Sale prices are displaying incorrectly on 120 variants

`compare_at_price` is set *lower* than the actual price, so the "was" figure struck
through beside the current price is smaller than what's being charged. The most visible
case is Horizontal Wall Beds: €19,899 with €2,489 struck through beside it. Three more
have the two prices set identically, producing a strikethrough of the same number.

This is live on their site now.

## 2. 86% of the catalogue is permanently marked down

1,845 of 2,156 variants carry a markdown, median 29% off, one at 91%. When almost
everything is discounted the discount stops meaning anything, and the site reads as a
clearance outlet rather than a furniture showroom.

Worth raising gently, since it's a merchandising decision rather than a mistake. It's
also worth them taking their own advice on: EU price-display rules govern how a "was"
price can be shown, and a permanent markdown is the pattern those rules were written
about. I'm not a lawyer and this isn't legal advice — it's a flag for them to check with
someone who is.

## 3. Four products in ten have no category

306 products have an empty `product_type` and 33 have no tags at all. Anyone filtering
or browsing by category on the current site simply won't see them. There are also 848
distinct tags in use, many near-duplicates of each other, which is why the current
navigation is hard to organise.

This is the strongest argument for the work you're proposing: the catalogue is fine, the
structure around it isn't.

## 4. Size values aren't standardised

The same bed size is entered as `4ft6`, `4'6` and `4ft 6`. `5ft`, `5'` and `5' King` all
coexist. Rug dimensions (`Medium 120x170`, `120 x 170`) are stored under the same "Size"
field as bed sizes. Any size filter built on this produces duplicates until it's cleaned.

## 5. Colour is spelled two ways

152 products use "Color", 47 use "Colour". Customers see whichever spelling was typed
that day.

## 6. Stock isn't surfaced

236 variants are out of stock and 15 products are entirely unavailable, with no
indication anywhere. For a showroom where the pitch is "come and see it", telling someone
a piece isn't currently available before they drive to Ennis is worth something.

---

## How this lands in the pitch

Lead with 1 and 3. The first is a visible error costing them credibility on their own
site; the second explains why customers struggle to find anything. Both are things you
fix as a matter of course, which makes the point that the work is not decoration.

Hold 2 back unless the conversation is going well. It questions how they price, which is
their business and not yours on a first meeting.
