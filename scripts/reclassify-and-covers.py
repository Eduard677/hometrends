#!/usr/bin/env python3
"""Exclusive collection tags + studio covers from the real product photos."""
from __future__ import annotations

import json
import re
import time
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps
from rembg import new_session, remove

ROOT = Path("/workspace")
SHOP_JSON = ROOT / "src/data/ht-shop.json"
SRC_DIR = ROOT / "public/media/shopify"
OUT_DIR = ROOT / "public/media/covers"
W, H = 900, 1125  # 4:5 card

WORD = re.compile(r"[a-z0-9]+")


def words(s: str) -> set[str]:
    return set(WORD.findall(s.lower()))


def classify(name: str, category: str, tags: list[str], description: str = "") -> tuple[str, str, list[str]]:
    blob = f"{name} {category} {' '.join(tags)} {description[:200]}".lower()
    w = words(blob)

    if "rug" in w or "rugs" in w:
        extra = ["rugs"]
        if any(x in blob for x in ("shaggy", "shag")):
            extra.append("rugs-shaggy")
        elif any(x in blob for x in ("traditional", "oriental", "persian", "runner", "kilim")):
            extra.append("rugs-traditional")
        else:
            extra.append("rugs-modern")
        return "Rugs", "Rugs", extra

    if any(x in w for x in ("garden", "outdoor", "patio")):
        return "Garden", "Outdoor", ["garden-furniture"]

    if "mattress" in w:
        return "Beds & Mattresses", "Mattresses", ["mattresses", "beds-mattresses"]

    if any(x in w for x in ("wardrobe", "wardrobes", "locker", "lockers", "chest", "chests", "headboard", "blanket")) or "chest of drawers" in blob or "bedside" in blob or "dressing table" in blob or "vanity" in blob:
        extra = ["bedroom-furniture", "bedroom"]
        if any(x in w for x in ("kid", "kids", "bunk", "cabin")):
            extra.append("kids-furniture")
        return "Bedroom furniture", "Storage", extra

    if any(x in w for x in ("bunk", "cabin")) or (("kid" in w or "kids" in w) and "bed" in w):
        return "Kids", "Kids furniture", ["kids-furniture", "beds", "beds-mattresses", "bedroom"]

    if "sofa" in w or "chaise" in w or "suite" in w:
        return "Sofas & Chairs", "Sofas", ["sofas-chairs", "living-room"]

    if any(x in w for x in ("recliner", "armchair", "footstool", "ottoman", "lounger")):
        return "Sofas & Chairs", "Chairs", ["sofas-chairs", "chairs-footstools", "living-room"]

    if "bed" in w:
        extra = ["beds", "beds-mattresses", "bedroom"]
        if any(x in w for x in ("kid", "kids", "bunk")):
            extra.append("kids-furniture")
        return "Beds & Mattresses", "Beds", extra

    if "lamp table" in blob or "lamp-table" in blob:
        return "Living Room", "Tables", ["living-room"]

    if any(x in blob for x in ("floor lamp", "table lamp")) or ("lamp" in w and "table" not in w):
        return "Objects", "Lighting", ["lighting", "objects"]

    if "mirror" in w:
        return "Objects", "Mirrors", ["accessories", "objects"]

    if "dining" in w or "sideboard" in w or "bar stool" in blob or "barstool" in blob:
        return "Dining", "Dining", ["dining"]

    if any(x in blob for x in ("coffee table", "nest of table", "tv unit", "media unit", "bookcase", "console")):
        return "Living Room", "Living", ["living-room"]

    if "stool" in w and "bar" in blob:
        return "Dining", "Stools", ["dining"]

    if "chair" in w:
        if "dining" in blob:
            return "Dining", "Chairs", ["dining"]
        return "Sofas & Chairs", "Chairs", ["sofas-chairs", "chairs-footstools", "living-room"]

    if "table" in w:
        if any(x in blob for x in ("coffee", "nest", "console", "side table", "lamp table")):
            return "Living Room", "Tables", ["living-room"]
        return "Dining", "Tables", ["dining"]

    return "Living Room", "Furniture", ["living-room"]


