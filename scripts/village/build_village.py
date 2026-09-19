"""Dijital köyün dünyasını üretir.

Çıktılar:
  public/assets/village/atlas.png + atlas.json   nesne sprite'ları (Phaser JSON Hash atlası)
  components/Hub/world/worldData.ts               karo katmanları, nesneler, çarpışma, kapılar (üretilmiş dosya)
  (isteğe bağlı) önizleme PNG'si                   python scripts/village/build_village.py --preview out.png

Köyü değiştirmek için bu dosyayı düzenleyip yeniden çalıştır; oyun kodu değişmeden yeni dünyayı okur.
Varlıklar: Sprout Lands (Cup Nooble), https://cupnooble.itch.io/sprout-lands-asset-pack
"""
from __future__ import annotations

import json
import math
import random
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SL = ROOT / 'public' / 'assets' / 'sprout-lands'
UI = ROOT / 'Sprout Lands - UI Pack - Basic pack'
OUT_ASSETS = ROOT / 'public' / 'assets' / 'village'
OUT_TS = ROOT / 'components' / 'Hub' / 'world' / 'worldData.ts'

T = 16            # karo boyutu (sanat pikseli)
S = 3             # dünya ölçeği: 1 sanat pikseli = 3 dünya pikseli
TW = T * S        # dünyada bir karo: 48 px
W, H = 32, 26     # harita boyutu (karo)
BUILDING_SCALE = 2
rng = random.Random(20260919)

# ---------------------------------------------------------------------------
# Otomatik karo tabloları (bitmask.py ile karoların kenarlarından çıkarıldı)
# Bitler: N=1 E=2 S=4 W=8 NE=16 SE=32 SW=64 NW=128
GRASS_TABLE = {0: 36, 1: 25, 2: 33, 3: 37, 4: 3, 5: 14, 6: 4, 7: 48, 8: 35, 9: 40, 10: 34, 11: 41, 12: 7, 13: 51, 14: 8,
               15: 52, 19: 22, 23: 15, 27: 39, 31: 42, 38: 0, 39: 26, 46: 6, 47: 31, 55: 11, 63: 50, 76: 2, 77: 29, 78: 5,
               79: 32, 95: 9, 110: 1, 111: 30, 127: 28, 137: 24, 139: 38, 141: 18, 143: 43, 155: 23, 159: 19, 175: 20,
               191: 17, 205: 13, 207: 49, 223: 16, 239: 27, 255: 12}
DIRT_TABLE = {0: 36, 1: 25, 2: 33, 3: 37, 4: 3, 5: 14, 6: 4, 7: 48, 8: 35, 9: 40, 10: 34, 11: 41, 12: 7, 13: 51, 14: 8,
              15: 52, 19: 22, 23: 15, 27: 39, 31: 42, 38: 0, 39: 26, 46: 6, 47: 31, 55: 11, 63: 50, 76: 2, 77: 29, 78: 5,
              79: 32, 95: 20, 110: 1, 111: 30, 127: 28, 137: 24, 139: 38, 141: 18, 143: 43, 155: 23, 159: 19, 175: 9,
              191: 17, 205: 13, 207: 49, 223: 16, 239: 27, 255: 12}
GRASS_COLS = 11
# İç çim karosu için sade çeşitler (çim tutamları, küçük çiçekler)
GRASS_VARIANTS = [5 * 11 + 0, 5 * 11 + 1, 5 * 11 + 2, 6 * 11 + 1, 6 * 11 + 2, 5 * 11 + 5]


def mask_at(grid, x, y):
    def g(xx, yy):
        if 0 <= xx < W and 0 <= yy < H:
            return grid[yy][xx]
        return False
    n, e, s, w = g(x, y - 1), g(x + 1, y), g(x, y + 1), g(x - 1, y)
    m = (1 if n else 0) | (2 if e else 0) | (4 if s else 0) | (8 if w else 0)
    if n and e and g(x + 1, y - 1):
        m |= 16
    if s and e and g(x + 1, y + 1):
        m |= 32
    if s and w and g(x - 1, y + 1):
        m |= 64
    if n and w and g(x - 1, y - 1):
        m |= 128
    return m


# ---------------------------------------------------------------------------
# 1) Ada: süper elips + düşük frekanslı gürültü ile doğal kıyı
def value_noise(x, y, seed):
    def h(ix, iy):
        return random.Random(ix * 73856093 ^ iy * 19349663 ^ seed).random()
    x0, y0 = math.floor(x), math.floor(y)
    fx, fy = x - x0, y - y0
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = h(x0, y0) + (h(x0 + 1, y0) - h(x0, y0)) * sx
    b = h(x0, y0 + 1) + (h(x0 + 1, y0 + 1) - h(x0, y0 + 1)) * sx
    return a + (b - a) * sy


