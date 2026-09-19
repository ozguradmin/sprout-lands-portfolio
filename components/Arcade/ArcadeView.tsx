import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, FileText, Github, Instagram, Linkedin, Mail, MessageSquare, Send, X, Youtube } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { G, GAME_LANG } from '../../i18n/game';
import { PROFILE } from '../../professional/data';
import { Interior } from '../UI/Interior';

type L = { tr: string; en: string };

// İş için iletişim adresleri (profesyonel görünümle aynı).
const WORK_LINKS = [
  { name: 'LinkedIn', handle: 'Özgür Güler', href: PROFILE.links.linkedin, icon: <Linkedin size={20} /> },
  { name: 'GitHub', handle: '@ozguradmin', href: PROFILE.links.github, icon: <Github size={20} /> },
  { name: 'E-posta', nameEn: 'Email', handle: PROFILE.email, href: `mailto:${PROFILE.email}`, icon: <Mail size={20} /> },
  { name: 'X', handle: '@ozguramdin', href: PROFILE.links.x, icon: <span className="text-[17px] font-bold leading-none">X</span> },
];

// İçerik hesapları. Sayılar CV'den; "geçmişte" ibaresi CV'deki ifadeyle aynı.
const CONTENT_ACCOUNTS: { name: string; note?: L; links: { kind: 'instagram' | 'youtube'; href: string; label: string }[] }[] = [
  {
    name: 'Tarihsel Wojak',
    note: { tr: 'Instagram’da geçmişte 1M+ takipçi, YouTube’da 100K+ abone', en: 'Previously 1M+ on Instagram, 100K+ on YouTube' },
    links: [
      { kind: 'instagram', href: 'https://instagram.com/tarihselwojak', label: '@tarihselwojak' },
      { kind: 'youtube', href: 'https://www.youtube.com/@Tarihselwojak', label: 'YouTube' },
    ],
  },
  {
    name: 'WTF Çeviri',
    note: { tr: '200K+ takipçi', en: '200K+ followers' },
    links: [{ kind: 'instagram', href: 'https://instagram.com/wtfceviri', label: '@wtfceviri' }],
  },
  {
    name: 'Galaktik Uzay',
    note: { tr: '200K+ takipçi', en: '200K+ followers' },
    links: [{ kind: 'instagram', href: 'https://instagram.com/galaktikuzay', label: '@galaktikuzay' }],
  },
  {
    name: 'Kırmızı ya da Mavi',
    note: { tr: '250K+ abone', en: '250K+ subscribers' },
    links: [{ kind: 'youtube', href: 'https://www.youtube.com/@kirmiziyadamavi0', label: 'YouTube' }],
  },
  { name: 'Manipulatix', links: [{ kind: 'instagram', href: 'https://instagram.com/manipulatix', label: '@manipulatix' }] },
  { name: 'WTF Minecraft', links: [{ kind: 'instagram', href: 'https://instagram.com/wtfmcraft', label: '@wtfmcraft' }] },
];

const inputClass =
  'w-full rounded-xl border border-[#e3d6bf] bg-white px-4 py-3 text-[15px] text-[#262b44] placeholder:text-[#9a9eb0] outline-none transition focus:border-[#b86f50] focus:ring-2 focus:ring-[#e4a672]/40';
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#5b6075]';

