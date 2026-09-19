// Profesyonel görünümü build sonrası statik HTML'e çevirir:
//   dist/professional/index.html
//   dist/professional/projects/<slug>/index.html
// Her sayfa kendi title/description/OpenGraph etiketleriyle gelir, JS yüklenmeden okunabilir,
// sonra aynı bundle ile hydrate edilir. Ayrıca sitemap.xml üretir.
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');

const { render, routes } = await import(pathToFileURL(join(ssrDir, 'entry-server.js')).href);
let template = await readFile(join(dist, 'professional', 'index.html'), 'utf8');

// Küçük stil dosyasını HTML'e göm: ilk boyamada ek istek beklenmesin.
const cssLink = template.match(/<link rel="stylesheet" crossorigin href="(\/assets\/[^"]+\.css)">/);
if (cssLink) {
  const css = await readFile(join(dist, cssLink[1]), 'utf8');
  template = template.replace(cssLink[0], () => `<style>${css}</style>`);
}

if (!template.includes('<!--pro-app-->') || !template.includes('<!--pro-head-->')) {
  throw new Error('professional/index.html şablon işaretleri bulunamadı');
}

for (const route of routes) {
  const { html, head, lang } = render(route);
  const page = template
    .replace('<html lang="tr">', `<html lang="${lang}">`)
    .replace('<!--pro-head-->', head)
    .replace('<!--pro-app-->', html);
  const file = join(dist, route.replace(/^\//, ''), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, page);
  console.log('prerender', route);
}

// Oyunun İngilizce girişi: /en -> en/index.html (lang ve başlık İngilizce; uygulama dili adresten okur).
const gameIndex = await readFile(join(dist, 'index.html'), 'utf8');
const gameEn = gameIndex
  .replace('<html lang="tr">', '<html lang="en">')
  .replace(/<title>[^<]*<\/title>/, "<title>Özgür Güler · Virtual Village</title>")
  .replace(
    /<meta name="description" content="[^"]*"\s*\/>/,
    `<meta name="description" content="I make games, apps and websites. My projects, accounts and the photos I took are in the houses of this little village." />`,
  );
const enMeta = [
  ['<link rel="canonical" href="https://ozgurguler.tech/" />', '<link rel="canonical" href="https://ozgurguler.tech/en" />'],
  ['content="tr_TR"', 'content="en_US"'],
  ['<meta property="og:url" content="https://ozgurguler.tech/" />', '<meta property="og:url" content="https://ozgurguler.tech/en" />'],
  [/content="Özgür'ün sanal köyü"/g, `content="Özgür's virtual village"`],
  [/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="I make games, apps and websites. My projects, accounts and the photos I took are in the houses of this little village."`],
  [/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="I make games, apps and websites. My projects, accounts and the photos I took are in the houses of this little village."`],
  [/og-village-v2\.png/g, 'og-village-v2-en.png'],
  [/<meta property="og:image:alt" content="[^"]*"/, `<meta property="og:image:alt" content="Özgür's pixel village: houses, a pond and dirt paths"`],
];
let gameEnMeta = gameEn;
for (const [from, to] of enMeta) {
  const next = gameEnMeta.replace(from, to);
  if (next === gameEnMeta) throw new Error(`en meta not replaced: ${from}`);
  gameEnMeta = next;
}
await mkdir(join(dist, 'en'), { recursive: true });
await writeFile(join(dist, 'en', 'index.html'), gameEnMeta);
console.log('game /en');

const site = 'https://ozgurguler.tech';
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/en', ...routes]
  .map((r) => `  <url><loc>${site}${r}</loc><lastmod>${today}</lastmod></url>`)
  .join('\n');
await writeFile(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

await rm(ssrDir, { recursive: true, force: true });
