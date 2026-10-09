"""Mesaj bölümünün hareketli görseli: köyün kedisi sandığın yanında, sandıktan mektup çıkıyor.

Elle çizim yok; kedi public/assets/characters/player.png, sandık köyün atlasından (chest_0..4).
Sahne tek bir yatay şerit olarak üretilir, sayfada steps() ile kare kare oynatılır.
Çalıştır: python scripts/village/build_message_scene.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'assets' / 'accounts'
ATLAS = ROOT / 'public' / 'assets' / 'village' / 'atlas.png'
ATLAS_JSON = ROOT / 'public' / 'assets' / 'village' / 'atlas.json'
PLAYER = ROOT / 'public' / 'assets' / 'characters' / 'player.png'

FW, FH = 44, 40          # tek karenin ölçüsü
BASE = FH - 2            # sandığın ve kedinin oturduğu çizgi
CHEST_CX = 14            # sandığın yatay ortası
CAT_X = 26               # kedinin sol kenarı

# Köyün paletinden kağıt ve çizgi renkleri
PAPER = (251, 243, 228, 255)
PAPER_SHADE = (228, 211, 184, 255)
INK = (141, 93, 66, 255)


def atlas_frame(name: str, sheet: Image.Image, meta: dict) -> Image.Image:
    f = meta[name]['frame']
    return sheet.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))


def envelope() -> Image.Image:
    """9x7 mektup: kapak çizgisi olan basit bir zarf."""
    im = Image.new('RGBA', (9, 7), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 8, 6], fill=PAPER, outline=INK)
    d.line([(1, 1), (4, 4)], fill=INK)
    d.line([(7, 1), (4, 4)], fill=INK)
    d.line([(1, 5), (7, 5)], fill=PAPER_SHADE)
    return im


def faded(im: Image.Image, alpha: float) -> Image.Image:
    if alpha >= 1:
        return im
    out = im.copy()
    out.putalpha(out.getchannel('A').point(lambda v: int(v * alpha)))
    return out


def main() -> None:
    meta = json.loads(ATLAS_JSON.read_text(encoding='utf8'))['frames']
    sheet = Image.open(ATLAS).convert('RGBA')
    chests = {i: atlas_frame(f'chest_{i}', sheet, meta) for i in (0, 2, 3, 4)}

    # Kedi: sprite sayfasının öne bakan sırası, duruş karesi
    player = Image.open(PLAYER).convert('RGBA')
    cat = player.crop((0, 0, 48, 48))
    cat = cat.crop(cat.getbbox())

    letter = envelope()

    # (sandık karesi, kedinin dikey kaymasi, mektubun yüksekligi, mektubun saydamligi)
    plan = [
        (0, 0, None, 1.0),
        (0, 0, None, 1.0),
        (0, 1, None, 1.0),
        (0, 1, None, 1.0),
        (2, 0, None, 1.0),
        (3, 0, None, 1.0),
        (4, 0, 0, 1.0),
        (4, 0, 4, 1.0),
        (4, 0, 7, 1.0),
        (4, 1, 10, 0.8),
        (4, 1, 12, 0.5),
        (3, 1, 13, 0.22),
        (2, 1, None, 1.0),
        (0, 0, None, 1.0),
    ]

    strip = Image.new('RGBA', (FW * len(plan), FH), (0, 0, 0, 0))
    for i, (ci, bob, lift, alpha) in enumerate(plan):
        chest = chests[ci]
        ox = i * FW
        cx = ox + CHEST_CX - chest.width // 2
        strip.alpha_composite(chest, (cx, BASE - chest.height))
        strip.alpha_composite(cat, (ox + CAT_X, BASE - cat.height + bob))
        if lift is not None:
            ly = BASE - chests[4].height - letter.height // 2 - lift
            strip.alpha_composite(faded(letter, alpha), (ox + CHEST_CX - letter.width // 2, ly))

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / 'message-scene.png'
    strip.save(out, optimize=True)
    print(out.name, strip.size, len(plan), 'kare', out.stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
