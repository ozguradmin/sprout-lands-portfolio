"""Mesaj bölümünün görseli: köyün kedisi açık sandığın yanında.

Elle çizim yok; iki sprite de oyunun kendi dosyalarından alınır:
kedi public/assets/characters/player.png, sandık köyün atlasından (chest_4).
Çalıştır: python scripts/village/build_message_art.py
"""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'assets' / 'accounts'
ATLAS = ROOT / 'public' / 'assets' / 'village' / 'atlas.png'
ATLAS_JSON = ROOT / 'public' / 'assets' / 'village' / 'atlas.json'
PLAYER = ROOT / 'public' / 'assets' / 'characters' / 'player.png'


def frame(name: str) -> Image.Image:
    data = json.loads(ATLAS_JSON.read_text(encoding='utf8'))['frames'][name]['frame']
    im = Image.open(ATLAS).convert('RGBA')
    return im.crop((data['x'], data['y'], data['x'] + data['w'], data['y'] + data['h']))


def main() -> None:
    chest = frame('chest_4')                       # açık sandık
    cat = Image.open(PLAYER).convert('RGBA').crop((16, 14, 32, 34))
    cat = cat.crop(cat.getbbox())                  # şeffaf payı at

    pad = 4
    base = max(chest.height, cat.height)
    W = chest.width + pad + cat.width + 2
    H = base + 2
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    im.alpha_composite(chest, (1, H - chest.height - 1))
    im.alpha_composite(cat, (1 + chest.width + pad, H - cat.height - 1))

    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / 'cat-chest.png'
    im.resize((W * 3, H * 3), Image.NEAREST).save(out, optimize=True)
    print(out.name, (W, H), out.stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
