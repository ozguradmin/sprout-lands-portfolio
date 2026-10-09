import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, FileText, Github, Instagram, Linkedin, Mail, Send, Youtube } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { G, GAME_LANG } from '../../i18n/game';
import { PROFILE } from '../../professional/data';
import { Interior } from '../UI/Interior';
import { Mark } from '../UI/marks';
import { CARD_BASE, CountUp, Eyebrow, Reveal } from '../UI/motionKit';

type L = { tr: string; en: string };

// İş için iletişim adresleri (profesyonel görünümle aynı).
const WORK_LINKS = [
  { name: 'LinkedIn', handle: 'Özgür Güler', href: PROFILE.links.linkedin, icon: <Linkedin size={20} /> },
  { name: 'GitHub', handle: '@ozguradmin', href: PROFILE.links.github, icon: <Github size={20} /> },
  { name: 'E-posta', nameEn: 'Email', handle: PROFILE.email, href: `mailto:${PROFILE.email}`, icon: <Mail size={20} /> },
  { name: 'X', handle: '@ozguramdin', href: PROFILE.links.x, icon: <span className="text-[17px] font-bold leading-none">X</span> },
];

// İçerik hesapları. Sayılar CV'den; "geçmişte" ibaresi CV'deki ifadeyle aynı.
// art: kartın arka planındaki piksel motif (scripts/village/build_account_art.py üretir).
type Account = {
  name: string;
  /** Kartta gosterilen kullanici adi. */
  handle: string;
  count?: number;
  /** Sayacin ustundeki kisa etiket (TAKIPCI, ABONE...). */
  countLabel?: L;
  tint: string;
  art: string;
  links: { kind: 'instagram' | 'youtube'; href: string; label: string }[];
};

const IG = '#a0306e';
const YT = '#b3261e';

const CONTENT_ACCOUNTS: Account[] = [
  {
    name: 'Tarihsel Wojak',
    handle: '@tarihselwojak',
    count: 1_000_000,
    countLabel: { tr: 'TAKİPÇİ · GEÇMİŞTE', en: 'FOLLOWERS · PAST' },
    tint: IG,
    art: 'acc-wojak',
    links: [
      { kind: 'instagram', href: 'https://instagram.com/tarihselwojak', label: '@tarihselwojak' },
      { kind: 'youtube', href: 'https://www.youtube.com/@Tarihselwojak', label: 'YouTube' },
    ],
  },
  {
    name: 'WTF Çeviri',
    handle: '@wtfceviri',
    count: 200_000,
    countLabel: { tr: 'TAKİPÇİ', en: 'FOLLOWERS' },
    tint: IG,
    art: 'acc-ceviri',
    links: [{ kind: 'instagram', href: 'https://instagram.com/wtfceviri', label: '@wtfceviri' }],
  },
  {
    name: 'Galaktik Uzay',
    handle: '@galaktikuzay',
    count: 200_000,
    countLabel: { tr: 'TAKİPÇİ', en: 'FOLLOWERS' },
    tint: IG,
    art: 'acc-uzay',
    links: [{ kind: 'instagram', href: 'https://instagram.com/galaktikuzay', label: '@galaktikuzay' }],
  },
  {
    name: 'Manipulatix',
    handle: '@manipulatix',
    tint: IG,
    art: 'acc-manipulatix',
    links: [{ kind: 'instagram', href: 'https://instagram.com/manipulatix', label: '@manipulatix' }],
  },
  {
    name: 'WTF Minecraft',
    handle: '@wtfmcraft',
    tint: IG,
    art: 'acc-minecraft',
    links: [{ kind: 'instagram', href: 'https://instagram.com/wtfmcraft', label: '@wtfmcraft' }],
  },
  {
    name: 'Kırmızı ya da Mavi',
    handle: '@kirmiziyadamavi0',
    count: 250_000,
    countLabel: { tr: 'ABONE', en: 'SUBSCRIBERS' },
    tint: YT,
    art: 'acc-kirmizimavi',
    links: [{ kind: 'youtube', href: 'https://www.youtube.com/@kirmiziyadamavi0', label: 'YouTube' }],
  },
];

const inputClass =
  'w-full rounded-xl border border-[#d9c7a8] bg-[#fffdf9] px-4 py-3 text-[15px] text-[#262b44] placeholder:text-[#9a9eb0] outline-none transition focus:border-[#b86f50] focus:ring-4 focus:ring-[#e4a672]/35';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#8d5d42]';

