"""İçerik hesabı kartlarının üstündeki piksel sahneler (public/assets/accounts/).

Her hesabın konusu kendi çizimimizle anlatılır; telifli film/oyun/anime karesi kullanılmaz.
64x24 çizilir, 2 kat büyütülerek kaydedilir; kartta yine büyütülüp üst şerit olarak durur.
Çalıştır: python scripts/village/build_account_art.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / 'public' / 'assets' / 'accounts'
W, H = 96, 24

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
    for x in range(0, W + 8, 8):
        d.line([(x, 0), (x - 8, H)], fill=(215, 222, 233, 255))
    cx, cy = 48, 12
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
    d.line([(cx - 6, cy + 9), (cx - 9, H)], fill=INK)
    d.line([(cx + 6, cy + 9), (cx + 9, H)], fill=INK)
    d.line([(cx - 9, H - 1), (cx + 9, H - 1)], fill=INK)
    return im


def subtitle() -> Image.Image:
    """Çeviri: altyazılı video karesi."""
    im, d = canvas(INK)
    d.rectangle([4, 3, 91, 20], fill=(13, 16, 30, 255), outline=INK_SOFT)
    d.polygon([(44, 7), (53, 11), (44, 15)], fill=PAPER)
    d.rectangle([24, 16, 71, 18], fill=(255, 255, 255, 200))
    d.rectangle([32, 16, 63, 18], fill=PAPER)
    d.rectangle([4, 21, 91, 22], fill=(60, 50, 44, 255))
    d.rectangle([4, 21, 46, 22], fill=WOOD_LIGHT)
    return im


def space() -> Image.Image:
    """Uzay: yıldızlar, gezegen, bulutsu."""
    im, d = canvas(NIGHT)
    d.ellipse([-14, 5, 24, 29], fill=NIGHT_2)
    d.ellipse([-6, 9, 16, 25], fill=(58, 66, 112, 255))
    for x, y, c in ((7, 4, PAPER), (16, 9, YELLOW), (26, 3, PAPER), (38, 6, PAPER), (49, 18, YELLOW),
                    (58, 7, PAPER), (33, 19, PAPER), (12, 20, PAPER), (44, 2, PAPER), (70, 3, PAPER),
                    (80, 18, PAPER), (88, 9, YELLOW), (62, 20, PAPER)):
        d.point((x, y), fill=c)
    d.ellipse([66, 5, 84, 21], fill=(104, 124, 186, 255))
    d.ellipse([69, 7, 77, 13], fill=(140, 160, 214, 255))
    d.arc([59, 8, 91, 19], start=195, end=350, fill=WOOD_LIGHT)
    d.arc([59, 9, 91, 20], start=195, end=350, fill=WOOD)
    return im


def strings() -> Image.Image:
    """Manipülasyon: ipleri çekilen kukla."""
    im, d = canvas(MIST)
    d.rectangle([24, 2, 72, 4], fill=WOOD)                      # kumanda çubuğu
    d.rectangle([24, 2, 72, 2], fill=WOOD_LIGHT)
    for x, tx, ty in ((30, 40, 14), (42, 45, 9), (54, 51, 9), (66, 56, 14)):
        d.line([(x, 5), (tx, ty)], fill=INK_SOFT)               # ipler
    d.ellipse([43, 7, 53, 17], fill=PAPER, outline=INK)         # kafa
    d.point((46, 11), fill=INK)
    d.point((50, 11), fill=INK)
    d.line([(47, 14), (49, 14)], fill=INK)
    d.rounded_rectangle([45, 17, 51, 22], radius=2, fill=PAPER, outline=INK)  # gövde
    d.line([(45, 18), (39, 15)], fill=INK)                      # kollar
    d.line([(51, 18), (57, 15)], fill=INK)
    d.ellipse([37, 13, 40, 16], fill=PAPER, outline=INK)
    d.ellipse([56, 13, 59, 16], fill=PAPER, outline=INK)
    d.line([(47, 22), (46, H - 1)], fill=INK)                   # bacaklar
    d.line([(49, 22), (50, H - 1)], fill=INK)
    return im


def voxel() -> Image.Image:
    """Küp dünya: blok arazi, ağaç ve güneş (oyunun karesi değil, kendi çizimimiz)."""
    im, d = canvas(SKY)
    d.rectangle([82, 3, 89, 10], fill=YELLOW)
    ground = 14
    for x in range(0, W, 6):
        d.rectangle([x, ground, x + 5, ground + 3], fill=GRASS)
        d.rectangle([x, ground, x + 5, ground], fill=LEAF_LIGHT)
        d.rectangle([x, ground + 4, x + 5, H], fill=DIRT)
        d.rectangle([x, ground + 4, x, H], fill=DIRT_DARK)
        d.rectangle([x, ground + 7, x + 5, ground + 7], fill=DIRT_DARK)
    d.rectangle([16, ground - 6, 21, ground - 1], fill=GRASS)
    d.rectangle([16, ground - 6, 21, ground - 6], fill=LEAF_LIGHT)
    d.rectangle([49, ground - 4, 52, ground - 1], fill=DIRT)
    d.rectangle([45, ground - 12, 57, ground - 5], fill=LEAF)
    d.rectangle([47, ground - 14, 55, ground - 13], fill=LEAF)
    d.rectangle([45, ground - 12, 57, ground - 12], fill=LEAF_LIGHT)
    return im


def pills() -> Image.Image:
    """Kırmızı mı mavi mi: iki hap, seçim anı."""
    im, d = canvas(NIGHT)
    for x in range(3, W, 9):                                    # arka planda düşen ince izler
        for y in range(0, H, 5):
            d.point((x, (y + x) % H), fill=(44, 92, 74, 255))
    d.ellipse([22, 16, 46, 21], fill=(60, 30, 34, 255))          # hapların altındaki ışık
    d.ellipse([50, 16, 74, 21], fill=(30, 42, 78, 255))
    d.rounded_rectangle([24, 6, 44, 16], radius=5, fill=RED)
    d.rounded_rectangle([24, 6, 34, 16], radius=5, fill=RED_LIGHT)
    d.point((29, 9), fill=(255, 220, 215, 255))
    d.rounded_rectangle([52, 6, 72, 16], radius=5, fill=BLUE)
    d.rounded_rectangle([62, 6, 72, 16], radius=5, fill=BLUE_LIGHT)
    d.point((67, 9), fill=(230, 240, 255, 255))
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
