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

/** Köy dosyalarını önceden indirir; her dosya bittikçe ilerlemeyi (0..1) bildirir. Hata olsa da devam eder. */
export const preloadVillage = (onProgress: (p: number) => void): Promise<void> => {
  const urls = allUrls();
  let done = 0;
  const tick = () => onProgress(++done / urls.length);
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          if (url.endsWith('.json')) {
            fetch(url)
              .catch(() => undefined)
              .finally(() => {
                tick();
                resolve();
              });
            return;
          }
          const img = new Image();
          img.onload = img.onerror = () => {
            tick();
            resolve();
          };
          img.src = url;
        }),
    ),
  ).then(() => undefined);
};