land = [[False] * W for _ in range(H)]
cx, cy, rx, ry = (W - 1) / 2, (H - 1) / 2, W / 2 - 2.0, H / 2 - 1.8
for y in range(H):
    for x in range(W):
        d = (abs((x - cx) / rx) ** 2.0 + abs((y - cy) / ry) ** 2.0) ** (1 / 2.0)
        # büyük ölçekli koylar/burunlar + küçük pürüzler
        n = value_noise(x / 5.5, y / 5.5, 7) * 0.62 + value_noise(x / 2.4, y / 2.4, 11) * 0.16
        # gürültü yalnız kıyıyı oynatır: iç kısım (d küçük) her zaman kara kalır
        land[y][x] = d + (n - 0.39) * 0.75 < 0.97


def fill(grid, x0, y0, x1, y1, v):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if 0 <= x < W and 0 <= y < H:
                grid[y][x] = v


# Yapı, yol ve çitlerin altındaki karolar (ve bir karo çevresi) kesin kara olmalı; bu liste aşağıda dolar.
must_land = [[False] * W for _ in range(H)]

# ---------------------------------------------------------------------------
# 2) Gölet ve dere (ada içi su)
water_inner = [[False] * W for _ in range(H)]
# gölet
for y in range(3, 8):
    for x in range(18, 24):
        if ((x - 20.6) / 2.9) ** 2 + ((y - 5.2) / 2.2) ** 2 <= 1.0:
            water_inner[y][x] = True
# dere: göletten güneye, hafifçe kıvrılarak denize
stream_x = {}
for y in range(7, H):
    stream_x[y] = 21 + round(math.sin((y - 7) / 2.6) * 1.1)
stream_x[14] = stream_x[15] = stream_x[13]  # köprü satırları düz olsun
for y in range(7, H):
    sx = stream_x[y]
    water_inner[y][sx] = True
    water_inner[y][sx + 1] = True
# göletin çevresi kara (denize açılmasın)
for y in range(H):
    for x in range(W):
        if water_inner[y][x] and y < 8:
            for dx in (-2, -1, 0, 1, 2):
                for dy in (-2, -1, 0, 1, 2):
                    if 0 <= x + dx < W and 0 <= y + dy < H:
                        must_land[y + dy][x + dx] = True

# kuzeydoğu: gölet ile tepe arası kara, gölet denize açılmasın
fill(must_land, 22, 2, 29, 9, True)

BRIDGE_ROW = 14  # yolun dereyi geçtiği satır (2 karo: 14-15)
bridge_cells = {(stream_x[BRIDGE_ROW], BRIDGE_ROW), (stream_x[BRIDGE_ROW] + 1, BRIDGE_ROW),
                (stream_x[BRIDGE_ROW], BRIDGE_ROW + 1), (stream_x[BRIDGE_ROW] + 1, BRIDGE_ROW + 1)}

# ---------------------------------------------------------------------------
# 3) Toprak: meydan, yollar, tarla
dirt = [[False] * W for _ in range(H)]
# meydan (yuvarlak)
for y in range(12, 18):
    for x in range(12, 20):
        if ((x - 15.5) / 3.6) ** 2 + ((y - 14.6) / 2.8) ** 2 <= 1.0:
            dirt[y][x] = True
fill(dirt, 9, 14, 13, 15, True)       # batıya ana yol (Projeler koluna kadar)
fill(dirt, 9, 9, 10, 15, True)        # Projeler'e kol
_bx = stream_x[BRIDGE_ROW]
fill(dirt, 18, 14, _bx - 1, 15, True)   # köprüye
fill(dirt, _bx + 2, 14, 27, 15, True)   # köprüden Sosyal'e
fill(dirt, 25, 13, 26, 13, True)      # Sosyal kapısı önü
fill(dirt, 15, 17, 16, 22, True)      # güneye kol
fill(dirt, 8, 21, 16, 22, True)       # Galeri'ye
fill(dirt, 25, 19, 28, 21, True)      # tarla
# ---------------------------------------------------------------------------
# 4) Tepe (yükseltilmiş plato, yürünemez)
HILL = (25, 2, 29, 5)  # x0, y0, x1, y1 (alt sıra uçurum yüzü)

# ---------------------------------------------------------------------------
# 5) Binalar: kapı (dünya koordinatı) = yolun üst kenarı, iki yol karosunun ortası
BUILDINGS = [
    {'key': 'projeler', 'target': 'PORTFOLIO', 'door': ((9 + 1) * TW, 9 * TW)},
    {'key': 'sosyal', 'target': 'ARCADE', 'door': ((25 + 1) * TW, 13 * TW)},
    {'key': 'galeri', 'target': 'GALLERY', 'door': ((8 + 1) * TW, 21 * TW)},
]
BUILDING_IMG = {k: Image.open(ROOT / 'public' / 'assets' / 'buildings' / f'{k}-tr.png') for k in ('projeler', 'sosyal', 'galeri')}
DOOR_BOTTOM = {'projeler': 76, 'sosyal': 89, 'galeri': 78}


def building_rect(b):
    im = BUILDING_IMG[b['key']]
    w, h = im.size[0] * BUILDING_SCALE, im.size[1] * BUILDING_SCALE
    dx, dy = b['door']
    top = dy - DOOR_BOTTOM[b['key']] * BUILDING_SCALE
    return dx - w / 2, top, dx + w / 2, top + h


