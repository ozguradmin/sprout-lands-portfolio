// Profesyonel görünümün tek veri kaynağı (Türkçe + İngilizce).
// Buradaki bilgiler CV'lerden (public/pro/*.pdf), public GitHub repolarından, mağaza sayfalarından
// ve canlı sitelerden doğrulandı. Yeni bir iddia eklerken kaynağını kontrol et.

export type Lang = 'tr' | 'en';
type L = Record<Lang, string>;

export const SITE_URL = 'https://ozgurguler.tech';
export const LANGS: Lang[] = ['tr', 'en'];

// ---------- Yollar ----------
// tr: /professional, /professional/projects/<slug>
// en: /professional/en, /professional/en/projects/<slug>
export const proBase = (lang: Lang) => (lang === 'en' ? '/professional/en' : '/professional');
export const projectPath = (lang: Lang, slug: string) => `${proBase(lang)}/projects/${slug}`;
export const villagePath = (lang: Lang) => (lang === 'en' ? '/en' : '/');

export const parseProPath = (pathname: string): { lang: Lang; slug: string | null } => {
  const clean = pathname.replace(/\/+$/, '');
  const m = clean.match(/^\/professional(\/en)?(?:\/projects\/([a-z0-9-]+))?$/);
  const lang: Lang = /^\/professional\/en(\/|$)/.test(clean) ? 'en' : 'tr';
  const slug = m?.[2] && PROJECTS.some((p) => p.slug === m[2]) ? m[2] : null;
  return { lang, slug };
};

/** Aynı sayfanın diğer dildeki adresi. */
export const counterpartPath = (lang: Lang, slug: string | null): string => {
  const other: Lang = lang === 'en' ? 'tr' : 'en';
  return slug ? projectPath(other, slug) : proBase(other);
};

// ---------- Profil ----------
export const PROFILE = {
  name: 'Özgür Güler',
  email: 'destek@ozgurguler.tech',
  avatar: '/pro/img/avatar.webp',
  cv: { tr: '/pro/Ozgur_Guler_CV.pdf', en: '/pro/Ozgur_Guler_CV_English.pdf' } as L,
  links: {
    github: 'https://github.com/ozguradmin',
    linkedin: 'https://www.linkedin.com/in/%C3%B6zg%C3%BCr-g-133a33219/',
    x: 'https://x.com/ozguramdin',
  },
  role: { tr: 'Yazılım & Dijital Ürün Geliştirici', en: 'Software & Digital Product Developer' } as L,
  location: { tr: 'Mardin', en: 'Mardin, Türkiye' } as L,
  intro: {
    tr: [
      'Mobil uygulama, web ürünü ve otomasyon geliştiriyorum. Coğrafist, Dönerci ve Print Fast App Store ile Google Play’de; WTF Yapay Zekâ’nın Android uygulaması 50.000’den fazla indirildi.',
      'Bu projelerin çoğunda tek geliştiriciyim. Arayüz, backend, ödeme entegrasyonu ve mağaza yayını bende.',
    ],
    en: [
      'I build mobile apps, web products and automations. Coğrafist, Dönerci and Print Fast are on the App Store and Google Play, and the WTF Yapay Zekâ Android app has passed 50,000 downloads.',
      'On most of these I’m the only developer, so the interface, backend, payments and store releases are all mine.',
    ],
  } as Record<Lang, string[]>,
};

// ---------- Mağazadaki uygulamalar (hero altındaki kısa liste) ----------
export const STORE_APPS: { name: string; icon: string; note: L; href: string }[] = [
  { name: 'Coğrafist', icon: '/pro/img/cografist-icon.webp', note: { tr: 'App Store · Google Play', en: 'App Store · Google Play' }, href: '#cografist' },
  { name: 'Dönerci', icon: '/pro/img/donerci-icon.webp', note: { tr: 'App Store · Google Play', en: 'App Store · Google Play' }, href: '#donerci' },
  { name: 'Print Fast', icon: '/pro/img/printfast-icon.webp', note: { tr: 'App Store · Google Play', en: 'App Store · Google Play' }, href: '#print-fast' },
  {
    name: 'WTF Yapay Zekâ',
    icon: '/pro/img/wtf-icon.webp',
    note: { tr: 'Google Play · 50.000+ indirme', en: 'Google Play · 50,000+ downloads' },
    href: 'https://play.google.com/store/apps/details?id=com.wtfyapayzeka',
  },
];

