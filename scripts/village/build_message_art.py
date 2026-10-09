"""Mesaj bölümünün görseli: köyün kedisi tabelanın yanında oturuyor.

Kedinin kafası ve atkısı oyundaki sprite'ın (public/assets/characters/player.png) birebir
pikselleri; oturan gövde aynı paletle elle çizildi. Tabela köyün ahşap renklerinde.
Çalıştır: python scripts/village/build_message_art.py
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'assets' / 'accounts'
PLAYER = ROOT / 'public' / 'assets' / 'characters' / 'player.png'

# Oyundaki kedinin paleti
P = {
    'A': (92, 78, 146, 255),    # dış hat
    'B': (243, 242, 192, 255),  # gövde
    'C': (232, 181, 172, 255),  # kulak / yanak
    'D': (221, 213, 222, 255),  # alın ve patiler
    'E': (243, 216, 197, 255),  # çene
    'F': (118, 109, 170, 255),  # atkı
    'G': (234, 225, 120, 255),  # çıngırak
    # tabela
    'w': (196, 154, 108, 255),
    'x': (170, 121, 89, 255),
    'y': (144, 98, 93, 255),
    'z': (232, 207, 166, 255),
    'm': (255, 253, 249, 255),  # mektup
}

# Kafa ve atkı oyundaki kareden; gövde oturur pozisyonda.
CAT = [
    '...AAA....AAA...',
    '..ABBBA..ABBBA..',
    '..ACCBAAAABCCA..',
    '..ACCBDDDDBCCA..',
    '..ABBBDDDDBBBA..',
    '..ABBBDDDDBBBA..',
    '.AABBBBBBBBBBAA.',
    '..ABABBBBBBABA..',
    '.AABBBBBBBBBBAA.',
    '..AEEBBBBBBEEA..',
    '...AAFFFFFFAA...',
    '..ADBFFGBFFBDA..',
    '..ADBBBGGBBBDA..',
    '..AABBBBBBBBAA..',
    '.AABBBBBBBBBBAA.',
    '.ABBBBBBBBBBBBA.',
    '.ABBBBBBBBBBBBA.',
    '.ABBBBBBBBBBBBA.',
    '.ABBADDBBDDABBA.',
    '.AABADDBBDDABAA.',
    '..AAAAAAAAAAAA..',
]

SIGN = [
    '..xxxxxxxxxxxxxx..',
    '.xzzzzzzzzzzzzzzx.',
    '.xzzzzzzzzzzzzzzx.',
    '.xzzzmmmmmmmmzzzx.',
    '.xzzzmxmmmmxmzzzx.',
    '.xzzzmmxmmxmmzzzx.',
    '.xzzzmmmxxmmmzzzx.',
    '.xzzzmmmmmmmmzzzx.',
    '.xzzzzzzzzzzzzzzx.',
    '.xxxxxxxxxxxxxxxx.',
    '.....yxwwxy.......',
    '......xwwx........',
    '......xwwx........',
    '......xwwx........',
    '......xwwx........',
    '......xwwx........',
    '.....xxwwxx.......',
    '....xywwwwyx......',
]

def draw(rows: list[str], im: Image.Image, ox: int, oy: int) -> None:
    for y, row in enumerate(rows):
        for x, ch in enumerate(row):
            if ch == '.':
                continue
            im.putpixel((ox + x, oy + y), P[ch])


def main() -> None:
    W, H = 42, 24
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw(SIGN, im, 1, 5)          # tabela solda, zemine oturur
    draw(CAT, im, 23, 2)          # kedi sağda, tabelaya bakar
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / 'cat-sign.png'
    im.resize((W * 2, H * 2), Image.NEAREST).save(out, optimize=True)
    print(out.name, im.size, out.stat().st_size, 'bayt')


if __name__ == '__main__':
    main()
