import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, X } from 'lucide-react';
import { G, GAME_LANG } from '../../i18n/game';
import { requestProOverlay } from '../../professional/overlayBridge';

const isTouch = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border-2 border-[#b86f50] border-b-4 bg-[#f3e5c2] px-1 font-pixel text-[9px] text-[#5d4037]">
    {children}
  </kbd>
);

// Köye ilk girişte çıkan karşılama tabelası: kim olduğum, köyde ne olduğu, nasıl gezileceği.
export const WelcomeCard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const startRef = useRef<HTMLButtonElement>(null);
  const touch = isTouch();

  useEffect(() => {
    startRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#262b44]/55 p-4 pt-20"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', bounce: 0.35, duration: 0.5 }}
        className="relative my-auto w-full max-w-[26rem]"
      >
        <div className="rounded-xl border-[4px] border-[#b86f50] bg-[#e4a672] p-2 shadow-[0_18px_0_-6px_rgba(38,43,68,0.35)]">
          <div className="rounded-lg border-2 border-[#ffce9e] bg-[#e4a672] p-1">
            <div className="relative rounded-md bg-[#ead4aa] px-4 pb-5 pt-5 min-[380px]:px-5 sm:px-6">
              <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />

              <button
                type="button"
                onClick={onClose}
                aria-label={G.welcomeClose}
                className="absolute -right-5 -top-5 z-20 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-[#b86f50] bg-[#e4a672] text-[#5d4037] shadow-[0_3px_0_#b86f50] transition-transform hover:bg-[#ffce9e] active:translate-y-0.5"
              >
                <X size={22} strokeWidth={3} />
              </button>

              {/* Portre + selam */}
              <div className="flex items-center gap-3 min-[380px]:gap-4">
                <img src="/assets/ben-256.png" alt="Özgür Güler" width={84} height={84} className="h-16 w-16 shrink-0 min-[380px]:h-[84px] min-[380px]:w-[84px]" />
                <div className="min-w-0">
                  <h2 id="welcome-title" className="font-pixel text-xl uppercase text-[#5d4037]">
                    {G.welcomeTitle}
                  </h2>
                  <div className="mt-2 inline-block -rotate-2 whitespace-nowrap rounded bg-[#b86f50] px-2 py-1 font-pixel text-[8px] min-[380px]:text-[9px] uppercase tracking-wider text-[#ead4aa]">
                    {G.welcomeName}
                  </div>
                </div>
              </div>

              <p className="mt-4 font-heading text-[14px] min-[380px]:text-[15px] font-semibold leading-snug text-[#5d4037]">{G.welcomeIntro}</p>

              {/* Binalar */}
              <p className="mt-4 font-pixel text-[9px] uppercase tracking-wider text-[#8d5d42]">{G.welcomePlacesTitle}</p>
              <ul className="mt-2 grid grid-cols-3 gap-2">
                {G.welcomePlaces.map((p) => (
                  <li key={p.key} className="flex flex-col items-center rounded-lg border-2 border-[#d9b88c] bg-[#f3e5c2] px-1 pb-2 pt-2 text-center">
                    <img
                      src={`/assets/buildings/${p.key}-${GAME_LANG}.png`}
                      alt=""
                      className="h-12 w-auto [image-rendering:pixelated]"
                    />
                    <span className="mt-1 font-heading text-[13px] font-bold leading-tight text-[#4a2f22]">{p.name}</span>
                    <span className="mt-0.5 hidden font-heading text-[11px] min-[360px]:block leading-tight text-[#8d5d42]">{p.desc}</span>
                  </li>
                ))}
              </ul>

              {/* Nasıl gezilir */}
              <div className="mt-4 space-y-1.5 rounded-lg bg-[#e0c79d]/60 px-3 py-2.5 font-heading text-[13px] leading-snug text-[#5d4037]">
                {touch ? (
                  <p>{G.welcomeMoveTouch}</p>
                ) : (
                  <p className="flex flex-wrap items-center gap-1">
                    <Key>W</Key>
                    <Key>A</Key>
                    <Key>S</Key>
                    <Key>D</Key>
                    <span className="mx-0.5 text-[#8d5d42]">/</span>
                    <Key>↑</Key>
                    <Key>←</Key>
                    <Key>↓</Key>
                    <Key>→</Key>
                    <span className="ml-1">{G.welcomeMoveKeys}</span>
                  </p>
                )}
                <p>{G.welcomeEnter}</p>
              </div>

              <button ref={startRef} type="button" onClick={onClose} className="group relative mt-5 w-full outline-none">
                <span className="absolute inset-0 translate-y-1.5 rounded-xl bg-[#b86f50]" />
                <span className="relative flex items-center justify-center gap-2 rounded-xl border-2 border-[#b86f50] bg-[#e4a672] py-3 font-pixel text-sm uppercase tracking-wider text-[#4a2f22] shadow-[inset_0_2px_0_#ffce9e] transition-transform group-hover:bg-[#ebb383] group-focus-visible:ring-4 group-focus-visible:ring-[#4a2f22]/40 group-active:translate-y-1.5">
                  {G.welcomeButton}
                </span>
              </button>

              <p className="mt-4 text-center font-heading text-[13px] text-[#8d5d42]">
                {G.welcomeProHint}{' '}
                <button
                  type="button"
                  onClick={requestProOverlay}
                  className="inline-flex items-center gap-0.5 font-bold text-[#4a2f22] underline decoration-[#b86f50] decoration-2 underline-offset-2 hover:text-[#b86f50]"
                >
                  {G.welcomeProLink}
                  <ArrowUpRight size={14} strokeWidth={2.5} aria-hidden="true" />
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