// ---------- Öne çıkan projeler ----------
export type LinkKind = 'live' | 'github' | 'store';

export interface ProLink {
  label: L | string;
  href: string;
  kind: LinkKind;
}

export interface FeaturedProject {
  slug: string;
  name: string;
  icon?: string;
  image: { src: string; bg: string; alt: L };
  kind: L;
  status: L;
  summary: L;
  goal: L;
  built: Record<Lang, string[]>;
  result: L;
  stack: string[];
  links: ProLink[];
}

const both = (s: string): L => ({ tr: s, en: s });

export const PROJECTS: FeaturedProject[] = [
  {
    slug: 'cografist',
    name: 'Coğrafist',
    icon: '/pro/img/cografist-icon.webp',
    image: {
      src: '/pro/img/cografist',
      bg: '#d6e8d0',
      alt: { tr: 'Coğrafist’in harita, ana ekran ve soru ekranları', en: 'Coğrafist map, home and question screens' },
    },
    kind: { tr: 'Eğitim uygulaması · iOS, Android, web', en: 'Education app · iOS, Android, web' },
    status: both('App Store · Google Play · Web'),
    summary: {
      tr: 'KPSS coğrafyasını harita üzerinde çalıştıran uygulama.',
      en: 'A map-based app for studying geography for Türkiye’s KPSS civil service exam.',
    },
    goal: {
      tr: 'Coğrafya konularını liste ezberlemek yerine haritada oynayarak ve açıklamalı sorularla çalışmak.',
      en: 'Let people study geography by playing on a map and answering explained questions instead of memorising lists.',
    },
    built: {
      tr: [
        'Harita oyunları ve açıklamalı soru bankası dahil 30’dan fazla çalışma modu, ilerleme takibi',
        'React ve TypeScript ile tek kod tabanı; Capacitor ile iOS ve Android paketleri',
        'Firebase ile giriş, veri, bildirim ve Cloud Functions; abonelik için RevenueCat',
        'Destek e-postaları için Cloudflare Workers, D1, R2 ve Queues üzerinde kendi mail sistemi',
      ],
      en: [
        '30+ study modes including map games and an explained question bank, with progress tracking',
        'One React + TypeScript codebase, packaged for iOS and Android with Capacitor',
        'Firebase for sign-in, data, push notifications and Cloud Functions; RevenueCat for subscriptions',
        'A small support-mail system on Cloudflare Workers with D1, R2 and Queues',
      ],
    },
    result: {
      tr: 'Nisan 2026’dan beri App Store ve Google Play’de. Web sürümü cografist.app’te.',
      en: 'On the App Store and Google Play since April 2026. Web version at cografist.app.',
    },
    stack: ['React', 'TypeScript', 'Capacitor', 'Firebase', 'RevenueCat', 'Zustand', 'Playwright', 'Cloudflare Workers'],
    links: [
      { label: 'cografist.app', href: 'https://cografist.app/', kind: 'live' },
      { label: 'App Store', href: 'https://apps.apple.com/tr/app/cografist/id6760704715', kind: 'store' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.ozguradmin.cografist', kind: 'store' },
    ],
  },
  {
    slug: 'galaktik-uzay',
    name: 'Galaktik Uzay',
    image: { src: '/pro/img/galaktikuzay', bg: '#262b44', alt: { tr: 'galaktikuzay.com ana sayfası', en: 'galaktikuzay.com home page' } },
    kind: { tr: 'Yayın otomasyonu · Cloudflare, Azure OpenAI', en: 'Publishing automation · Cloudflare, Azure OpenAI' },
    status: { tr: 'Canlı · Açık kaynak', en: 'Live · Open source' },
    summary: {
      tr: 'Uzay haberlerini bulup Türkçe yazan, beş dile çeviren ve WordPress’te yayınlayan sistem.',
      en: 'A pipeline that finds space news, writes a Turkish article, translates it into five languages and publishes it on WordPress.',
    },
    goal: {
      tr: 'Galaktik Uzay’ı tek başıma işletiyorum. Haber takibi, yazım, görsel bulma, çeviri ve yayını elle yapmak yerine zamanlanmış bir akışa bağlamak istedim.',
      en: 'I run Galaktik Uzay on my own. I wanted news tracking, writing, image search, translation and publishing to run on a schedule instead of by hand.',
    },
    built: {
      tr: [
        'Hono ile yazılmış bir Cloudflare Worker: Tavily’den haber arıyor, D1’deki kayıtlarla tekrarları ve eski haberleri eliyor, Azure OpenAI’dan JSON formatında Türkçe taslak alıyor',
        'Görseli önce NASA Images API’de, bulamazsa Serper’da arıyor; yazıyı WordPress REST API ile yayına ya da taslağa gönderiyor',
        'Ayrı bir çeviri Worker’ı İngilizce, Almanca, İspanyolca, Fransızca ve Felemenkçe sürümleri üretiyor; Polylang altı dili birbirine bağlıyor',
        'Next.js yönetim paneli: Worker anahtarları tarayıcıya inmiyor, oturum HMAC imzalı HttpOnly çerezle tutuluyor',
      ],
      en: [
        'A Cloudflare Worker written with Hono: searches news via Tavily, drops duplicates and stale stories using D1, and gets a structured Turkish draft from Azure OpenAI',
        'Looks for images on the NASA Images API first, then Serper; publishes or drafts the post through the WordPress REST API',
        'A separate translation Worker produces English, German, Spanish, French and Dutch editions, linked together with Polylang',
        'A Next.js admin panel that keeps Worker credentials server-side, with HMAC-signed HttpOnly session cookies',
      ],
    },
    result: {
      tr: 'galaktikuzay.com altı dilde yayında. Kod ve CI GitHub’da açık.',
      en: 'galaktikuzay.com publishes in six languages. Code and CI are public on GitHub.',
    },
    stack: ['Cloudflare Workers', 'Hono', 'D1', 'TypeScript', 'Azure OpenAI', 'Next.js', 'WordPress REST API', 'GitHub Actions'],
    links: [
      { label: 'galaktikuzay.com', href: 'https://galaktikuzay.com/', kind: 'live' },
      { label: 'GitHub', href: 'https://github.com/ozguradmin/galaktikuzay', kind: 'github' },
    ],
  },
  {
    slug: 'donerci',
    name: 'Dönerci',
    icon: '/pro/img/donerci-icon.webp',
    image: {
      src: '/pro/img/donerci',
      bg: '#f3debe',
      alt: { tr: 'Dönerci’den dükkân, dekorasyon ve şube ekranları', en: 'Dönerci shop, decoration and branch screens' },
    },
    kind: { tr: 'Mobil oyun · Godot 4', en: 'Mobile game · Godot 4' },
    status: both('App Store · Google Play'),
    summary: {
      tr: 'Döner dükkânı açıp büyüttüğün 3D tycoon oyunu.',
      en: 'A 3D tycoon game about running and growing a döner shop.',
    },
    goal: {
      tr: 'Bir mobil oyunu baştan sona kendim yapıp iki mağazada yayınlamak: oynanış, reklam, satın alma ve sunucu tarafı dahil.',
      en: 'Build a mobile game myself and ship it on both stores, including gameplay, ads, purchases and the server side.',
    },
    built: {
      tr: [
        'GDScript ile müşteri akışı, masa açma, personel, ikinci şube, görevler ve çevrimdışı kazanç',
        'AdMob ile ödüllü ve geçiş reklamları; Google Play Billing ve StoreKit 2 ile satın alma',
        'Cloudflare Worker üzerinde uzaktan ayar (KV) ve hız sınırlı hata raporlama',
        'Satın alma ödülleri sunucuda makbuz doğrulandıktan sonra veriliyor; aynı makbuzun iki kez işlenmesini bir Durable Object engelliyor',
      ],
      en: [
        'Customer flow, table unlocks, staff, a second branch, missions and offline earnings in GDScript',
        'Rewarded and interstitial ads with AdMob; purchases with Google Play Billing and StoreKit 2',
        'Remote config (KV) and rate-limited error reporting on a Cloudflare Worker',
        'Purchase rewards are only granted after server-side receipt validation; a Durable Object stops the same receipt from being processed twice',
      ],
    },
    result: {
      tr: 'Eylül 2026’da App Store ve Google Play’de yayınlandı. Beş dil destekliyor.',
      en: 'Released on the App Store and Google Play in September 2026. Available in five languages.',
    },
    stack: ['Godot 4', 'GDScript', 'AdMob', 'Google Play Billing', 'StoreKit 2', 'Cloudflare Workers', 'Durable Objects', 'Codemagic'],
    links: [
      { label: 'donerci.ozgurguler.tech', href: 'https://donerci.ozgurguler.tech/', kind: 'live' },
      { label: 'App Store', href: 'https://apps.apple.com/tr/app/id6804304454', kind: 'store' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.donerci.game', kind: 'store' },
    ],
  },
  {
    slug: 'print-fast',
    name: 'Print Fast',
    icon: '/pro/img/printfast-icon.webp',
    image: {
      src: '/pro/img/printfast',
      bg: '#dce3f0',
      alt: { tr: 'Print Fast’ten fiş, katalog ve geçmiş ekranları', en: 'Print Fast receipt, catalog and history screens' },
    },
    kind: { tr: 'Mobil uygulama · termal yazıcı', en: 'Mobile app · thermal printing' },
    status: both('App Store · Google Play'),
    summary: {
      tr: 'Telefondan Bluetooth ya da Wi-Fi termal yazıcıya fiş, etiket ve barkod bastıran uygulama.',
      en: 'Prints receipts, labels and barcodes from a phone to Bluetooth or Wi-Fi thermal printers.',
    },
    goal: {
      tr: 'Küçük işletmelerin ayrı bir POS programı kurmadan telefondan fiş ve etiket basabilmesi.',
      en: 'Let small businesses print receipts and labels from a phone without a separate POS system.',
    },
    built: {
      tr: [
        'ESC/POS ve CPCL komutlarını üretip BLE, klasik Bluetooth (Android) ya da TCP soket üzerinden yazıcıya gönderme',
        'Sürükle-bırak fiş ve etiket şablonları, barkod ve QR üretimi, kamerayla barkod okuma, ürün kataloğu',
        'İnternetsiz çalışma; RevenueCat ile abonelik, uzaktan ayar ve hata raporlama',
      ],
      en: [
        'Generates ESC/POS and CPCL commands and sends them over BLE, classic Bluetooth (Android) or a TCP socket',
        'Drag-and-drop receipt and label templates, barcode and QR generation, camera barcode scanning, a product catalog',
        'Works offline; subscriptions through RevenueCat, remote config and error reporting',
      ],
    },
    result: {
      tr: 'Mart 2026’dan beri App Store ve Google Play’de.',
      en: 'On the App Store and Google Play since March 2026.',
    },
    stack: ['Next.js', 'React', 'TypeScript', 'Capacitor', 'Bluetooth LE', 'ESC/POS', 'RevenueCat'],
    links: [
      { label: 'App Store', href: 'https://apps.apple.com/tr/app/print-fast/id6760506277', kind: 'store' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.printfast.app', kind: 'store' },
    ],
  },
  {
    slug: 'ofile-opaste',
    name: 'OFile & OPaste',
    image: { src: '/pro/img/edge-tools', bg: '#262b44', alt: { tr: 'OFile ve OPaste arayüzleri', en: 'OFile and OPaste interfaces' } },
    kind: { tr: 'Geliştirici araçları · Cloudflare Workers', en: 'Developer tools · Cloudflare Workers' },
    status: { tr: 'Canlı · Açık kaynak', en: 'Live · Open source' },
    summary: {
      tr: 'Terminalden tek curl komutuyla dosya ve metin paylaşmak için iki küçük servis.',
      en: 'Two small services for sharing files and text from the terminal with a single curl command.',
    },
    goal: {
      tr: 'Script’lerin ve AI ajanlarının hesap açmadan dosya ve metin bırakabileceği, takip kodu olmayan hızlı bir yer.',
      en: 'A fast, tracker-free place where scripts and AI agents can drop files and text without an account.',
    },
    built: {
      tr: [
        'İkisi de tamamen Cloudflare Workers’ta; dosyalar R2’de, kayıtlar Workers KV’de',
        'curl, wget ve PowerShell’i tanıyıp düz metin cevap veriyor; stdin’den yükleme ve /raw adresi var',
        'OFile dosyaları 24 saatte, OPaste metinleri 30 günde siliyor; fatura kontrolden çıkmasın diye toplam depolama 8 GB ile sınırlı',
      ],
      en: [
        'Both run entirely on Cloudflare Workers; files in R2, metadata in Workers KV',
        'Detects curl, wget and PowerShell and answers in plain text; supports uploads from stdin and a /raw endpoint',
        'OFile deletes files after 24 hours and OPaste after 30 days; total storage is capped at 8 GB to keep costs predictable',
      ],
    },
    result: {
      tr: 'files.ozgurguler.tech ve paste.ozgurguler.tech’te çalışıyor. İki repo da MIT lisanslı.',
      en: 'Running at files.ozgurguler.tech and paste.ozgurguler.tech. Both repos are MIT-licensed.',
    },
    stack: ['Cloudflare Workers', 'R2', 'Workers KV', 'JavaScript'],
    links: [
      { label: 'files.ozgurguler.tech', href: 'https://files.ozgurguler.tech/', kind: 'live' },
      { label: 'paste.ozgurguler.tech', href: 'https://paste.ozgurguler.tech/', kind: 'live' },
      { label: 'OFile GitHub', href: 'https://github.com/ozguradmin/ofile', kind: 'github' },
      { label: 'OPaste GitHub', href: 'https://github.com/ozguradmin/opaste', kind: 'github' },
    ],
  },
  {
    slug: 'whisper-web-scribe',
    name: 'Whisper Web Scribe',
    image: { src: '/pro/img/whisper', bg: '#262b44', alt: { tr: 'Whisper Web Scribe dosya yükleme ekranı', en: 'Whisper Web Scribe upload screen' } },
    kind: { tr: 'Tarayıcıda konuşmadan yazıya', en: 'In-browser speech-to-text' },
    status: { tr: 'Canlı · Açık kaynak', en: 'Live · Open source' },
    summary: {
      tr: 'Sesi hiçbir sunucuya göndermeden tarayıcıda yazıya döken araç.',
      en: 'Transcribes audio in the browser without sending it to a server.',
    },
    goal: {
      tr: 'Ses ve videoları ücretsiz, backend olmadan ve dosya cihazdan çıkmadan yazıya dökmek.',
      en: 'Transcribe audio and video for free, with no backend, without the file leaving the device.',
    },
    built: {
      tr: [
        'Whisper modelleri (tiny, base, small) Transformers.js ile bir Web Worker içinde; WebGPU varsa GPU’da, yoksa WASM ile',
        'Kelime düzeyinde zaman damgası, kelimeye tıklayınca o saniyeye atlama, basit konuşmacı ayırma',
        'JSON, SRT ve VTT olarak dışa aktarma; altı dil',
      ],
      en: [
        'Whisper models (tiny, base, small) run through Transformers.js in a Web Worker, on WebGPU when available and WASM otherwise',
        'Word-level timestamps, click any word to jump to it, simple speaker separation',
        'Export to JSON, SRT and VTT; six languages',
      ],
    },
    result: { tr: 'Vercel’de yayında, kodu GitHub’da.', en: 'Live on Vercel, source on GitHub.' },
    stack: ['React 19', 'TypeScript', 'Vite', 'Transformers.js', 'WebGPU', 'Web Workers'],
    links: [
      { label: { tr: 'Canlı demo', en: 'Live demo' }, href: 'https://whisper-web-scribe.vercel.app/', kind: 'live' },
      { label: 'GitHub', href: 'https://github.com/ozguradmin/whisper-web-scribe', kind: 'github' },
    ],
  },
];

// ---------- Diğer işler ----------
export interface SmallProject {
  name: string;
  text: L;
  links: { label: L | string; href: string }[];
}

export const MORE_PROJECTS: SmallProject[] = [
  {
    name: 'LLM Evaluation Toolkit',
    text: {
      tr: 'OpenAI uyumlu modelleri aynı veri setinde JSON kalitesi, kaynağa bağlılık, dil tutarlılığı, gecikme, token ve maliyet açısından karşılaştıran TypeScript aracı.',
      en: 'A TypeScript tool that compares OpenAI-compatible models on the same dataset for JSON quality, source adherence, language consistency, latency, tokens and cost.',
    },
    links: [
      { label: { tr: 'Kaynak kod', en: 'Source' }, href: 'https://github.com/ozguradmin/galaktikuzay/tree/master/llm-eval' },
      { label: 'Demo', href: 'https://galaktikuzay-galaktikuzay-llm-eval.static.hf.space/index.html#demo' },
      { label: 'GPU Space', href: 'https://huggingface.co/spaces/ozgurguler/galaktikuzay-llm-eval-gpu' },
    ],
  },
  {
    name: 'WTF Yapay Zekâ',
    text: {
      tr: 'Yapay zekâ haberleri ve rehberleri yayınlayan site ve Android uygulaması. Uygulama 50.000’den fazla indirildi.',
      en: 'A website and Android app with AI news and guides. The app has more than 50,000 downloads.',
    },
    links: [
      { label: 'Web', href: 'https://wtfyapayzeka.com/' },
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.wtfyapayzeka' },
    ],
  },
  {
    name: 'ONOPO Store · Ivricambi',
    text: {
      tr: 'İki işletme için frontend ve backend’iyle sıfırdan yaptığım web siteleri: ürün ve katalog yapıları, siteye özel akışlar.',
      en: 'Websites I built from scratch for two businesses, frontend and backend, with product catalogs and site-specific workflows.',
    },
    links: [
      { label: 'ONOPO', href: 'https://onopostore.com/' },
      { label: 'Ivricambi', href: 'https://ivricambi.com/' },
    ],
  },
  {
    name: 'Birlikte İzle',
    text: { tr: 'Oda açıp yayın paylaşarak birlikte izleme ve sohbet.', en: 'Open a room, share a stream, watch and chat together.' },
    links: [{ label: { tr: 'Canlı', en: 'Live' }, href: 'https://birlikteizle.ozgurguler.workers.dev/' }],
  },
  {
    name: 'FoodLens',
    text: { tr: 'OpenFoodFacts verisiyle paketli gıdaların içeriğini inceleyen araç.', en: 'Looks up packaged food ingredients using OpenFoodFacts data.' },
    links: [{ label: { tr: 'Canlı', en: 'Live' }, href: 'https://foodlens.ozgurguler.tech/' }],
  },
  {
    name: 'Yatırım Zaman Makinesi',
    text: {
      tr: 'Dolar, altın, BIST100, Bitcoin ve bileşik faizin geçmiş getirilerini karşılaştıran simülatör.',
      en: 'Compares the historical returns of the dollar, gold, BIST100, Bitcoin and compound interest.',
    },
    links: [{ label: { tr: 'Canlı', en: 'Live' }, href: 'https://yatirim.ozgurguler.tech/' }],
  },
];

// ---------- Teknolojiler ----------
export const SKILLS: { title: string; items: L }[] = [
  { title: 'Frontend / Product', items: both('TypeScript, JavaScript, React, Next.js, Vite, Tailwind CSS, Phaser') },
  { title: 'Backend / APIs', items: both('Node.js, Hono, REST, WordPress REST API, Meta Graph API, YouTube API, X API, Telegram Bot API') },
  {
    title: 'AI & Automation',
    items: {
      tr: 'Azure OpenAI, OpenAI uyumlu API’ler, LLM değerlendirme, Transformers.js, zamanlanmış içerik akışları',
      en: 'Azure OpenAI, OpenAI-compatible APIs, LLM evaluation, Transformers.js, scheduled content pipelines',
    },
  },
  { title: 'Cloud & Infrastructure', items: both('Cloudflare Workers, R2, KV, Queues, Durable Objects, Firebase, Vercel, Google Cloud, Oracle Cloud') },
  {
    title: 'Mobile',
    items: {
      tr: 'Capacitor, Godot 4, RevenueCat, AdMob, StoreKit 2, Google Play Billing, App Store ve Google Play yayını',
      en: 'Capacitor, Godot 4, RevenueCat, AdMob, StoreKit 2, Google Play Billing, App Store and Google Play releases',
    },
  },
  { title: 'Data / Database', items: both('SQL, Cloudflare D1, Firestore, Workers KV') },
  {
    title: 'Tools',
    items: { tr: 'Git, GitHub Actions, Playwright, Wrangler, Codemagic, AI kodlama araçları', en: 'Git, GitHub Actions, Playwright, Wrangler, Codemagic, AI coding tools' },
  },
];

// ---------- Hakkımda ----------
export const ABOUT: Record<Lang, string[]> = {
  tr: [
    'Mardin’de yaşıyorum. Eğitimim sağlık alanında: İstanbul Yeni Yüzyıl Üniversitesi, Ağız ve Diş Sağlığı ön lisans (2026). Yazılım deneyimim bu sayfadaki projelerden geliyor.',
    'Çoğu projede tek geliştiriciyim, bu yüzden iş kodu yazınca bitmiyor. Mağaza incelemeleri, ödeme entegrasyonları, hata raporları ve sunucu maliyeti de benim takibimde. Backend için genelde Cloudflare Workers, D1 ve R2; mobilde Capacitor ya da Godot kullanıyorum.',
    'AI kodlama araçlarını her gün kullanıyorum. İşi hızlandırıyorlar; neyin doğru çalıştığını kontrol etmek ve neyin yayına çıkacağına karar vermek yine bende. Model seçerken de tahmin etmek yerine ölçüyorum, LLM Evaluation Toolkit bunun için var.',
  ],
  en: [
    'I live in Mardin, Türkiye. My degree is in health: an associate degree in Oral and Dental Health from Istanbul Yeni Yüzyıl University (2026). My software experience comes from the projects on this page.',
    'On most projects I’m the only developer, so the work doesn’t stop at writing code. Store reviews, payment integrations, error reports and server costs are mine to watch too. For backends I usually reach for Cloudflare Workers, D1 and R2; for mobile, Capacitor or Godot.',
    'I use AI coding tools every day. They make me faster; checking that things actually work and deciding what ships is still my job. When choosing models I prefer measuring to guessing, which is what the LLM Evaluation Toolkit is for.',
  ],
};

export const MEDIA: { intro: L; items: { name: string; text: L; links: { label: string; href: string }[] }[] } = {
  intro: {
    tr: 'Yazılımın yanında içerik tarafında da çalıştım. Aşağıdaki hesapları sıfırdan kurdum; Siccin ve Nazar filmleri için ücretli tanıtım yaptım.',
    en: 'Alongside software I’ve worked on content. I started the accounts below from scratch and ran paid promotions for the films Siccin and Nazar.',
  },
  items: [
    {
      name: 'Tarihsel Wojak',
      text: { tr: 'Instagram’da geçmişte 1M+ takipçi, YouTube’da 100K+ abone', en: 'previously 1M+ Instagram followers, 100K+ YouTube subscribers' },
      links: [
        { label: 'Instagram', href: 'https://instagram.com/tarihselwojak' },
        { label: 'YouTube', href: 'https://www.youtube.com/@Tarihselwojak' },
      ],
    },
    {
      name: 'WTF Çeviri · Galaktik Uzay',
      text: { tr: 'iki Instagram hesabı da 200K+ takipçi', en: 'both Instagram accounts at 200K+ followers' },
      links: [
        { label: 'WTF Çeviri', href: 'https://instagram.com/wtfceviri' },
        { label: 'Galaktik Uzay', href: 'https://instagram.com/galaktikuzay' },
      ],
    },
    {
      name: 'Kırmızı ya da Mavi',
      text: { tr: 'YouTube’da 250K+ abone', en: '250K+ YouTube subscribers' },
      links: [{ label: 'YouTube', href: 'https://www.youtube.com/@kirmiziyadamavi0' }],
    },
  ],
};

// ---------- Arayüz metinleri ----------
export const UI = {
  tr: {
    skip: 'İçeriğe geç',
    toTop: 'Sayfanın başına git',
    nav: { projects: 'Projeler', skills: 'Teknolojiler', about: 'Hakkımda', contact: 'İletişim' },
    navLabel: 'Bölümler',
    themeToDark: 'Koyu temaya geç',
    themeToLight: 'Açık temaya geç',
    langSwitchShort: 'EN',
    langSwitchAria: 'Read in English',
    village: 'Dijital Köy',
    villageShort: 'Köy',
    villageAria: 'Dijital köye dön',
    seeProjects: 'Projelere bak',
    cv: 'CV',
    cvDownload: 'CV’yi PDF olarak indir',
    email: 'E-posta',
    exploreVillage: 'Oynanabilir sürüm',
    storesTitle: 'Mağazalarda',
    projectsTitle: 'Projeler',
    projectsSub: 'Canlı sürümünü, mağaza sayfasını ya da kodunu kendiniz inceleyebileceğiniz işler.',
    goal: 'Amaç',
    built: 'Ne geliştirdim',
    result: 'Sonuç',
    stack: 'Teknolojiler',
    details: 'Detaylar',
    hideDetails: 'Detayları gizle',
    copyLink: 'Bağlantıyı kopyala',
    copied: (n: string) => `${n} bağlantısı kopyalandı`,
    linkPrompt: 'Proje bağlantısı',
    newTab: '(yeni sekmede açılır)',
    moreTitle: 'Diğer işler',
    skillsTitle: 'Teknolojiler',
    skillsSub: 'Yukarıdaki projelerde ve CV’mde geçenler.',
    aboutTitle: 'Hakkımda',
    mediaTitle: 'İçerik ve büyüme',
    contactTitle: 'İletişim',
    contactText: 'E-posta ya da LinkedIn üzerinden yazabilirsiniz.',
    cvTr: 'CV (Türkçe, PDF)',
    cvEn: 'CV (İngilizce, PDF)',
    villageNote: 'Bu portfolyonun bir de oynanabilir hali var: karakterle köyü gezip binalara girerek projelere ulaşabilirsiniz.',
    villageCta: 'Dijital köye git',
    credit: 'Köy görselleri: Sprout Lands · Cup Nooble',
  },
  en: {
    skip: 'Skip to content',
    toTop: 'Back to top',
    nav: { projects: 'Projects', skills: 'Stack', about: 'About', contact: 'Contact' },
    navLabel: 'Sections',
    themeToDark: 'Switch to dark theme',
    themeToLight: 'Switch to light theme',
    langSwitchShort: 'TR',
    langSwitchAria: 'Türkçe oku',
    village: 'Digital Village',
    villageShort: 'Village',
    villageAria: 'Back to the digital village',
    seeProjects: 'See projects',
    cv: 'CV',
    cvDownload: 'Download CV as PDF',
    email: 'Email',
    exploreVillage: 'Playable version',
    storesTitle: 'In the stores',
    projectsTitle: 'Projects',
    projectsSub: 'Work you can check for yourself: live versions, store pages or source code.',
    goal: 'Goal',
    built: 'What I built',
    result: 'Outcome',
    stack: 'Stack',
    details: 'Details',
    hideDetails: 'Hide details',
    copyLink: 'Copy link',
    copied: (n: string) => `Link to ${n} copied`,
    linkPrompt: 'Project link',
    newTab: '(opens in a new tab)',
    moreTitle: 'Other work',
    skillsTitle: 'Stack',
    skillsSub: 'What I’ve used in the projects above and on my CV.',
    aboutTitle: 'About',
    mediaTitle: 'Content and growth',
    contactTitle: 'Contact',
    contactText: 'Email or LinkedIn is the best way to reach me.',
    cvTr: 'CV (Turkish, PDF)',
    cvEn: 'CV (English, PDF)',
    villageNote: 'There’s also a playable version of this portfolio: walk around the village and step into the buildings to see my projects.',
    villageCta: 'Go to the village',
    credit: 'Village art: Sprout Lands by Cup Nooble',
  },
};

export const labelOf = (label: L | string, lang: Lang) => (typeof label === 'string' ? label : label[lang]);

// ---------- Meta ----------
export interface PageMeta {
  title: string;
  description: string;
  url: string;
  image: string;
  lang: Lang;
  alternates: { lang: Lang; url: string }[];
}

export const metaFor = (lang: Lang, slug: string | null): PageMeta => {
  const p = slug ? PROJECTS.find((x) => x.slug === slug) : undefined;
  const alternates = LANGS.map((l) => ({ lang: l, url: `${SITE_URL}${slug ? projectPath(l, slug) : proBase(l)}` }));
  const image = `${SITE_URL}/pro/img/${lang === 'en' ? 'og-professional-en' : 'og-professional'}.png`;
  if (p) {
    return {
      title: `${p.name}: ${p.kind[lang]} | Özgür Güler`,
      description: `${p.summary[lang]} ${p.result[lang]}`,
      url: `${SITE_URL}${projectPath(lang, p.slug)}`,
      image,
      lang,
      alternates,
    };
  }
  return {
    title: `Özgür Güler | ${PROFILE.role[lang]}`,
    description:
      lang === 'en'
        ? 'Mobile apps, web products and automations. Three apps on the App Store and Google Play, services running on Cloudflare Workers, and open-source projects.'
        : 'Mobil uygulama, web ürünü ve otomasyon. App Store ve Google Play’de üç uygulama, Cloudflare Workers üzerinde çalışan servisler ve açık kaynak projeler.',
    url: `${SITE_URL}${proBase(lang)}`,
    image,
    lang,
    alternates,
  };
};
