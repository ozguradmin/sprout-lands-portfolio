"""İçerik hesabı kartlarının arka planındaki piksel sahneler (public/assets/accounts/).

Her hesabın konusu kendi çizimimizle anlatılır; telifli film/oyun/anime karesi kullanılmaz.
96x64 çizilir (kartın oranı), 2 kat büyütülerek kaydedilir; kartta arka plan olarak durur,
üstüne okunurluk için açık bir perde gelir.
Çalıştır: python scripts/village/build_account_art.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / 'public' / 'assets' / 'accounts'
W, H = 96, 64

INK = (38, 43, 68, 255)
INK_SOFT = (91, 96, 117, 255)
PAPER = (255, 253, 249, 255)
RED = (190, 46, 40, 255)
RED_LIGHT = (226, 104, 92, 255)
BLUE = (47, 111, 214, 255)
BLUE_LIGHT = (126, 170, 240, 255)
WOOD = (184, 111, 80, 255)
WOOD_LIGHT = (228, 166, 114, 255)
GRASS = (126, 196, 91, 255)
DIRT = (155, 107, 67, 255)
DIRT_DARK = (120, 80, 50, 255)
LEAF = (63, 125, 44, 255)
LEAF_LIGHT = (104, 171, 70, 255)
SKY = (191, 227, 236, 255)
NIGHT = (24, 28, 52, 255)
NIGHT_2 = (41, 48, 86, 255)
YELLOW = (234, 225, 120, 255)
MIST = (232, 236, 242, 255)


def canvas(bg) -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new('RGBA', (W, H), bg)
    return im, ImageDraw.Draw(im)


def wojak() -> Image.Image:
    """Mem çizimi: kel kafa, çizgisel yüz. Kendi piksel yorumumuz."""
    im, d = canvas(MIST)
    for x in range(-16, W + 24, 10):
        d.line([(x, 0), (x - 24, H)], fill=(215, 222, 233, 255))
    cx, cy = 48, 26
    d.ellipse([cx - 9, cy - 10, cx + 9, cy + 9], fill=PAPER, outline=INK)
    d.line([(cx - 10, cy - 1), (cx - 11, cy + 1)], fill=INK)
    d.line([(cx + 10, cy - 1), (cx + 11, cy + 1)], fill=INK)
    d.line([(cx - 6, cy - 3), (cx - 3, cy - 3)], fill=INK)
    d.point((cx - 5, cy - 2), fill=INK)
    d.line([(cx + 3, cy - 3), (cx + 6, cy - 3)], fill=INK)
    d.point((cx + 5, cy - 2), fill=INK)
    d.line([(cx - 3, cy + 4), (cx + 3, cy + 4)], fill=INK)   # düz, hafif asık ağız
    d.point((cx - 4, cy + 5), fill=INK)
    d.point((cx + 4, cy + 5), fill=INK)
    d.line([(cx - 7, cy + 9), (cx - 13, H - 6)], fill=INK)
    d.line([(cx + 7, cy + 9), (cx + 13, H - 6)], fill=INK)
    d.line([(cx - 13, H - 6), (cx + 13, H - 6)], fill=INK)
    return im


def subtitle() -> Image.Image:
    """Çeviri: altyazılı video karesi."""
    im, d = canvas(INK)
    d.rectangle([6, 10, 89, 50], fill=(13, 16, 30, 255), outline=INK_SOFT)
    d.polygon([(42, 22), (55, 30), (42, 38)], fill=PAPER)
    d.rectangle([22, 42, 73, 45], fill=(255, 255, 255, 190))
    d.rectangle([32, 42, 63, 45], fill=PAPER)
    d.rectangle([6, 52, 89, 54], fill=(60, 50, 44, 255))
    d.rectangle([6, 52, 48, 54], fill=WOOD_LIGHT)
    return im


def space() -> Image.Image:
    """Uzay: yıldızlar, gezegen, bulutsu."""
    im, d = canvas(NIGHT)
    d.ellipse([-20, 12, 34, 62], fill=NIGHT_2)
    d.ellipse([-10, 20, 24, 52], fill=(58, 66, 112, 255))
    for x, y, c in ((7, 4, PAPER), (16, 9, YELLOW), (26, 3, PAPER), (38, 6, PAPER), (49, 18, YELLOW),
                    (58, 7, PAPER), (33, 54, PAPER), (12, 58, PAPER), (44, 2, PAPER), (70, 3, PAPER),
                    (80, 56, PAPER), (88, 14, YELLOW), (62, 60, PAPER), (24, 36, PAPER), (90, 40, PAPER),
                    (6, 30, YELLOW), (52, 14, PAPER), (36, 8, PAPER)):
        d.point((x, y), fill=c)
    d.ellipse([54, 22, 86, 54], fill=(104, 124, 186, 255))
    d.ellipse([60, 28, 74, 40], fill=(140, 160, 214, 255))
    d.arc([44, 28, 96, 50], start=195, end=350, fill=WOOD_LIGHT)
    d.arc([44, 30, 96, 52], start=195, end=350, fill=WOOD)
    return im


def strings() -> Image.Image:
    """Manipülasyon: ipleri çekilen kukla."""
    im, d = canvas(MIST)
    d.rectangle([20, 6, 76, 9], fill=WOOD)
    d.rectangle([20, 6, 76, 7], fill=WOOD_LIGHT)
    for x, tx, ty in ((28, 40, 30), (40, 45, 20), (56, 53, 20), (68, 58, 30)):
        d.line([(x, 10), (tx, ty)], fill=INK_SOFT)
    d.ellipse([40, 18, 58, 36], fill=PAPER, outline=INK)          # kafa
    d.point((46, 26), fill=INK)
    d.point((52, 26), fill=INK)
    d.line([(46, 31), (52, 31)], fill=INK)
    d.rounded_rectangle([43, 36, 55, 50], radius=4, fill=PAPER, outline=INK)  # gövde
    d.line([(43, 39), (34, 31)], fill=INK)                        # kollar
    d.line([(55, 39), (64, 31)], fill=INK)
    d.ellipse([30, 27, 36, 33], fill=PAPER, outline=INK)
    d.ellipse([62, 27, 68, 33], fill=PAPER, outline=INK)
    d.line([(46, 50), (43, 61)], fill=INK)                        # bacaklar
    d.line([(52, 50), (55, 61)], fill=INK)
    d.line([(39, 61), (46, 61)], fill=INK)
    d.line([(52, 61), (59, 61)], fill=INK)
    return im


def voxel() -> Image.Image:
    """Küp dünya: blok arazi, ağaç ve güneş (oyunun karesi değil, kendi çizimimiz)."""
    im, d = canvas(SKY)
    d.rectangle([76, 8, 86, 18], fill=YELLOW)                      # güneş
    for x in range(8, 90, 12):                                     # bulutlar
        d.rectangle([x, 4, x + 7, 6], fill=(255, 255, 255, 170))
    ground = 36
    for x in range(0, W, 8):                                       # blok zemin
        d.rectangle([x, ground, x + 7, ground + 5], fill=GRASS)
        d.rectangle([x, ground, x + 7, ground + 1], fill=LEAF_LIGHT)
        d.rectangle([x, ground + 6, x + 7, H], fill=DIRT)
        d.rectangle([x, ground + 6, x, H], fill=DIRT_DARK)
        d.rectangle([x, ground + 13, x + 7, ground + 14], fill=DIRT_DARK)
    d.rectangle([8, ground - 8, 23, ground - 1], fill=GRASS)       # yükselti
    d.rectangle([8, ground - 8, 23, ground - 7], fill=LEAF_LIGHT)
    d.rectangle([54, ground - 10, 60, ground - 1], fill=DIRT)      # ağaç gövdesi
    d.rectangle([54, ground - 10, 55, ground - 1], fill=DIRT_DARK)
    d.rectangle([46, ground - 26, 68, ground - 11], fill=LEAF)     # yapraklar
    d.rectangle([50, ground - 30, 64, ground - 27], fill=LEAF)
    d.rectangle([46, ground - 26, 68, ground - 25], fill=LEAF_LIGHT)
    d.rectangle([50, ground - 30, 64, ground - 29], fill=LEAF_LIGHT)
    return im


def pills() -> Image.Image:
    """Kırmızı mı mavi mi: iki hap, seçim anı."""
    im, d = canvas(NIGHT)
    for x in range(4, W, 9):                                       # arka planda düşen izler
        for y in range(0, H, 6):
            d.point((x, (y * 3 + x * 5) % H), fill=(44, 92, 74, 255))
    d.ellipse([10, 40, 44, 50], fill=(60, 30, 34, 255))            # ışık
    d.ellipse([52, 40, 86, 50], fill=(30, 42, 78, 255))
    d.rounded_rectangle([14, 20, 42, 42], radius=10, fill=RED)
    d.rounded_rectangle([14, 20, 28, 42], radius=10, fill=RED_LIGHT)
    d.ellipse([19, 24, 23, 28], fill=(255, 220, 215, 255))
    d.rounded_rectangle([54, 20, 82, 42], radius=10, fill=BLUE)
    d.rounded_rectangle([68, 20, 82, 42], radius=10, fill=BLUE_LIGHT)
    d.ellipse([73, 24, 77, 28], fill=(230, 240, 255, 255))
    return im


SCENES = {
    'wojak': wojak,
    'subtitle': subtitle,
    'space': space,
    'strings': strings,
    'voxel': voxel,
    'pills': pills,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in SCENES.items():
        fn().resize((W * 2, H * 2), Image.NEAREST).save(OUT / f'{name}.png', optimize=True)
        print(name, (OUT / f'{name}.png').stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
