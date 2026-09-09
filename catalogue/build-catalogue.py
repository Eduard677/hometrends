#!/usr/bin/env python3
"""
Build a clean, demo-ready catalogue from the hometrendsfurniture.ie scrape.
Input : products.json (raw scrape)
Output: catalogue.json (trimmed + normalised)  and  catalogue-report.md
Re-runnable: python3 build-catalogue.py <input> <outdir>
"""
import json, re, sys, collections, pathlib, html

SRC = sys.argv[1] if len(sys.argv) > 1 else "products.json"
OUT = pathlib.Path(sys.argv[2] if len(sys.argv) > 2 else ".")

# tag -> category, checked in order. First match wins.
TAG_MAP = [
    ("Dining",   ["dining set", "dining table", "dining chair", "dining bench", "dining"]),
    ("Bedroom",  ["wardrobe", "chest of drawers", "bedside", "locker", "bed frame", "bedframe",
                  "divan", "wooden bed", "ottoman", "storage bed", "bunk bed", "fold up bed",
                  "headboard", "dressing table", "bedroom", "beds", "bed"]),
    ("Mattresses", ["mattress"]),
    ("Rugs",     ["rug", "shaggy"]),
    ("Flooring", ["flooring", "laminate", "vinyl"]),
    ("Living",   ["sofa", "armchair", "accent chair", "coffee table", "console", "bookcase",
                  "cabinet", "display unit", "tv unit", "nest of tables", "footstool",
                  "sideboard", "stool", "bean bag", "lounger", "chairs", "living room",
                  "recliner"]),
    ("Kids",     ["kids", "children", "high sleeper", "bunk"]),
    ("Garden",   ["garden", "outdoor", "patio"]),
    ("Lighting", ["lamp", "light"]),
    ("Office",   ["office", "desk"]),
    ("Accessories", ["wall art", "wall decoration", "mirror", "cushion", "throw", "decor"]),
]
TYPE_MAP = {
    "bedroom": "Bedroom", "beds": "Bedroom", "chest": "Bedroom",
    "bedside locker": "Bedroom", "dressing table": "Bedroom",
    "living room": "Living", "sofas & chairs": "Living",
    "console table": "Living", "nest of tables": "Living",
    "dining": "Dining", "dining table": "Dining",
    "mattress": "Mattresses", "kids furniture": "Kids",
    "wall decoration": "Accessories", "furniture": None,
}

SIZE_RE = re.compile(r"^\s*(\d)\s*(?:ft|')\s*(\d{1,2})?\s*(?:in|\")?\s*(king|single|double)?\s*$", re.I)

def norm_size(v):
    """4ft6 / 4'6 / 4ft 6 / 5' King -> 4ft6 / 5ft (King). Non-bed sizes pass through."""
    m = SIZE_RE.match(v)
    if not m:
        return v.strip()
    ft, inch, suffix = m.group(1), m.group(2), m.group(3)
    out = f"{ft}ft{inch}" if inch and inch != "0" else f"{ft}ft"
    return f"{out} ({suffix.title()})" if suffix else out

def norm_option_name(n):
    n = (n or "").strip()
    return "Colour" if n.lower() in ("color", "colour") else n

def categorise(p):
    t = (p.get("product_type") or "").strip().lower()
    if t in TYPE_MAP and TYPE_MAP[t]:
        return TYPE_MAP[t]
    if t:
        for cat, keys in TAG_MAP:
            if any(k in t for k in keys):
                return cat
    hay = " | ".join(p.get("tags") or []).lower() + " | " + p["title"].lower()
    for cat, keys in TAG_MAP:
        if any(k in hay for k in keys):
            return cat
    return "Other"

def money(x):
    """EUR string -> integer cents. No floats downstream."""
    return int(round(float(x) * 100))

raw = json.load(open(SRC))
out, fixed_price, fixed_colour, fixed_size = [], 0, 0, 0

for p in raw:
    variants = []
    for v in p["variants"]:
        price = money(v["price"])
        cap = v.get("compare_at_price")
        was = money(cap) if cap else None
        # Drop compare_at when it is not a genuine markdown (120 inverted, 3 equal).
        if was is not None and was <= price:
            was, _ = None, fixed_price
            fixed_price += 1
        label = (v.get("title") or "").strip()
        if label.lower() == "default title":
            label = ""
        raw_label = label
        label = norm_size(label) if label else ""
        if label != raw_label:
            fixed_size += 1
        variants.append({
            "id": str(v["id"]),
            "label": label,
            "price": price,
            "was": was,
            "available": bool(v.get("available")),
        })

    options = []
    for o in p.get("options") or []:
        name = norm_option_name(o["name"])
        if name.lower() == "title":
            continue                      # Shopify default, never shown
        if name != o["name"]:
            fixed_colour += 1
        vals = [norm_size(x) for x in o["values"]] if name.lower() == "size" else list(o["values"])
        options.append({"name": name, "values": vals})

    prices = [v["price"] for v in variants]
    lo, hi = min(prices), max(prices)
    body = html.unescape(p.get("body_text") or "").strip()

    out.append({
        "id": str(p["id"]),
        "handle": p["handle"],
        # supplier codes (-GI, GA, HJ, -IM) stripped for display
        "title": re.sub(r"[\s\-]+[A-Z]{2}$", "", p["title"]).strip(),
        "category": categorise(p),
        "description": body[:400],
        "images": [i["src"] for i in (p.get("images") or [])][:5],
        "options": options,
        "variants": variants,
        "priceMin": lo,
        "priceMax": hi,
        "hasRange": lo != hi,                       # drives "From €"
        "cta": "add" if len(variants) == 1 else "options",   # drives the CTA
        "inStock": any(v["available"] for v in variants),
    })

OUT.mkdir(parents=True, exist_ok=True)
(OUT / "catalogue.json").write_text(json.dumps(out, separators=(",", ":"), ensure_ascii=False))

cats = collections.Counter(p["category"] for p in out)
report = [
    "# Catalogue build report", "",
    f"- products: {len(out)}",
    f"- variants: {sum(len(p['variants']) for p in out)}",
    f"- direct add-to-bag (single variant): {sum(1 for p in out if p['cta']=='add')}",
    f"- choose-options (multi variant): {sum(1 for p in out if p['cta']=='options')}",
    f"- shows a price range (\"From EUR\"): {sum(1 for p in out if p['hasRange'])}",
    f"- out of stock entirely: {sum(1 for p in out if not p['inStock'])}", "",
    "## Repairs applied", "",
    f"- invalid markdowns dropped (was <= price): {fixed_price}",
    f"- Color -> Colour renames: {fixed_colour}",
    f"- size values normalised: {fixed_size}", "",
    "## Categories", "",
]
report += [f"- {c}: {n}" for c, n in cats.most_common()]
(OUT / "catalogue-report.md").write_text("\n".join(report) + "\n")
print("\n".join(report))
