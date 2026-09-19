import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { G } from '../../i18n/game';

// Binaların içi: profesyonel görünümle aynı kağıt/ahşap paleti, üstte köye dönüş tabelası.
export const Interior: React.FC<{
  title: string;
  subtitle?: string;
  onBack: () => void;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, onBack, aside, children }) => (
  <div className="h-full w-full overflow-y-auto bg-[#f6efe2] text-[#262b44] font-sans selection:bg-[#e4a672]/60">
    <div className="h-1.5 bg-[linear-gradient(90deg,#e4a672_50%,#b86f50_50%)] bg-[length:12px_6px]" aria-hidden="true" />
    <header className="sticky top-0 z-20 border-b border-[#e3d6bf] bg-[#f6efe2]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-5 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="group relative"
        >
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
      <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-[16px] leading-relaxed text-[#5b6075]">{subtitle}</p>}
      {children}
    </main>
  </div>
);

/** Profesyonel görünümü oyunun üstündeki katmanda açar (App popstate'i dinliyor). */
export const openProfessional = (path: string) => {
  window.history.pushState({ pro: true }, '', path);
  window.dispatchEvent(new PopStateEvent('popstate', { state: { pro: true } }));
};