export const ArcadeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [formData, setFormData] = useState({ name: '', phone: '', instagram: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const still = useReducedMotion();

  useEffect(() => {
    if (status !== 'success') return;
    const id = window.setTimeout(() => setStatus('idle'), 6000);
    return () => window.clearTimeout(id);
  }, [status]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setIsSending(true);
    try {
      // Mesaj Worker üzerinden Telegram'a gider; bot token'ı tarayıcıya hiç inmez (worker/index.ts).
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', phone: '', instagram: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  const back = () => {
    sessionStorage.setItem('lastView', 'ARCADE');
    setCurrentView(ViewState.HUB);
  };

  return (
    <Interior
      title={G.socialTitle}
      markWord={G.socialMarkWord}
      subtitle={G.socialSub}
      eyebrow={<Eyebrow n="01">{G.eyebrowContact}</Eyebrow>}
      onBack={back}
    >
      {/* İletişim kartları */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {WORK_LINKS.map((l, i) => (
          <Reveal key={l.name} slot={4} delay={i * 0.05} immediate>
            <a
              href={l.href}
              target={l.href.startsWith('mailto') ? undefined : '_blank'}
              rel="noopener noreferrer"
              className={`${CARD_BASE} flex items-center gap-4 p-4`}
            >
              <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#262b44] text-[#faf6ee] transition-colors group-hover:bg-[#b86f50]">
                {l.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{GAME_LANG === 'en' && l.nameEn ? l.nameEn : l.name}</span>
                <span className="block truncate text-sm text-[#5b6075]">{l.handle}</span>
              </span>
              <ArrowUpRight size={18} className="ml-auto flex-none text-[#9a5438] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </Reveal>
        ))}
      </div>

      {/* Mesaj: köy masasına bırakılmış bir mektup. Form burada, ayrı pencere yok. */}
      <Reveal slot={6} immediate className="mt-12">
        <Eyebrow n="02">{G.eyebrowWrite}</Eyebrow>
      </Reveal>

      <Reveal slot={6} delay={0.05} immediate className="relative mt-3">
        <div className="relative overflow-hidden rounded-b-3xl border-2 border-[#d9c7a8] bg-[#fbf3e4] shadow-[0_12px_30px_rgba(35,40,64,0.08)]">
          {/* Üstte ahşap bir bant: köyün tabelalarıyla aynı desen */}
          <div className="h-2 bg-[linear-gradient(90deg,#e4a672_50%,#b86f50_50%)] bg-[length:12px_8px]" aria-hidden="true" />

          <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-10">
            {/* Sol: posta kutusu ve açıklama */}
            <div className="flex gap-4 md:block">
              {/* Kedi sandığın yanında bekler, sandık açılır, içinden mektup çıkar (sprite şeridi) */}
              <span className="msg-scene flex-none" aria-hidden="true" />
              <div className="md:mt-4">
                <h2 className="font-heading text-xl font-extrabold tracking-tight md:text-2xl">{G.messageCardTitle}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[#5b6075]">{G.messageCardText}</p>
                <p className="mt-3 hidden text-[13px] leading-relaxed text-[#8d5d42] md:block">{G.contactNote}</p>
                <a
                  href={PROFILE.cv[GAME_LANG]}
                  target="_blank"
                  rel="noopener"
                  className="mt-4 hidden h-10 items-center gap-2 rounded-xl border border-[#d9c7a8] bg-[#fffdf9] px-3.5 text-sm font-semibold transition hover:border-[#b86f50] active:scale-[0.98] md:inline-flex"
                >
                  <FileText size={16} /> {G.cvLabel}
                </a>
              </div>
            </div>

            {/* Sağ: formun kendisi */}
            <form onSubmit={handleSendMessage} className={`transition-opacity ${status === 'success' ? 'pointer-events-none opacity-20' : ''}`}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className={labelClass}>{G.nameLabel}</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={G.namePlaceholder}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>{G.instagramLabel}</span>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder={G.instagramPlaceholder}
                    className={inputClass}
                  />
                </label>
              </div>
              <label className="mt-3 block">
                <span className={labelClass}>{G.messageLabel}</span>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={G.messagePlaceholder}
                  className={`${inputClass} h-28 resize-none`}
                />
              </label>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button type="submit" disabled={isSending} className="group relative disabled:opacity-70">
                  <span className="absolute inset-0 translate-y-[3px] rounded-xl bg-[#b86f50]" />
                  <span className="relative inline-flex h-12 items-center gap-2 rounded-xl border-2 border-[#b86f50] bg-[#e4a672] px-5 text-sm font-bold text-[#4a2f22] transition-transform group-hover:brightness-105 group-active:translate-y-[3px]">
                    {isSending ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#4a2f22]/30 border-t-[#4a2f22]" /> : <Send size={16} />}
                    {G.send}
                  </span>
                </button>
                <Mark kind="arrowLeft" immediate delay={0.4} className="h-7 w-14 flex-none text-[#b86f50]" />
                <span className="font-hand text-[20px] leading-none text-[#9a5438] [rotate:-3deg]">{G.socialNote}</span>
                <a
                  href={PROFILE.cv[GAME_LANG]}
                  target="_blank"
                  rel="noopener"
                  className="ml-auto inline-flex h-10 items-center gap-2 rounded-xl border border-[#d9c7a8] bg-[#fffdf9] px-3.5 text-sm font-semibold transition hover:border-[#b86f50] active:scale-[0.98] md:hidden"
                >
                  <FileText size={16} /> {G.cvLabel}
                </a>
              </div>

              {status === 'error' && (
                <p role="alert" className="mt-3 rounded-lg border border-[#b3261e]/20 bg-[#b3261e]/5 px-3 py-2 text-sm font-medium text-[#b3261e]">
                  {G.error}{' '}
                  <a href={`mailto:${PROFILE.email}`} className="underline underline-offset-2">
                    {PROFILE.email}
                  </a>
                </p>
              )}
              <p className="mt-3 text-[12px] leading-relaxed text-[#8d5d42] md:hidden">{G.contactNote}</p>
            </form>
          </div>

          {/* Gönderildi: mektubun üstüne damga */}
          <AnimatePresence>
            {status === 'success' && (
              <motion.div
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 grid place-content-center justify-items-center"
                role="status"
              >
                <Mark kind="stamp" immediate className="h-20 w-20 text-[#3f7d2c]" />
                <p className="mt-1 font-hand text-[30px] text-[#3f7d2c] [rotate:-6deg]">{G.sentStamp}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Reveal>

      {/* Hesaplar: sayılar bu bölümün en görünür parçası */}
      <Reveal slot={7} immediate className="mt-12">
        <Eyebrow n="03">{G.eyebrowAccounts}</Eyebrow>
        <h2 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">{G.contentTitle}</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-[#5b6075]">{G.contentLead}</p>
      </Reveal>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {CONTENT_ACCOUNTS.map((a, i) => (
          <Reveal key={a.name} slot={9} delay={(i % 2) * 0.06} immediate>
            <article className="acc-card group">
              <img className="acc-photo" src={`/assets/accounts/${a.art}.webp?v=6`} alt="" width={1200} height={800} loading="lazy" decoding="async" />
              <span className="acc-shade" aria-hidden="true" />
              {/* Kartin tamami birincil hesaba gider; ikinci baglanti ustte ayri durur */}
              <a
                href={a.links[0].href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${a.name} - ${a.links[0].kind === 'youtube' ? 'YouTube' : 'Instagram'}`}
                className="absolute inset-0 z-10 rounded-[18px] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#e4a672]"
              />

              <div className="pointer-events-none relative z-20 flex h-full flex-col justify-between p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[12.5px] font-semibold text-white/90 backdrop-blur-md">
                    {a.links[0].kind === 'youtube' ? <Youtube size={15} /> : <Instagram size={15} />}
                    {a.links[0].kind === 'youtube' ? 'YouTube' : 'Instagram'}
                  </span>
                  <span className="truncate font-mono text-[12.5px] text-white/65">{a.handle}</span>
                </div>

                <div className="flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                  <div className="min-w-0">
                    <p className="font-pixel text-[8px] uppercase tracking-[0.16em] text-white/45">{G.accountLabel}</p>
                    <h3 className="mt-2 truncate font-heading text-[21px] font-extrabold leading-none text-white sm:text-[24px]">{a.name}</h3>
                  </div>
                  {a.count ? (
                    <div className="flex-none text-right">
                      <p className="font-pixel text-[8px] uppercase tracking-[0.16em] text-white/45">{a.countLabel?.[GAME_LANG]}</p>
                      <CountUp to={a.count} className="mt-2 block font-heading text-[21px] font-extrabold leading-none text-white sm:text-[24px]" />
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Ikinci hesap (varsa) kendi baglantisi olarak durur */}
              {a.links[1] && (
                <a
                  href={a.links[1].href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute left-5 top-[60px] z-30 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur-md transition hover:border-white/40 hover:bg-black/70 sm:left-6"
                >
                  {a.links[1].kind === 'youtube' ? <Youtube size={14} /> : <Instagram size={14} />}
                  {a.links[1].kind === 'youtube' ? 'YouTube' : a.links[1].label}
                </a>
              )}
            </article>
          </Reveal>
        ))}
      </div>

    </Interior>
  );
};
