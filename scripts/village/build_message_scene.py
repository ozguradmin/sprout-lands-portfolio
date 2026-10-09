"""Mesaj bölümünün hareketli görseli: köyün kedisi sandığın yanında, sandıktan mektup çıkıyor.

Elle çizim yok; kedi public/assets/characters/player.png, sandık köyün atlasından (chest_0..4).
İki ayrı şerit üretilir, çünkü ikisi farklı tempoda oynar:
  message-cat.png    kedinin kendi bekleme animasyonu (oyundaki 'idle-down', 4 fps), hiç durmaz
  message-chest.png  sandığın açılışı ve mektubun uçuşu; arada uzun bir mola verir
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

CELL = 48                # player.png'de bir karenin ölçüsü
CHEST_W, CHEST_H = 22, 40  # sandık şeridinde bir kare (mektubun yükseleceği boşlukla)

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


def strip(frames: list[Image.Image], w: int, h: int, path: Path) -> None:
    im = Image.new('RGBA', (w * len(frames), h), (0, 0, 0, 0))
    for i, f in enumerate(frames):
        im.alpha_composite(f, (i * w, 0))
    im.save(path, optimize=True)
    print(path.name, im.size, len(frames), 'kare', path.stat().st_size, 'bayt')


def build_cat() -> tuple[int, int]:
    """Oyundaki 'idle-down' animasyonu: sayfanın ilk iki karesi."""
    sheet = Image.open(PLAYER).convert('RGBA')
    cells = [sheet.crop((i * CELL, 0, (i + 1) * CELL, CELL)) for i in (0, 1)]

    # İki karenin ortak sınırı: kedi karelerin arasında kaymasın
    box = cells[0].getbbox()
    for c in cells[1:]:
        b = c.getbbox()
        box = (min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3]))
    w, h = box[2] - box[0], box[3] - box[1]

    strip([c.crop(box) for c in cells], w, h, OUT / 'message-cat.png')
    return w, h


def build_chest() -> int:
    meta = json.loads(ATLAS_JSON.read_text(encoding='utf8'))['frames']
    sheet = Image.open(ATLAS).convert('RGBA')
    chests = {i: atlas_frame(f'chest_{i}', sheet, meta) for i in (0, 2, 3, 4)}
    letter = envelope()

    # (sandık karesi, mektubun yüksekliği, mektubun saydamlığı); None = mektup yok
    plan = [
        (0, None, 1.0),   # kapalı: molanın da gösterdiği kare
        (2, None, 1.0),
        (3, None, 1.0),
        (4, None, 1.0),
        (4, 0, 1.0),
        (4, 2, 1.0),
        (4, 4, 1.0),
        (4, 6, 1.0),
        (4, 8, 0.9),
        (4, 10, 0.75),
        (4, 12, 0.55),
        (4, 14, 0.35),
        (4, 16, 0.15),
        (3, None, 1.0),
        (2, None, 1.0),
        (0, None, 1.0),
    ]

    frames = []
    for ci, lift, alpha in plan:
        f = Image.new('RGBA', (CHEST_W, CHEST_H), (0, 0, 0, 0))
        chest = chests[ci]
        f.alpha_composite(chest, ((CHEST_W - chest.width) // 2, CHEST_H - chest.height))
        if lift is not None:
            ly = CHEST_H - chests[4].height - letter.height // 2 - lift
            f.alpha_composite(faded(letter, alpha), ((CHEST_W - letter.width) // 2, ly))
        frames.append(f)

    strip(frames, CHEST_W, CHEST_H, OUT / 'message-chest.png')
    return len(frames)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    cw, ch = build_cat()
    n = build_chest()
    print(f'CSS: --cat-w {cw}px, --cat-h {ch}px, sandık {n} kare')


if __name__ == '__main__':
    main()
