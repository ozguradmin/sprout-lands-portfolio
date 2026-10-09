"""Üst şeritteki piksel manzarayı üretir (public/assets/banner/).

Üç katman, üçü de yatayda tekrarlanabilir: uzaktaki tepeler, bulutlar ve ön plandaki çimen.
Renkler köyün tileset'inden alındı; şerit 32 piksel yüksekliğinde çizilir, sayfada 3 kat büyütülür.
Çalıştır: python scripts/village/build_banner.py
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / 'public' / 'assets' / 'banner'
W, H = 256, 32

# Köyün paleti (Grass.png / Hills.png / atlas.png'den)
GRASS = (192, 212, 112, 255)
GRASS_MID = (164, 194, 99, 255)
GRASS_DARK = (120, 161, 88, 255)
GRASS_LIGHT = (210, 224, 119, 255)
HILL_FAR = (138, 180, 128, 255)
HILL_FAR_2 = (99, 142, 114, 255)
TRUNK = (170, 121, 89, 255)
LEAF = (103, 131, 92, 255)
LEAF_LIGHT = (174, 212, 153, 255)
FLOWER_Y = (234, 225, 120, 255)
FLOWER_P = (217, 154, 154, 255)
CLOUD = (255, 255, 255, 235)
CLOUD_SHADE = (222, 234, 240, 225)
FENCE = (196, 154, 108, 255)
FENCE_DARK = (170, 121, 89, 255)


def new() -> Image.Image:
    return Image.new('RGBA', (W, H), (0, 0, 0, 0))


def hills() -> Image.Image:
    """İki sıra yumuşak tepe; dalga periyodu 256'ya tam bölünsün ki ek yeri belli olmasın."""
    im = new()
    d = ImageDraw.Draw(im)
    for x in range(W):
        y2 = 20 - round(2.5 * math.sin(2 * math.pi * x / 128) + 1.5 * math.sin(2 * math.pi * x / 64))
        d.line([(x, y2), (x, H)], fill=HILL_FAR_2)
    for x in range(W):
        y1 = 24 - round(3.0 * math.sin(2 * math.pi * (x + 40) / 256) + 2.0 * math.sin(2 * math.pi * x / 85))
        d.line([(x, y1), (x, H)], fill=HILL_FAR)
    # Uzakta birkaç ağaç; tepe çizgisine oturur
    for cx in (28, 96, 150, 212):
        top = 24 - round(3.0 * math.sin(2 * math.pi * (cx + 40) / 256) + 2.0 * math.sin(2 * math.pi * cx / 85))
        d.rectangle([cx, top - 2, cx + 1, top + 1], fill=HILL_FAR_2)
        d.ellipse([cx - 3, top - 8, cx + 4, top - 1], fill=HILL_FAR_2)
    return im


def clouds() -> Image.Image:
    im = new()
    d = ImageDraw.Draw(im)

    def puff(x: int, y: int, w: int, h: int) -> None:
        d.rectangle([x + 2, y, x + w - 2, y + h], fill=CLOUD)
        d.rectangle([x, y + 2, x + w, y + h], fill=CLOUD)
        d.rectangle([x + 1, y + h, x + w - 1, y + h + 1], fill=CLOUD_SHADE)

    # Bulutlar gökte kalsın: en alt kenarları 9. pikseli geçmiyor, çit ve ağaçlarla çakışmıyor
    puff(18, 3, 22, 4)
    puff(30, 0, 14, 3)
    puff(92, 1, 18, 3)
    puff(148, 4, 26, 4)
    puff(162, 1, 12, 3)
    puff(210, 2, 16, 3)
    return im


def ground() -> Image.Image:
    """Ön plan: çimen bandı, tutamlar, çiçekler ve iki çit direği."""
    im = new()
    d = ImageDraw.Draw(im)
    top = 23
    d.rectangle([0, top, W, H], fill=GRASS)
    d.rectangle([0, top, W, top + 1], fill=GRASS_LIGHT)
    d.rectangle([0, top + 5, W, top + 6], fill=GRASS_MID)
    d.rectangle([0, H - 3, W, H], fill=GRASS_DARK)

    for x in range(3, W, 11):
        d.line([(x, top - 1), (x, top - 3)], fill=GRASS_DARK)
        d.point((x - 1, top - 1), fill=GRASS_MID)
        d.point((x + 1, top - 2), fill=GRASS_MID)

    for x, col in ((40, FLOWER_Y), (74, FLOWER_P), (128, FLOWER_Y), (186, FLOWER_P), (232, FLOWER_Y)):
        d.point((x, top - 2), fill=col)
        d.point((x, top - 1), fill=GRASS_DARK)

    # Küçük çalılar
    for cx in (58, 142, 206):
        d.ellipse([cx - 4, top - 6, cx + 4, top], fill=LEAF)
        d.ellipse([cx - 2, top - 5, cx + 2, top - 2], fill=LEAF_LIGHT)

    # Çit: iki direk ve aralarındaki tahta
    for px in (96, 112):
        d.rectangle([px, top - 9, px + 2, top], fill=FENCE)
        d.rectangle([px, top - 9, px, top], fill=FENCE_DARK)
        d.rectangle([px, top - 10, px + 2, top - 10], fill=(232, 207, 166, 255))
    d.rectangle([98, top - 7, 112, top - 6], fill=FENCE)
    d.rectangle([98, top - 4, 112, top - 3], fill=FENCE)
    return im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, im in (('hills.png', hills()), ('clouds.png', clouds()), ('ground.png', ground())):
        im.save(OUT / name, optimize=True)
        print(name, im.size, (OUT / name).stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
