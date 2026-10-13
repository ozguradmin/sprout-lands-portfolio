"""Paylaşım görsellerindeki (public/pro/img/og-professional*.png) unvan satırını yeniden yazar.

Görsellerin kendisi elle hazırlandı; unvan değiştiğinde tamamını yeniden üretmek yerine
yalnızca başlık bloğu temizlenip aynı yazı tipiyle yeniden çiziliyor. Yazı tipi sitenin
kendi dosyası: public/pro/fonts/outfit-tr.woff2 (değişken, wght ekseni 500-800).

Gerekli: pillow, fonttools, brotli.
Çalıştır: python scripts/og_title.py
"""

from __future__ import annotations

import io
from pathlib import Path

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / 'public' / 'pro' / 'img'
WOFF2 = ROOT / 'public' / 'pro' / 'fonts' / 'outfit-tr.woff2'

BG = (251, 246, 236)       # kağıt rengi
INK = (38, 43, 68)         # başlık rengi (--text)
SIZE = 61                  # 'Y' büyük harf yüksekliği 44 piksel olacak şekilde ölçüldü
WEIGHT = 800
CLEAR = (385, 222, 1180, 372)  # temizlenecek başlık bloğu
CAP_TOP = (232, 303)       # iki satırın büyük harf üst kenarı

JOBS = [
    ('og-professional.png', 400, ('Mobil, Oyun ve', 'Web Geliştirici')),
    ('og-professional-en.png', 400, ('Mobile, Game &', 'Web Developer')),
]


def outfit() -> ImageFont.FreeTypeFont:
    """woff2'yi belleğe açıp kalın kesimi döndürür."""
    f = TTFont(WOFF2)
    f.flavor = None
    buf = io.BytesIO()
    f.save(buf)
    buf.seek(0)
    font = ImageFont.truetype(buf, SIZE)
    font.set_variation_by_axes([WEIGHT])
    return font


def main() -> None:
    font = outfit()
    for name, left, lines in JOBS:
        path = IMG / name
        im = Image.open(path).convert('RGB')
        d = ImageDraw.Draw(im)
        d.rectangle(CLEAR, fill=BG)
        for text, cap_top in zip(lines, CAP_TOP):
            # getbbox, çizim başlangıcına göre mürekkebin nerede başladığını söyler
            bx, by = font.getbbox(text)[:2]
            d.text((left - bx, cap_top - by), text, font=font, fill=INK)
        im.save(path, optimize=True)
        print(name, '|', ' / '.join(lines), path.stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