def studio(kind: str) -> Image.Image:
    arr = np.zeros((H, W, 3), np.uint8)
    yy = np.linspace(0, 1, H)[:, None]
    xx = np.linspace(0, 1, W)[None, :]
    if kind == "garden":
        wall = np.array([214.0, 210.0, 198.0])
        floor = np.array([176.0, 168.0, 152.0])
        hy = 0.55
    elif kind == "linen":
        wall = np.array([232.0, 220.0, 204.0])
        floor = np.array([168.0, 148.0, 122.0])
        hy = 0.68
    else:
        wall = np.array([244.0, 239.0, 230.0])
        floor = np.array([198.0, 178.0, 148.0])
        hy = 0.70
    mask = (yy < hy).astype(float)
    col = wall * mask[..., None] + floor * (1 - mask)[..., None]
    col = col * (0.94 + 0.08 * (1 - xx)[..., None])
    col = col * (0.98 + 0.04 * (1 - yy * 0.3)[..., None])
    arr[:] = np.clip(col, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


GROUNDS = {
    "paper": studio("paper"),
    "linen": studio("linen"),
    "garden": studio("garden"),
}


def ground_for(tags: list[str]) -> Image.Image:
    if "garden-furniture" in tags:
        return GROUNDS["garden"].copy()
    if "rugs" in tags or "sofas-chairs" in tags:
        return GROUNDS["linen"].copy()
    return GROUNDS["paper"].copy()


SESSION = None


def cutout(im: Image.Image) -> Image.Image:
    global SESSION
    im = ImageOps.exif_transpose(im).convert("RGB")
    if SESSION is None:
        SESSION = new_session("u2net")
    return remove(im, session=SESSION)


def bbox(alpha: np.ndarray, pad: int = 8) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha > 24)
    if len(xs) == 0:
        return 0, 0, alpha.shape[1], alpha.shape[0]
    x0, x1 = xs.min(), xs.max()
    y0, y1 = ys.min(), ys.max()
    h, w = alpha.shape
    return max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)


def compose(src: Path, tags: list[str]) -> Image.Image:
    raw = Image.open(src)
    cut = cutout(raw)
    a = np.array(cut.split()[-1])
    x0, y0, x1, y1 = bbox(a)
    cut = cut.crop((x0, y0, x1, y1))
    canvas = ground_for(tags)
    # fit product in the lower 78% with side margins
    max_w, max_h = int(W * 0.82), int(H * 0.78)
    cut.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    cw, ch = cut.size
    x = (W - cw) // 2
    y = H - ch - int(H * 0.08)
    # contact shadow
    shadow = Image.new("RGBA", (cw + 40, 36), (0, 0, 0, 0))
    sh = Image.new("L", (cw + 40, 36), 0)
    from PIL import ImageDraw

    from PIL import ImageDraw

    d = ImageDraw.Draw(sh)
    d.ellipse((10, 4, cw + 30, 32), fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    canvas.paste((40, 32, 24), (x - 20, y + ch - 22), sh)
    canvas.paste(cut, (x, y), cut)
    return canvas.convert("RGB")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    products = json.loads(SHOP_JSON.read_text())
    by_tag: dict[str, int] = {}
    missing = 0
    for i, p in enumerate(products, 1):
        cat, sub, tags = classify(p["name"], p.get("category", ""), p.get("tags") or [], p.get("description", ""))
        p["category"] = cat
        p["subcategory"] = sub
        p["tags"] = tags
        for t in tags:
            by_tag[t] = by_tag.get(t, 0) + 1
        alt = list(SRC_DIR.glob(p["slug"] + ".*"))
        src = alt[0] if alt else ROOT / "public" / str(p.get("image", "")).lstrip("/")
        dest = OUT_DIR / f"{p['slug']}.jpg"
        try:
            cover = compose(src, tags)
            cover.save(dest, "JPEG", quality=88, optimize=True)
            p["image"] = f"/media/covers/{p['slug']}.jpg"
        except Exception as err:
            missing += 1
            print("fail", p["slug"], err)
        if i % 80 == 0:
            print(i, "/", len(products), flush=True)
    SHOP_JSON.write_text(json.dumps(products))
    print("done", len(products), "fails", missing)
    print("tags", dict(sorted(by_tag.items(), key=lambda kv: -kv[1])))
    print("lighting names:")
    for p in products:
        if "lighting" in p["tags"]:
            print(" ", p["name"])


if __name__ == "__main__":
    main()