reserved = [[False] * W for _ in range(H)]   # nesne serpiştirmede boş bırakılacak karolar
for b in BUILDINGS:
    x0, y0, x1, y1 = building_rect(b)
    fill(reserved, int(x0 // TW) - 1, int(y0 // TW), int(x1 // TW) + 1, int(y1 // TW) + 1, True)

# ---------------------------------------------------------------------------
# 6) Çitler (tarla ve mera)
# Fences.png 4x4 otomatik karo: sütun yatay bağlantıyı (yok, D, D+B, B), satır dikeyi (G, K+G, K, yok) seçer.
fence_cells = set()
gates = []  # (tx, ty) — çitteki kapı hücreleri


def fence_rect(x0, y0, x1, y1, gate):
    for x in range(x0, x1 + 1):
        fence_cells.update({(x, y0), (x, y1)})
    for y in range(y0 + 1, y1):
        fence_cells.update({(x0, y), (x1, y)})
    fence_cells.discard(gate)
    gates.append(gate)


def fence_part(x, y):
    e, w = (x + 1, y) in fence_cells, (x - 1, y) in fence_cells
    n, s_ = (x, y - 1) in fence_cells, (x, y + 1) in fence_cells
    col = {(False, False): 0, (True, False): 1, (True, True): 2, (False, True): 3}[(e, w)]
    row = {(False, True): 0, (True, True): 1, (True, False): 2, (False, False): 3}[(n, s_)]
    return f'{col}{row}'


FARM = (23, 17, 29, 22)
fence_rect(*FARM, gate=(24, 17))           # tarla, kapı üstte
PASTURE = (12, 3, 17, 7)
fence_rect(*PASTURE, gate=(14, 7))          # mera, kapı altta
fences = [(x, y, fence_part(x, y)) for x, y in sorted(fence_cells)]
for x0, y0, x1, y1 in (FARM, PASTURE):
    fill(reserved, x0, y0, x1, y1, True)

# ---------------------------------------------------------------------------
# Karayı kesinleştir: zorunlu alanlar + bir karo pay, sonra iç sular, sonra harita kenarı
def dilate_into(src, dst, r=1):
    for y in range(H):
        for x in range(W):
            if src[y][x]:
                fill(dst, x - r, y - r, x + r, y + r, True)


dilate_into(dirt, must_land)
dilate_into(reserved, must_land, 0)
fill(must_land, HILL[0] - 1, HILL[1] - 1, HILL[2] + 1, HILL[3] + 1, True)
for y in range(H):
    for x in range(W):
        if must_land[y][x]:
            land[y][x] = True
        if water_inner[y][x]:
            land[y][x] = False
        if x in (0, W - 1) or y in (0, H - 1):
            land[y][x] = False
# kara içinde kalmış tek karoluk su deliklerini ve tek karoluk kara çıkıntılarını temizle
for _ in range(2):
    for y in range(1, H - 1):
        for x in range(1, W - 1):
            if water_inner[y][x]:
                continue
            nb = sum(land[y + dy][x + dx] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)))
            if not land[y][x] and nb >= 3:
                land[y][x] = True
            elif land[y][x] and nb <= 1 and not must_land[y][x]:
                land[y][x] = False

# ---------------------------------------------------------------------------
# 7) Nesneler
# atlas kareleri: ad -> (kaynak dosya, x, y, w, h); boş kenarlar otomatik kırpılır
BG = SL / 'Objects' / 'Basic_Grass_Biom_things.png'
PL = SL / 'Objects' / 'Basic_Plants.png'
FRAMES = {
    'tree_tall': (BG, 0, 0, 16, 32), 'tree': (BG, 16, 0, 32, 32), 'tree_fruit': (BG, 48, 0, 32, 32),
    'mush_red2': (BG, 80, 0, 16, 16), 'mush_red': (BG, 96, 0, 16, 16), 'mush_purple': (BG, 112, 0, 16, 16),
    'mush_purple2': (BG, 128, 0, 16, 16), 'sprout': (BG, 80, 16, 16, 16), 'sprouts': (BG, 96, 16, 16, 16),
    'rock_small': (BG, 112, 16, 16, 16), 'rock': (BG, 128, 16, 16, 16),
    'stump_small': (BG, 48, 32, 16, 16), 'stump': (BG, 64, 32, 16, 16), 'log': (BG, 80, 32, 16, 16),
    'flower_y_small': (BG, 96, 32, 16, 16), 'flower_y': (BG, 112, 32, 16, 16), 'sunflower': (BG, 128, 32, 16, 32),
    'bush_berry': (BG, 0, 48, 16, 16), 'bush': (BG, 16, 48, 16, 16), 'flower_blue': (BG, 80, 48, 16, 16),
    'flower_pink_small': (BG, 96, 48, 16, 16), 'flower_pink': (BG, 112, 48, 16, 16),
    'bush_long': (BG, 0, 64, 32, 16), 'bush_long_big': (BG, 32, 64, 32, 16),
    'rock_water': (BG, 80, 64, 16, 16), 'rock_water_small': (BG, 96, 64, 16, 16), 'lily': (BG, 112, 64, 16, 16),
    'lily_big': (BG, 128, 64, 16, 16),
    'wheat_2': (PL, 32, 0, 16, 16), 'wheat_3': (PL, 48, 0, 16, 16), 'wheat_4': (PL, 64, 0, 16, 16),
    'tomato_2': (PL, 32, 16, 16, 16), 'tomato_3': (PL, 48, 16, 16, 16), 'tomato_4': (PL, 64, 16, 16, 16),
    'chicken_house': (SL / 'Objects' / 'Free_Chicken_House.png', 0, 0, 48, 48),
    'bridge_h': (SL / 'Objects' / 'Wood_Bridge.png', 32, 0, 48, 16),
    'nest': (SL / 'Characters' / 'Egg_And_Nest.png', 48, 0, 16, 16),
    'nest_egg': (SL / 'Characters' / 'Egg_And_Nest.png', 32, 0, 16, 16),
    'milk': (SL / 'Objects' / 'Simple_Milk_and_grass_item.png', 0, 0, 16, 16),
    'hay': (SL / 'Objects' / 'Simple_Milk_and_grass_item.png', 48, 0, 16, 16),
    'emoji_heart': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 64, 256, 32, 32),
    'emoji_heart_big': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 96, 256, 32, 32),
    'emoji_note': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 0, 256, 32, 32),
    'emoji_zzz': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 128, 224, 32, 32),
    'emoji_star': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 128, 256, 32, 32),
    'emoji_excl': (UI / 'emojis-free' / 'Emoji_Spritesheet_Free.png', 64, 224, 32, 32),
}
for col in range(4):
    for row in range(4):
        FRAMES[f'fence_{col}{row}'] = (SL / 'Tilesets' / 'Fences.png', col * 16, row * 16, 16, 16)
