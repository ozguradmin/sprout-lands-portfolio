import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { G } from '../../i18n/game';
import { Marked } from './marks';
import { PixelBanner } from './PixelBanner';
import { Reveal } from './motionKit';

// Binaların içi: profesyonel görünümle aynı kağıt/ahşap paleti, üstte köye dönüş tabelası.
// Başlık bloğu üç parçadan oluşur: numaralı künye, altı çizili başlık, kenara düşülmüş not.
export const Interior: React.FC<{
  title: string;
  subtitle?: string;
  /** Başlığın son kelimesinin altı elle çizilir. */
  markWord?: string;
  eyebrow?: React.ReactNode;
  note?: React.ReactNode;
  onBack: () => void;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, markWord, eyebrow, note, onBack, aside, children }) => {
  const head = markWord && title.endsWith(markWord) ? title.slice(0, -markWord.length) : title;
  return (
    <div className="interior-paper h-full w-full overflow-y-auto bg-[#f6efe2] text-[#262b44] font-sans selection:bg-[#e4a672]/60">
      <PixelBanner className="border-b-[3px] border-[#b86f50]" />
      <header className="sticky top-0 z-40 border-b border-[#e3d6bf] bg-[#f6efe2]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-5 md:px-8">
          <button type="button" onClick={onBack} className="group relative">
            <span className="absolute inset-0 translate-y-[3px] rounded-lg bg-[#b86f50]" />
            <span className="relative flex h-10 items-center gap-2 rounded-lg border-2 border-[#b86f50] bg-[#e4a672] px-3 font-pixel text-[10px] text-[#4a2f22] transition-transform group-hover:brightness-105 group-active:translate-y-[3px]">
              <ArrowLeft size={14} strokeWidth={3} aria-hidden="true" />
              {G.backToVillage}
            </span>
          </button>
          <div className="ml-auto">{aside}</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8 md:pt-12">
        <div className="relative">
          {eyebrow && (
            <Reveal slot={0} immediate>
              {eyebrow}
            </Reveal>
          )}
          <Reveal slot={1} immediate>
            <h1 className="mt-2 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight md:text-5xl">
              {head}
              {markWord && <Marked delay={0.5}>{markWord}</Marked>}
            </h1>
          </Reveal>
          {subtitle && (
            <Reveal slot={2} immediate>
              <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-[#5b6075]">{subtitle}</p>
            </Reveal>
          )}
          {note}
        </div>
        {children}
      </main>

      {/* Sayfanın sonu: aşağı kadar inen biri köye dönmek için yukarı kaydırmasın */}
      <footer className="border-t border-[#e3d6bf] bg-[#f1e7d4]">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 py-10 text-center md:px-8">
          <span className="font-hand text-[26px] leading-none text-[#9a5438] [rotate:-3deg]">{G.footerSign} — Özgür</span>
          <button type="button" onClick={onBack} className="group relative">
            <span className="absolute inset-0 translate-y-[3px] rounded-xl bg-[#b86f50]" />
            <span className="relative flex h-12 items-center gap-2 rounded-xl border-2 border-[#b86f50] bg-[#e4a672] px-5 font-pixel text-[10px] text-[#4a2f22] transition-transform group-hover:brightness-105 group-active:translate-y-[3px]">
              <ArrowLeft size={14} strokeWidth={3} aria-hidden="true" />
              {G.backToVillage}
            </span>
          </button>
          <p className="font-pixel text-[8px] uppercase leading-relaxed tracking-[0.14em] text-[#8d5d42]/75">
            © {new Date().getFullYear()} Özgür Güler · {G.credit}
          </p>
        </div>
      </footer>
      <PixelBanner className="pixel-banner-alt border-t-[3px] border-[#b86f50]" />
    </div>
  );
};

/** Profesyonel görünümü oyunun üstündeki katmanda açar (App popstate'i dinliyor). */
export const openProfessional = (path: string) => {
  window.history.pushState({ pro: true }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: { pro: true } }));
};
