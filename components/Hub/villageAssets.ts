import { GAME_LANG } from '../../i18n/game';

// Köyün yüklediği dosyalar. Hem oyun sahnesi (GameScene.preload) hem de yükleme ekranı bu listeyi kullanır;
// böylece yükleme ekranı bittiğinde dosyalar tarayıcı önbelleğinde olur ve köy beklemeden açılır.
export const VILLAGE_ASSETS = {
  spritesheets: {
    player: { url: '/assets/characters/player.png', frameWidth: 48, frameHeight: 48 },
    chicken: { url: '/assets/sprout-lands/Characters/Free Chicken Sprites.png', frameWidth: 16, frameHeight: 16 },
    cow: { url: '/assets/sprout-lands/Characters/Free Cow Sprites.png', frameWidth: 32, frameHeight: 32 },
    water: { url: '/assets/sprout-lands/Tilesets/Water.png', frameWidth: 16, frameHeight: 16 },
  },
  images: {
    'tiles-grass': '/assets/sprout-lands/Tilesets/Grass.png',
    'tiles-dirt': '/assets/sprout-lands/Tilesets/Tilled_Dirt_Wide_v2.png',
    'tiles-hills': '/assets/sprout-lands/Tilesets/Hills.png',
    // Tabela yazısı görsele işli; dile göre TR ya da EN sürüm.
    projeler: `/assets/buildings/projeler-${GAME_LANG}.png`,
    sosyal: `/assets/buildings/sosyal-${GAME_LANG}.png`,
    galeri: `/assets/buildings/galeri-${GAME_LANG}.png`,
  },
  atlas: { key: 'village', image: '/assets/village/atlas.png', data: '/assets/village/atlas.json' },
  // Karşılama penceresindeki portre
  extra: ['/assets/ben-256.png'],
} as const;

const allUrls = (): string[] => [
  ...Object.values(VILLAGE_ASSETS.spritesheets).map((s) => s.url),
  ...Object.values(VILLAGE_ASSETS.images),
  VILLAGE_ASSETS.atlas.image,
  VILLAGE_ASSETS.atlas.data,
  ...VILLAGE_ASSETS.extra,
];

// İndirilen görseller burada tutulur: tarayıcı bellekteki kopyayı yeniden kullanır, oyun ve karşılama
// penceresi açılırken tekrar ağa gitmez.
const kept: HTMLImageElement[] = [];

const loadImage = (url: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      kept.push(img);
      // Çözümlemeyi de burada bitir ki ilk çizimde takılma olmasın
      img.decode().catch(() => undefined).finally(resolve);
    };
    img.onerror = () => resolve();
    img.src = url;
  });

// Karşılama penceresi ve yükleme ekranının yazı tipleri
const FONTS = ['16px PressStart2P', '600 16px Outfit', '700 16px Outfit'];

/** Köy dosyalarını ve yazı tiplerini önceden indirir; her iş bittikçe ilerlemeyi (0..1) bildirir. Hata olsa da devam eder. */
export const preloadVillage = (onProgress: (p: number) => void): Promise<void> => {
  const urls = allUrls();
  const total = urls.length + FONTS.length;
  let done = 0;
  const tick = () => onProgress(++done / total);
  const jobs = [
    ...urls.map((url) => (url.endsWith('.json') ? fetch(url).then(() => undefined, () => undefined) : loadImage(url))),
    ...FONTS.map((f) => (document.fonts ? document.fonts.load(f).then(() => undefined, () => undefined) : Promise.resolve())),
  ];
  return Promise.all(jobs.map((j) => j.finally(tick))).then(() => undefined);
};