for i in range(5):
    # sandık karenin üst 32 pikselinde; alttaki boşluğu at ki taban çarpışma kutusuyla hizalı olsun
    FRAMES[f'chest_{i}'] = (SL / 'Objects' / 'Chest.png', i * 48, 0, 48, 32)

# Çarpışma kutuları (sanat pikseli, sprite'ın alt-orta noktasına göre: dx, dy yukarı, w, h)
# Ağaçlarda yalnız gövde çarpar; karakter tacın arkasından geçebilir.
COLLIDERS = {
    'tree': (0, 3, 10, 6), 'tree_fruit': (0, 3, 10, 6), 'tree_tall': (0, 3, 6, 6),
    'rock': (0, 2, 12, 6), 'rock_small': (0, 1, 6, 4), 'stump': (0, 2, 10, 6), 'stump_small': (0, 1, 6, 4),
    'log': (0, 2, 12, 6), 'bush': (0, 2, 12, 7), 'bush_berry': (0, 2, 12, 7), 'bush_long': (0, 2, 28, 7),
    'bush_long_big': (0, 2, 28, 8), 'chicken_house': (0, 4, 40, 18), 'sunflower': (0, 1, 4, 3),
}
# Zemin seviyesindeki nesneler (karakter hep üstünden geçer)
FLAT = {'lily', 'lily_big', 'rock_water', 'rock_water_small', 'bridge_h', 'flower_y_small', 'flower_pink_small',
        'sprout', 'sprouts', 'wheat_2', 'wheat_3', 'wheat_4', 'tomato_2', 'tomato_3', 'tomato_4', 'nest', 'nest_egg', 'hay'}

objects = []  # (frame, base_x_world, base_y_world)
occupied = [[False] * W for _ in range(H)]


def place(frame, tx, ty, ox=0.5, oy=1.0, mark=True):
    """Karoya göre yerleştir: (ox, oy) karo içindeki taban noktası (0..1)."""
    objects.append((frame, (tx + ox) * TW, (ty + oy) * TW))
    if mark and 0 <= tx < W and 0 <= ty < H:
        occupied[ty][tx] = True


def free(tx, ty, need_grass=True):
    if not (0 < tx < W - 1 and 0 < ty < H - 1):
        return False
    if not land[ty][tx] or dirt[ty][tx] or reserved[ty][tx] or occupied[ty][tx]:
        return False
    if HILL[0] - 1 <= tx <= HILL[2] + 1 and HILL[1] - 1 <= ty <= HILL[3] + 1:
        return False
    # kıyı karolarına ağaç koyma (yarısı su)
    if need_grass and mask_at(land, tx, ty) != 255:
        return False
    return True


# Tepe üstü ağaçlar
for tx, ty in [(26, 3), (28, 3), (27, 4)]:
    place('tree' if tx != 27 else 'tree_fruit', tx, ty, mark=False)

# Bina çevresi: kapı yanlarında çalı/çiçek, arkalarında ağaçlar
place('tree_fruit', 5, 8); place('tree', 13, 9); place('bush_berry', 8, 10, 0.3); place('flower_pink', 11, 10, 0.6)
place('bush', 28, 13, 0.4); place('flower_blue', 24, 13, 0.5)  # (23, 11)'deki ağaç kaldırıldı: dere o kareden geçiyor
place('tree', 5, 20); place('tree_fruit', 12, 20); place('bush_berry', 11, 22, 0.4); place('flower_y', 7, 23)

