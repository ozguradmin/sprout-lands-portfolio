import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { G } from '../../i18n/game';
import { Marked } from './marks';
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
      <div className="h-1.5 bg-[linear-gradient(90deg,#e4a672_50%,#b86f50_50%)] bg-[length:12px_6px]" aria-hidden="true" />
      <header className="sticky top-0 z-20 border-b border-[#e3d6bf] bg-[#f6efe2]/90 backdrop-blur">
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
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-8 md:px-8 md:pt-12">
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
    </div>
  );
};

/** Profesyonel görünümü oyunun üstündeki katmanda açar (App popstate'i dinliyor). */
export const openProfessional = (path: string) => {
  window.history.pushState({ pro: true }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: { pro: true } }));
};