export const ArcadeView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', instagram: '', message: '' });
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (!isMessageOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMessageOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMessageOpen]);

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
        setTimeout(() => {
          setIsMessageOpen(false);
          setStatus('idle');
        }, 2000);
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
    <Interior title={G.socialTitle} subtitle={G.socialSub} onBack={back}>
      {/* İletişim */}
      <h2 className="mt-10 font-heading text-xl font-bold">{G.workTitle}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {WORK_LINKS.map((l) => (
          <a
            key={l.name}
            href={l.href}
            target={l.href.startsWith('mailto') ? undefined : '_blank'}
            rel="noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl border border-[#e3d6bf] bg-[#fffdf9] p-4 transition hover:-translate-y-0.5 hover:border-[#b86f50]/60 hover:shadow-[0_8px_24px_rgba(35,40,64,0.08)]"
          >
            <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#262b44] text-[#faf6ee]">{l.icon}</span>
            <span className="min-w-0">
              <span className="block font-semibold">{GAME_LANG === 'en' && l.nameEn ? l.nameEn : l.name}</span>
              <span className="block truncate text-sm text-[#5b6075]">{l.handle}</span>
            </span>
            <ArrowUpRight size={18} className="ml-auto flex-none text-[#9a5438] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        ))}
      </div>

      {/* Mesaj kartı */}
      <div className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-[#b86f50] bg-[#fbe6d3] p-5 sm:flex-row sm:items-center">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-[#e4a672] text-[#4a2f22]">
          <MessageSquare size={20} />
        </span>
        <div>
          <p className="font-heading text-lg font-bold">{G.messageCardTitle}</p>
          <p className="text-sm text-[#5b6075]">{G.messageCardText}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => setIsMessageOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#262b44] px-4 text-sm font-semibold text-[#faf6ee] transition hover:brightness-125"
          >
            <Send size={16} /> {G.writeMessage}
          </button>
          <a
            href={PROFILE.cv[GAME_LANG]}
            target="_blank"
            rel="noopener"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#b86f50]/40 bg-[#fffdf9] px-4 text-sm font-semibold transition hover:border-[#b86f50]"
          >
            <FileText size={16} /> {G.cvLabel}
          </a>
        </div>
      </div>

      {/* İçerik hesapları */}
      <h2 className="mt-12 font-heading text-xl font-bold">{G.contentTitle}</h2>
      <ul className="mt-4 divide-y divide-[#e3d6bf] overflow-hidden rounded-2xl border border-[#e3d6bf] bg-[#fffdf9]">
        {CONTENT_ACCOUNTS.map((a) => (
          <li key={a.name} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
            <div className="min-w-0 sm:flex-1">
              <p className="font-semibold">{a.name}</p>
              {a.note && <p className="text-sm text-[#5b6075]">{a.note[GAME_LANG]}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {a.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition ${
                    l.kind === 'youtube'
                      ? 'border-[#e3d6bf] text-[#b3261e] hover:border-[#b3261e]/50 hover:bg-[#b3261e]/5'
                      : 'border-[#e3d6bf] text-[#a0306e] hover:border-[#a0306e]/50 hover:bg-[#a0306e]/5'
                  }`}
                >
                  {l.kind === 'youtube' ? <Youtube size={16} /> : <Instagram size={16} />}
                  {l.label}
                </a>
              ))}
            </div>
          </li>
        ))}
      </ul>

      {/* Mesaj formu */}
      <AnimatePresence>
        {isMessageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end justify-center bg-[#1b1f31]/70 backdrop-blur-sm sm:items-center sm:p-6"
            onClick={() => setIsMessageOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="message-title"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#fffdf9] p-6 text-[#262b44] shadow-2xl sm:rounded-3xl sm:p-7"
            >
              <div className="flex items-center justify-between">
                <h2 id="message-title" className="font-heading text-2xl font-extrabold tracking-tight">
                  {G.messageCardTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMessageOpen(false)}
                  aria-label={G.close}
                  className="grid h-10 w-10 place-items-center rounded-full text-[#5b6075] hover:bg-[#f2ebde]"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
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
                <label className="block">
                  <span className={labelClass}>{G.phoneLabel}</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="05xx xxx xx xx"
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className={labelClass}>{G.messageLabel}</span>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder={G.messagePlaceholder}
                    className={`${inputClass} h-32 resize-none`}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSending || status === 'success'}
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold transition ${
                    status === 'success' ? 'bg-[#3f7d2c] text-white' : 'bg-[#262b44] text-[#faf6ee] hover:brightness-125 disabled:opacity-70'
                  }`}
                >
                  {isSending ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : status === 'success' ? (
                    G.sent
                  ) : (
                    <>
                      {G.send} <Send size={16} />
                    </>
                  )}
                </button>

                {status === 'error' && (
                  <p role="alert" className="rounded-lg border border-[#b3261e]/20 bg-[#b3261e]/5 py-2 text-center text-sm font-medium text-[#b3261e]">
                    {G.error}
                  </p>
                )}
                <p className="text-center text-xs leading-relaxed text-[#5b6075]">{G.contactNote}</p>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Interior>
  );
};