# Meydan: sandık (oyunda yaklaşınca açılır; burada yalnız yer ayırma ve çarpışma)
CHEST = (17, 13)
occupied[CHEST[1]][CHEST[0]] = True
# Meydan kenarı
place('sunflower', 12, 13, 0.5); place('sunflower', 19, 16, 0.5); place('flower_pink', 13, 17); place('flower_blue', 18, 12)
place('stump', 14, 18); place('log', 17, 18, 0.5)

# Tarla: ekin sıraları, kümes, yuva
for i, x in enumerate(range(25, 29)):
    place('wheat_4' if i % 2 == 0 else 'wheat_3', x, 19, mark=False)
    place('tomato_4' if i % 2 == 0 else 'tomato_3', x, 21, mark=False)
    place('wheat_2' if i % 2 else 'tomato_2', x, 20, mark=False)
place('chicken_house', 27, 18, 0.5, 1.0)
place('nest_egg', 24, 18, 0.5, 0.8); place('hay', 24, 21)

# Mera: saman, süt
place('hay', 13, 4); place('hay', 16, 6); place('milk', 16, 4, 0.5, 0.9)

# Gölet: nilüfer ve kayalar
for tx, ty, f in [(19, 4, 'lily'), (22, 5, 'lily_big'), (20, 6, 'lily'), (21, 3, 'rock_water_small'), (18, 5, 'rock_water')]:
    if water_inner[ty][tx]:
        place(f, tx, ty, 0.5, 0.75, mark=False)

# Köprü (dere üstünde, yol satırında)
bx = stream_x[BRIDGE_ROW]
BRIDGE_BASE_Y = (BRIDGE_ROW + 1.5) * TW   # köprünün alt kenarı: iki yol satırının tam ortasında biter
objects.append(('bridge_h', (bx + 1) * TW, BRIDGE_BASE_Y))

