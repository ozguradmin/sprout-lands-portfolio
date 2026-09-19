// Köydeki "Projeler" binasının listesi. Öne çıkan projeler profesyonel görünümle aynı veriden gelir
// (professional/data.ts); burada yalnızca kategori ve köye özel küçük projeler eklenir.
import { MORE_PROJECTS, PROJECTS, type Lang, type LinkKind } from '../../professional/data';

type L = Record<Lang, string>;

export type VillageCategory = 'mobile' | 'web' | 'ai';

export interface VillageProject {
  id: string;
  name: string;
  categories: VillageCategory[];
  summary: L;
  status: L;
  image: { src: string; bg: string };
  icon?: string;
  stack?: string[];
  details?: { goal: L; built: Record<Lang, string[]>; result: L };
  links: { label: L | string; href: string; kind: LinkKind }[];
  /** Profesyonel görünümde karşılığı olan projeler için slug. */
  proSlug?: string;
}

const FEATURED_CATEGORIES: Record<string, VillageCategory[]> = {
  cografist: ['mobile', 'web'],
  'galaktik-uzay': ['web', 'ai'],
  donerci: ['mobile'],
  'print-fast': ['mobile'],
  'ofile-opaste': ['web', 'ai'],
  'whisper-web-scribe': ['web', 'ai'],
};

const featured: VillageProject[] = PROJECTS.map((p) => ({
  id: p.slug,
  name: p.name,
  categories: FEATURED_CATEGORIES[p.slug] ?? ['web'],
  summary: p.summary,
  status: p.status,
  image: { src: p.image.src, bg: p.image.bg },
  icon: p.icon,
  stack: p.stack,
  details: { goal: p.goal, built: p.built, result: p.result },
  links: p.links,
  proSlug: p.slug,
}));

const more = (name: string) => {
  const p = MORE_PROJECTS.find((x) => x.name === name);
  if (!p) throw new Error(`MORE_PROJECTS içinde yok: ${name}`);
  return p;
};
const live = { tr: 'Canlı', en: 'Live' };
const navy = '#262b44';

const extras: VillageProject[] = [
  {
    id: 'wtf-yapay-zeka',
    name: 'WTF Yapay Zekâ',
    categories: ['mobile', 'web', 'ai'],
    summary: more('WTF Yapay Zekâ').text,
    status: { tr: 'Google Play · Web', en: 'Google Play · Web' },
    image: { src: '/pro/img/v-wtf', bg: navy },
    icon: '/pro/img/wtf-icon.webp',
    links: more('WTF Yapay Zekâ').links.map((l) => ({ ...l, kind: l.href.includes('play.google') ? 'store' : 'live' })),
  },
  {
    id: 'llm-eval',
    name: 'LLM Evaluation Toolkit',
    categories: ['ai'],
    summary: more('LLM Evaluation Toolkit').text,
    status: { tr: 'Açık kaynak', en: 'Open source' },
    image: { src: '/pro/img/v-llmeval', bg: navy },
    links: more('LLM Evaluation Toolkit').links.map((l) => ({ ...l, kind: l.href.includes('github') ? 'github' : 'live' })),
  },
  {
    id: 'onopo-ivricambi',
    name: 'ONOPO Store · Ivricambi',
    categories: ['web'],
    summary: more('ONOPO Store · Ivricambi').text,
    status: { tr: 'Müşteri projesi', en: 'Client work' },
    image: { src: '/pro/img/v-onopo', bg: navy },
    links: more('ONOPO Store · Ivricambi').links.map((l) => ({ ...l, kind: 'live' as const })),
  },
  {
    id: 'birlikte-izle',
    name: 'Birlikte İzle',
    categories: ['web'],
    summary: more('Birlikte İzle').text,
    status: live,
    image: { src: '/pro/img/v-birlikteizle', bg: navy },
    links: more('Birlikte İzle').links.map((l) => ({ ...l, kind: 'live' as const })),
  },
  {
    id: 'foodlens',
    name: 'FoodLens',
    categories: ['web'],
    summary: more('FoodLens').text,
    status: live,
    image: { src: '/pro/img/v-foodlens', bg: navy },
    links: more('FoodLens').links.map((l) => ({ ...l, kind: 'live' as const })),
  },
  {
    id: 'yatirim',
    name: 'Yatırım Zaman Makinesi',
    categories: ['web'],
    summary: more('Yatırım Zaman Makinesi').text,
    status: live,
    image: { src: '/pro/img/v-yatirim', bg: navy },
    links: more('Yatırım Zaman Makinesi').links.map((l) => ({ ...l, kind: 'live' as const })),
  },
  {
    id: 'vsco-tr',
    name: 'VSCO TR',
    categories: ['web'],
    summary: { tr: 'Fotoğraf paylaşım topluluğu; ücretsiz bir VSCO alternatifi.', en: 'A photo-sharing community; a free VSCO alternative.' },
    status: live,
    image: { src: '/pro/img/v-vscotr', bg: navy },
    links: [{ label: 'vscotr.vercel.app', href: 'https://vscotr.vercel.app/', kind: 'live' }],
  },
  {
    id: 'dosya-paylas',
    name: 'Dosya Paylaş',
    categories: ['web'],
    summary: { tr: 'Üyelik ve reklam olmadan dosya paylaşımı.', en: 'File sharing without sign-up or ads.' },
    status: live,
    image: { src: '/pro/img/v-dosyapaylas', bg: navy },
    links: [{ label: 'dosyapaylas.vercel.app', href: 'https://dosyapaylas.vercel.app/', kind: 'live' }],
  },
  {
    id: 'kurdish-translate',
    name: 'Kurdish Translate',
    categories: ['web', 'ai'],
    summary: { tr: 'Türkçe, İngilizce ve Kürtçe arasında çeviri sitesi.', en: 'A translation site between Turkish, English and Kurdish.' },
    status: live,
    image: { src: '/pro/img/v-kurtceviri', bg: navy },
    links: [{ label: 'kurtceviri.netlify.app', href: 'https://kurtceviri.netlify.app/', kind: 'live' }],
  },
];

export const VILLAGE_PROJECTS: VillageProject[] = [...featured, ...extras];
