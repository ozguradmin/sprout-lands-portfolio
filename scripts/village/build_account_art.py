"""İçerik hesabı kartlarının arka planındaki piksel motifleri üretir (public/assets/accounts/).

Her hesap için 24x24 çizilir, 2 kat büyütülerek 48x48 kaydedilir; sayfada yine büyütülüp
soluk bir arka plan olarak kullanılır. Tanınır bir marka karakteri çizilmez; motifler geneldir.
Çalıştır: python scripts/village/build_account_art.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / 'public' / 'assets' / 'accounts'
S = 24  # çizim ızgarası

INK = (38, 43, 68, 255)
INK_SOFT = (91, 96, 117, 255)
PAPER = (255, 253, 249, 255)
RED = (179, 38, 30, 255)
BLUE = (47, 111, 214, 255)
WOOD = (184, 111, 80, 255)
WOOD_LIGHT = (228, 166, 114, 255)
GREEN = (63, 125, 44, 255)
GREEN_LIGHT = (126, 196, 91, 255)
YELLOW = (234, 225, 120, 255)
PINK = (217, 154, 154, 255)
SKY = (155, 212, 195, 255)


def canvas() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    return im, ImageDraw.Draw(im)


def wojak() -> Image.Image:
    """Mem çizimlerindeki gibi sade, çizgisel bir yüz."""
    im, d = canvas()
    d.ellipse([5, 2, 18, 17], outline=INK)
    d.line([(5, 10), (3, 11)], fill=INK)   # kulaklar
    d.line([(18, 10), (20, 11)], fill=INK)
    d.point((9, 9), fill=INK)              # gözler
    d.point((14, 9), fill=INK)
    d.line([(8, 8), (10, 8)], fill=INK)
    d.line([(13, 8), (15, 8)], fill=INK)
    d.line([(10, 13), (13, 13)], fill=INK)  # düz, hafif asık ağız
    d.point((9, 13), fill=INK)
    d.point((14, 13), fill=INK)
    d.line([(9, 18), (9, 20)], fill=INK)    # boyun ve omuzlar
    d.line([(14, 18), (14, 20)], fill=INK)
    d.line([(4, 23), (7, 20)], fill=INK)
    d.line([(19, 23), (16, 20)], fill=INK)
    d.line([(7, 20), (16, 20)], fill=INK)
    return im


def pills() -> Image.Image:
    """Kırmızı ya da mavi: iki kapsül."""
    im, d = canvas()
    d.rounded_rectangle([2, 5, 13, 11], radius=3, fill=RED)
    d.rounded_rectangle([2, 5, 7, 11], radius=3, fill=(214, 92, 84, 255))
    d.rounded_rectangle([10, 13, 21, 19], radius=3, fill=BLUE)
    d.rounded_rectangle([16, 13, 21, 19], radius=3, fill=(126, 170, 240, 255))
    return im


def bubble() -> Image.Image:
    """Çeviri: konuşma balonu."""
    im, d = canvas()
    d.rounded_rectangle([2, 3, 20, 16], radius=4, fill=PAPER, outline=INK)
    d.polygon([(7, 16), (7, 21), (12, 16)], fill=PAPER, outline=INK)
    d.line([(8, 7), (8, 11)], fill=INK)     # ?! işaretleri
    d.point((8, 13), fill=INK)
    d.line([(13, 7), (14, 7)], fill=INK)
    d.line([(15, 8), (15, 10)], fill=INK)
    d.line([(13, 11), (14, 11)], fill=INK)
    d.point((14, 13), fill=INK)
    return im


def planet() -> Image.Image:
    """Uzay: gezegen, halka ve yıldızlar."""
    im, d = canvas()
    for x, y in ((3, 4), (20, 7), (5, 19), (18, 20), (12, 2)):
        d.point((x, y), fill=YELLOW)
        d.point((x, y - 1), fill=(234, 225, 120, 120))
    d.ellipse([7, 7, 18, 18], fill=(70, 86, 140, 255))
    d.ellipse([9, 9, 14, 13], fill=(104, 124, 186, 255))
    d.arc([3, 9, 22, 17], start=200, end=350, fill=WOOD_LIGHT)
    d.arc([3, 10, 22, 18], start=200, end=350, fill=WOOD)
    return im


def frame() -> Image.Image:
    """Görsel işleme: çerçeveli fotoğraf ve parıltı."""
    im, d = canvas()
    d.rectangle([3, 5, 19, 18], fill=PAPER, outline=INK)
    d.rectangle([5, 12, 17, 16], fill=GREEN_LIGHT)
    d.polygon([(6, 12), (10, 8), (14, 12)], fill=GREEN)
    d.polygon([(12, 12), (15, 9), (17, 12)], fill=GREEN)
    d.ellipse([13, 6, 15, 8], fill=YELLOW)
    d.line([(20, 2), (20, 5)], fill=WOOD)   # parıltı
    d.line([(19, 3), (22, 3)], fill=WOOD)
    return im


def pickaxe() -> Image.Image:
    """Oyun: küp ve kazma (tanınır bir karakter değil)."""
    im, d = canvas()
    d.polygon([(4, 12), (11, 9), (18, 12), (11, 15)], fill=GREEN_LIGHT, outline=GREEN)
    d.polygon([(4, 12), (4, 18), (11, 21), (11, 15)], fill=(150, 110, 76, 255), outline=WOOD)
    d.polygon([(18, 12), (18, 18), (11, 21), (11, 15)], fill=(120, 88, 62, 255), outline=WOOD)
    d.line([(13, 8), (20, 1)], fill=WOOD)   # sap
    d.line([(14, 9), (21, 2)], fill=WOOD_LIGHT)
    d.arc([14, 0, 23, 7], start=120, end=330, fill=INK_SOFT)
    return im


def mailbox() -> Image.Image:
    """Mesaj bloğu için köy tarzı posta kutusu: direk, kemerli kutu, bayrak ve mektup."""
    im, d = canvas()
    d.rectangle([10, 15, 13, 23], fill=WOOD)                       # direk
    d.rectangle([10, 15, 10, 23], fill=(150, 92, 66, 255))
    d.rounded_rectangle([3, 6, 19, 16], radius=6, fill=WOOD_LIGHT, outline=WOOD, corners=(True, True, False, False))
    d.rectangle([3, 15, 19, 16], fill=WOOD)                        # taban gölgesi
    d.line([(15, 8), (15, 15)], fill=WOOD)                         # kapak kenarı
    d.rectangle([16, 10, 18, 12], fill=(150, 92, 66, 255))         # kulp
    d.rectangle([20, 5, 20, 13], fill=INK_SOFT)                    # bayrak direği
    d.polygon([(21, 5), (23, 7), (21, 9)], fill=RED)               # bayrak
    d.polygon([(5, 2), (13, 2), (13, 7), (5, 7)], fill=PAPER, outline=INK_SOFT)   # mektup
    d.line([(5, 2), (9, 5)], fill=INK_SOFT)
    d.line([(13, 2), (9, 5)], fill=INK_SOFT)
    return im


MOTIFS = {
    'mailbox': mailbox,
    'wojak': wojak,
    'pills': pills,
    'bubble': bubble,
    'planet': planet,
    'frame': frame,
    'pickaxe': pickaxe,
}


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in MOTIFS.items():
        fn().resize((S * 2, S * 2), Image.NEAREST).save(OUT / f'{name}.png', optimize=True)
        print(name, (OUT / f'{name}.png').stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