# Deniz: kıyıya yakın kayalar ve nilüferler
sea = []
for y in range(1, H - 1):
    for x in range(1, W - 1):
        if not land[y][x] and not water_inner[y][x]:
            near = any(land[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= y + dy < H and 0 <= x + dx < W)
            if near:
                sea.append((x, y))
rng.shuffle(sea)
for (x, y), f in zip(sea[:9], ['rock_water', 'lily', 'rock_water_small', 'lily_big', 'rock_water', 'lily', 'rock_water_small', 'lily', 'rock_water']):
    place(f, x, y, 0.5, 0.75, mark=False)

# Orman: kıyı boyunca ve boş alanlarda ağaç kümeleri
cells = [(x, y) for y in range(H) for x in range(W)]
rng.shuffle(cells)
tree_count = 0
for x, y in cells:
    if tree_count >= 34:
        break
    if not free(x, y):
        continue
    # kıyıya ya da harita kenarına yakın yerleri tercih et
    edge = min(x, y, W - 1 - x, H - 1 - y)
    coast = sum(1 for dx in range(-2, 3) for dy in range(-2, 3)
                if 0 <= x + dx < W and 0 <= y + dy < H and not land[y + dy][x + dx])
    if coast < 3 and edge > 5 and rng.random() < 0.8:
        continue
    # iki ağaç arası en az bir karo
    if any(occupied[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= y + dy < H and 0 <= x + dx < W):
        continue
    if not free(x, y - 1, need_grass=False):
        continue  # tacın durduğu karo da boş olsun
    f = rng.choices(['tree', 'tree_fruit', 'tree_tall'], [5, 2, 3])[0]
    place(f, x, y, 0.5 + rng.uniform(-0.12, 0.12))
    occupied[y - 1][x] = True
    tree_count += 1
    # ağaç dibine mantar / çalı
    if rng.random() < 0.35:
        for dx, dy in ((1, 0), (-1, 0), (0, 1)):
            if free(x + dx, y + dy):
                place(rng.choice(['mush_red', 'mush_red2', 'mush_purple', 'mush_purple2', 'bush', 'bush_berry']), x + dx, y + dy, 0.5, 0.9)
                break

# Çiçek, filiz, kaya serpiştir
rng.shuffle(cells)
small = 0
for x, y in cells:
    if small >= 46:
        break
    if not free(x, y, need_grass=False) or not land[y][x]:
        continue
    f = rng.choices(['flower_y_small', 'flower_pink_small', 'sprouts', 'sprout', 'flower_blue', 'flower_y', 'flower_pink',
                     'rock_small', 'rock', 'stump_small', 'bush', 'bush_long'], [7, 7, 6, 5, 3, 3, 3, 3, 1, 1, 2, 1])[0]
    if f in ('bush_long',) and not free(x + 1, y):
        continue
    place(f, x, y, rng.uniform(0.3, 0.7), rng.uniform(0.7, 0.95))
    small += 1

# Çitler nesne olarak
for tx, ty, part in fences:
    objects.append((f'fence_{part}', (tx + 0.5) * TW, (ty + 1) * TW))


# Pakette çit kapısı yok: Fences.png'nin tahtası ve renkleriyle çizilmiş kapı kanadı.
# Komşu çit direkleri kapı tarafında uç direk olur; kanat iki direk arasını doldurur.
GATE_POST_GAP = 5   # direğin kenarından karo kenarına kadar sanat pikseli
GATE_W = 16 + 2 * GATE_POST_GAP


def make_gate():
    dark, mid, light, cap = (170, 121, 89, 255), (183, 138, 98, 255), (196, 154, 108, 255), (232, 207, 166, 255)
    im = Image.new('RGBA', (GATE_W, 16), (0, 0, 0, 0))
    put = lambda xx, yy, c: im.putpixel((xx, yy), c)
    # çapraz destek: sol alttan sağ üste, altında gölge pikseli
    xa, ya, xb, yb = 3, 8, GATE_W - 4, 5
    for xx in range(xa, xb + 1):
        yy = round(ya + (yb - ya) * (xx - xa) / (xb - xa))
        put(xx, yy, light)
        put(xx, yy + 1, dark)
    for xx in range(GATE_W):  # iki yatay tahta
        for yy, c in ((3, light), (4, dark), (9, light), (10, dark)):
            put(xx, yy, c)
    for x0 in (0, GATE_W - 3):  # dikey kayıtlar
        for yy in range(2, 12):
            put(x0, yy, dark); put(x0 + 1, yy, mid); put(x0 + 2, yy, dark)
        put(x0 + 1, 2, cap)
    return im


# ---------------------------------------------------------------------------
# 8) Atlas
def build_atlas():
    frames = {}
    images = []
    # Pakette kelebek yok: paletin renkleriyle 2 karelik minik kelebekler çiz (açık / kapalı kanat)
    for color_name, wing, wing_hi in (('pink', (217, 154, 154), (232, 181, 172)), ('yellow', (238, 186, 119), (242, 207, 140)),
                                      ('blue', (146, 178, 212), (203, 224, 222))):
        body = (117, 76, 96)
        for fi, pattern in enumerate((['w.b.w', 'WwbwW', '.w.w.'], ['..b..', '.wbw.', '..b..'])):
            im = Image.new('RGBA', (5, 3), (0, 0, 0, 0))
            for yy, row in enumerate(pattern):
                for xx, ch in enumerate(row):
                    if ch == 'b':
                        im.putpixel((xx, yy), body + (255,))
                    elif ch == 'w':
                        im.putpixel((xx, yy), wing + (255,))
                    elif ch == 'W':
                        im.putpixel((xx, yy), wing_hi + (255,))
            images.append((f'bfly_{color_name}_{fi}', im, (5, 3, 0, 0)))
    images.append(('gate', make_gate(), (GATE_W, 16, 0, 0)))
    for name, (src, x, y, w, h) in FRAMES.items():
        im = Image.open(src).convert('RGBA').crop((x, y, x + w, y + h))
        bbox = im.getbbox()
        if bbox is None:
            raise SystemExit(f'boş kare: {name}')
        # yatayda kırp, altta taban çizgisi sabit kalsın diye dikeyde yalnız üstten kırp
        bx0, by0, bx1, by1 = bbox
        if name.startswith('fence_'):
            bx0, bx1 = 0, w  # çit parçaları karo genişliğinde kalmalı, yoksa komşusuyla birleşmez
        crop = im.crop((bx0, by0, bx1, h))
        images.append((name, crop, (w, h, bx0, by0)))
    # basit raf paketleme
    maxw = 512
    x = y = rowh = 0
    placed = []
    for name, im, meta in sorted(images, key=lambda t: -t[1].size[1]):
        if x + im.size[0] + 1 > maxw:
            x, y, rowh = 0, y + rowh + 1, 0
        placed.append((name, im, meta, x, y))
        x += im.size[0] + 1
        rowh = max(rowh, im.size[1])
    atlas = Image.new('RGBA', (maxw, y + rowh + 1), (0, 0, 0, 0))
    for name, im, (w, h, bx0, by0), ax, ay in placed:
        atlas.alpha_composite(im, (ax, ay))
        frames[name] = {
            'frame': {'x': ax, 'y': ay, 'w': im.size[0], 'h': im.size[1]},
            'rotated': False, 'trimmed': False,
            'spriteSourceSize': {'x': 0, 'y': 0, 'w': im.size[0], 'h': im.size[1]},
            'sourceSize': {'w': im.size[0], 'h': im.size[1]},
        }
    OUT_ASSETS.mkdir(parents=True, exist_ok=True)
    atlas.save(OUT_ASSETS / 'atlas.png', optimize=True)
    (OUT_ASSETS / 'atlas.json').write_text(json.dumps({'frames': frames, 'meta': {
        'image': 'atlas.png', 'size': {'w': atlas.size[0], 'h': atlas.size[1]}, 'scale': '1',
        'app': 'scripts/village/build_village.py'}}, indent=1))
    return {name: im.size for name, im, *_ in placed}


# ---------------------------------------------------------------------------
# 9) Karo katmanları ve çarpışma
def layers():
    grass, dirt_l, hills = [], [], []
    for y in range(H):
        for x in range(W):
            if land[y][x]:
                m = mask_at(land, x, y)
                idx = GRASS_TABLE.get(m, 12)
                if m == 255 and rng.random() < 0.16:
                    idx = rng.choice(GRASS_VARIANTS)
                grass.append(idx)
            else:
                grass.append(-1)
            dirt_l.append(DIRT_TABLE.get(mask_at(dirt, x, y), 12) if dirt[y][x] else -1)
            hx0, hy0, hx1, hy1 = HILL
            if hx0 <= x <= hx1 and hy0 <= y <= hy1:
                col = 0 if x == hx0 else (2 if x == hx1 else 1)
                row = 0 if y == hy0 else (2 if y == hy1 else 1)
                hills.append(row * 11 + col)
            else:
                hills.append(-1)
    return grass, dirt_l, hills


def blocked_cells():
    b = [[False] * W for _ in range(H)]
    for y in range(H):
        for x in range(W):
            if not land[y][x] and (x, y) not in bridge_cells:
                b[y][x] = True
    hx0, hy0, hx1, hy1 = HILL
    fill(b, hx0, hy0, hx1, hy1, True)
    # çitler burada değil: fence_colliders() ile direk ve tahtaların şekline göre ince kutular
    # köprü satırlarındaki dere hücreleri ayrı ele alınır (partial_bridge_blocks)
    for cx_, cy_ in bridge_cells:
        b[cy_][cx_] = False
    return b


def bridge_lane():
    """Köprünün korkuluklar arasındaki yürünür şeridi (dünya y aralığı)."""
    top = BRIDGE_BASE_Y - 16 * S
    return top + 2 * S, top + 14 * S


def partial_bridge_blocks():
    """Köprü satırlarında dereyi engelle ama korkuluklar arasındaki şeridi açık bırak."""
    top = BRIDGE_BASE_Y - 16 * S          # köprünün üst kenarı
    lane_top, lane_bot = bridge_lane()
    x0 = min(c[0] for c in bridge_cells) * TW
    w = 2 * TW
    y0, y1 = BRIDGE_ROW * TW, (BRIDGE_ROW + 2) * TW
    return [[x0, y0, w, round(lane_top - y0)], [x0, round(lane_bot), w, round(y1 - lane_bot)]]


def merge_rects(b):
    """Engelli karoları satır satır birleştirip dikdörtgenlere çevir (dünya px)."""
    rects = []
    for y in range(H):
        x = 0
        while x < W:
            if b[y][x]:
                x0 = x
                while x < W and b[y][x]:
                    x += 1
                rects.append([x0 * TW, y * TW, (x - x0) * TW, TW])
            else:
                x += 1
    return rects


def object_colliders(sizes):
    out = []
    for f, bx, by in objects:
        c = COLLIDERS.get(f)
        if not c:
            continue
        dx, dy, w, h = c
        out.append([round(bx + dx * S - w * S / 2), round(by - dy * S - h * S), w * S, h * S])
    # sandık gövdesi
    out.append([CHEST[0] * TW + 6, CHEST[1] * TW + 18, TW - 12, TW - 22])
    return out


def fence_colliders():
    """Çitin çarpışması: direk tabanı + komşuya uzanan tahta, karonun tamamı değil (sanat pikseli, 16'lık karo)."""
    out = []
    for tx, ty, part in fences:
        e, w_ = (tx + 1, ty) in fence_cells, (tx - 1, ty) in fence_cells
        n, s_ = (tx, ty - 1) in fence_cells, (tx, ty + 1) in fence_cells
        boxes = [(5, 5, 11, 12)]            # direk
        if e: boxes.append((11, 6, 16, 11))
        if w_: boxes.append((0, 6, 5, 11))
        if n: boxes.append((6, 0, 10, 5))
        if s_: boxes.append((6, 12, 10, 16))
        for x0, y0, x1, y1 in boxes:
            out.append([tx * TW + x0 * S, ty * TW + y0 * S, (x1 - x0) * S, (y1 - y0) * S])
    return out


def write_ts(grass, dirt_l, hills, rects, colliders):
    objs = sorted(objects, key=lambda o: o[2])
    data = {
        'tile': TW, 'scale': S, 'width': W, 'height': H,
        'grass': grass, 'dirt': dirt_l, 'hills': hills,
        'blocked': rects + colliders,
        'objects': [{'f': f, 'x': round(x), 'y': round(y), 'flat': f in FLAT} for f, x, y in objs],
        'buildings': [{'key': b['key'], 'target': b['target'], 'doorX': b['door'][0], 'doorY': b['door'][1]} for b in BUILDINGS],
        'spawn': {'x': 16 * TW, 'y': 15 * TW},
        'chickens': {'x': (FARM[0] + 1) * TW, 'y': (FARM[1] + 1) * TW, 'w': (FARM[2] - FARM[0] - 1) * TW, 'h': (FARM[3] - FARM[1] - 1) * TW},
        'cows': {'x': (PASTURE[0] + 1) * TW, 'y': (PASTURE[1] + 1) * TW, 'w': (PASTURE[2] - PASTURE[0] - 1) * TW, 'h': (PASTURE[3] - PASTURE[1] - 1) * TW},
        'gates': [{'x': tx * TW - GATE_POST_GAP * S, 'y': (ty + 1) * TW} for tx, ty in gates],
        'chest': {'x': CHEST[0] * TW + TW // 2, 'y': CHEST[1] * TW + TW - 6},
        'flowers': [[round(x), round(y)] for f, x, y in objects if f.startswith(('flower', 'sunflower'))][:24],
        'water': [[x, y] for y in range(H) for x in range(W) if not land[y][x] and (x, y) not in bridge_cells
                  and any(land[y + dy][x + dx] for dx in (-1, 0, 1) for dy in (-1, 0, 1) if 0 <= y + dy < H and 0 <= x + dx < W)],
        'bridge': {'x0': min(c[0] for c in bridge_cells) * TW - TW // 2, 'x1': (min(c[0] for c in bridge_cells) + 2) * TW + TW // 2,
                   'laneTop': round(bridge_lane()[0]), 'laneBottom': round(bridge_lane()[1])},
    }
    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUT_TS.write_text(
        '// BU DOSYA ÜRETİLMİŞTİR — elle düzenleme. Kaynak: scripts/village/build_village.py\n'
        '/* eslint-disable */\n'
        'export const WORLD = ' + json.dumps(data, separators=(',', ':'), ensure_ascii=False) + ' as const;\n'
        'export type WorldObject = (typeof WORLD)["objects"][number];\n',
        encoding='utf8')


# ---------------------------------------------------------------------------
# 10) Önizleme (oyundaki görünüm, dünya pikseli)
def preview(path, grass, dirt_l, hills, rects, colliders, show_blocks=False):
    ts = lambda name: Image.open(SL / 'Tilesets' / name).convert('RGBA')
    tg, td, th, tw_ = ts('Grass.png'), ts('Tilled_Dirt_Wide_v2.png'), ts('Hills.png'), ts('Water.png')
    img = Image.new('RGBA', (W * TW, H * TW))
    water = tw_.crop((0, 0, 16, 16)).resize((TW, TW), Image.NEAREST)
    for y in range(H):
        for x in range(W):
            img.alpha_composite(water, (x * TW, y * TW))

    def tile(sheet, idx):
        c, r = idx % 11, idx // 11
        return sheet.crop((c * 16, r * 16, c * 16 + 16, r * 16 + 16)).resize((TW, TW), Image.NEAREST)
    for layer, sheet in ((grass, tg), (dirt_l, td), (hills, th)):
        for i, idx in enumerate(layer):
            if idx >= 0:
                img.alpha_composite(tile(sheet, idx), ((i % W) * TW, (i // W) * TW))
    atlas = Image.open(OUT_ASSETS / 'atlas.png').convert('RGBA')
    fr = json.loads((OUT_ASSETS / 'atlas.json').read_text())['frames']
    items = [(o[2] if o[0] not in FLAT else -1, 'o', o) for o in objects]
    for b in BUILDINGS:
        items.append((b['door'][1], 'b', b))
    for depth, kind, o in sorted(items, key=lambda t: t[0]):
        if kind == 'o':
            f, bx, by = o
            r = fr[f]['frame']
            sp = atlas.crop((r['x'], r['y'], r['x'] + r['w'], r['y'] + r['h'])).resize((r['w'] * S, r['h'] * S), Image.NEAREST)
            img.alpha_composite(sp, (round(bx - sp.size[0] / 2), round(by - sp.size[1])))
        else:
            im = BUILDING_IMG[o['key']].convert('RGBA')
            sp = im.resize((im.size[0] * BUILDING_SCALE, im.size[1] * BUILDING_SCALE), Image.NEAREST)
            x0, y0, *_ = building_rect(o)
            img.alpha_composite(sp, (round(x0), round(y0)))
    if show_blocks:
        from PIL import ImageDraw
        d = ImageDraw.Draw(img)
        for x, y, w, h in rects:
            d.rectangle((x, y, x + w - 1, y + h - 1), outline=(255, 0, 0, 160))
        for x, y, w, h in colliders:
            d.rectangle((x, y, x + w - 1, y + h - 1), outline=(255, 255, 0, 255), width=2)
    img.save(path)


def water_frames():
    """Yükleme ekranının CSS arka planı için su karosunun 4 karesi ayrı dosyalar."""
    im = Image.open(SL / 'Tilesets' / 'Water.png').convert('RGBA')
    for i in range(4):
        im.crop((i * 16, 0, i * 16 + 16, 16)).save(OUT_ASSETS / f'water-{i}.png', optimize=True)


if __name__ == '__main__':
    water_frames()
    sizes = build_atlas()
    grass, dirt_l, hills = layers()
    rects = merge_rects(blocked_cells()) + partial_bridge_blocks()
    cols = object_colliders(sizes) + fence_colliders()
    write_ts(grass, dirt_l, hills, rects, cols)
    print('objects', len(objects), 'blocked rects', len(rects), 'colliders', len(cols))
    if '--preview' in sys.argv:
        out = sys.argv[sys.argv.index('--preview') + 1]
        preview(out, grass, dirt_l, hills, rects, cols, show_blocks='--blocks' in sys.argv)
        print('preview', out)
