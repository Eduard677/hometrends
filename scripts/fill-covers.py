#!/usr/bin/env python3
"""Fit every shop photo to 4:5 by stretching its own edge, not paper."""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

ROOT = Path("/workspace")
SRC = ROOT / "public/media/shopify"
OUT = ROOT / "public/media/covers"
JSON = ROOT / "src/data/ht-shop.json"
W, H = 900, 1125


def extend_edge(im: Image.Image, side: str, extra: int) -> Image.Image:
    if extra <= 0:
        return im
    from PIL import ImageStat

    w, h = im.size
    sample = 12
    if side == "top":
        region = im.crop((0, 0, w, min(sample, h)))
        colour = tuple(int(c) for c in ImageStat.Stat(region).mean[:3])
        canvas = Image.new("RGB", (w, h + extra), colour)
        canvas.paste(im, (0, extra))
        return canvas
    if side == "bottom":
        region = im.crop((0, max(0, h - sample), w, h))
        colour = tuple(int(c) for c in ImageStat.Stat(region).mean[:3])
        canvas = Image.new("RGB", (w, h + extra), colour)
        canvas.paste(im, (0, 0))
        return canvas
    if side == "left":
        region = im.crop((0, 0, min(sample, w), h))
        colour = tuple(int(c) for c in ImageStat.Stat(region).mean[:3])
        canvas = Image.new("RGB", (w + extra, h), colour)
        canvas.paste(im, (extra, 0))
        return canvas
    region = im.crop((max(0, w - sample), 0, w, h))
    colour = tuple(int(c) for c in ImageStat.Stat(region).mean[:3])
    canvas = Image.new("RGB", (w + extra, h), colour)
    canvas.paste(im, (0, 0))
    return canvas


def plate(src: Path) -> Image.Image:
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    iw, ih = im.size
    target_ratio = W / H
    src_ratio = iw / ih
    if src_ratio >= target_ratio:
        # wider than 4:5 — fit width, grow height
        nw, nh = W, max(1, round(W * ih / iw))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        extra = H - nh
        top, bot = extra // 2, extra - extra // 2
        im = extend_edge(im, "top", top)
        im = extend_edge(im, "bottom", bot)
    else:
        nh, nw = H, max(1, round(H * iw / ih))
        im = im.resize((nw, nh), Image.Resampling.LANCZOS)
        extra = W - nw
        left, right = extra // 2, extra - extra // 2
        im = extend_edge(im, "left", left)
        im = extend_edge(im, "right", right)
    if im.size != (W, H):
        im = im.resize((W, H), Image.Resampling.LANCZOS)
    return im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    files = {p.stem: p for p in SRC.iterdir() if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}}
    products = json.loads(JSON.read_text())
    for i, p in enumerate(products, 1):
        src = files.get(p["slug"])
        if not src:
            print("miss", p["slug"])
            continue
        dest = OUT / f"{p['slug']}.jpg"
        plate(src).save(dest, "JPEG", quality=88, optimize=True)
        p["image"] = f"/media/covers/{p['slug']}.jpg"
        if i % 80 == 0:
            print(i, "/", len(products), flush=True)
    JSON.write_text(json.dumps(products))
    print("done", len(products))


if __name__ == "__main__":
    main()
