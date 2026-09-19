import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CLASSIC_LOADER, G } from '../../i18n/game';
import { LoadingScreenClassic } from './LoadingScreenClassic';

// Yükleme ekranı: köyün suyu üstünde ahşap bir tabela. Çubuk gerçek yüklemeyi gösterir,
// inek çubuğun üstünde ilerlemeyle birlikte yürür. Eski sürüm: ?yukleme=eski (LoadingScreenClassic).
export const LoadingScreen: React.FC = () => {
  const { loadingProgress, loadingStatus } = useApp();
  const tip = useMemo(() => G.loadingTips[Math.floor(Math.random() * G.loadingTips.length)], []);

  if (CLASSIC_LOADER) return <LoadingScreenClassic />;

  const progress = Math.max(4, Math.min(100, loadingProgress));

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden bg-[#9bd4c3] font-pixel">
      <style>{`
        @keyframes loader-water {
          0% { background-image: url('/assets/village/water-0.png'); }
          25% { background-image: url('/assets/village/water-1.png'); }
          50% { background-image: url('/assets/village/water-2.png'); }
          75% { background-image: url('/assets/village/water-3.png'); }
        }
        @keyframes loader-cow-walk { from { background-position: 0 -48px; } to { background-position: -96px -48px; } }
        @keyframes loader-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .loader-water {
          background-image: url('/assets/village/water-0.png');
          background-size: 48px 48px;
          image-rendering: pixelated;
          animation: loader-water 1.1s steps(1) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .loader-water, .loader-cow, .loader-raft { animation: none !important; }
        }
      `}</style>
      <div className="loader-water absolute inset-0" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="loader-raft relative z-10 w-full max-w-sm p-4"
        style={{ animation: 'loader-bob 3.2s ease-in-out infinite' }}
      >
        {/* Ahşap tabela (eski sürümle aynı dil) */}
        <div className="rounded-xl border-[4px] border-[#b86f50] bg-[#e4a672] p-2 shadow-[0_18px_0_-6px_rgba(38,43,68,0.25)]">
          <div className="rounded-lg border-2 border-[#ffce9e] bg-[#e4a672] p-1">
            <div className="relative flex flex-col items-center overflow-hidden rounded-md bg-[#ead4aa] px-7 pb-7 pt-6">
              <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />
              <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[#b86f50] opacity-50" />

              <img src="/assets/ben-256.png" alt="" width={88} height={88} className="mb-5 h-[88px] w-[88px] drop-shadow-[0_6px_0_rgba(184,111,80,0.35)]" />

              <h2 className="mb-2 text-2xl font-extrabold uppercase tracking-wide text-[#5d4037]">{G.loadingTitle}</h2>
              <div className="mb-7 inline-block -rotate-2 rounded bg-[#b86f50] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#ead4aa]">
                {G.loadingBadge}
              </div>

              <div className="w-full">
                <div className="mb-1 flex justify-between px-1 text-[8px] font-bold uppercase tracking-wider text-[#8d5d42]">
                  <span>{G.loadingBar}</span>
                  <span>{Math.round(loadingProgress)}%</span>
                </div>
                {/* İnek, çubuğun üstünde ilerlemeyle yürür */}
                <div className="relative h-10">
                  <div
                    className="loader-cow absolute -bottom-[7px] h-12 w-12 transition-[left] duration-300 ease-out"
                    style={{
                      left: `calc(${progress}% - 44px)`,
                      backgroundImage: 'url("/assets/sprout-lands/Characters/Free Cow Sprites.png")',
                      backgroundSize: '144px 96px',
                      imageRendering: 'pixelated',
                      animation: 'loader-cow-walk 0.5s steps(2) infinite',
                      transform: 'scaleX(1)',
                      transformOrigin: 'bottom center',
                    }}
                    aria-hidden="true"
                  />
                </div>
                <div
                  className="h-6 rounded-full border-2 border-[#b86f50] bg-[#c59c7a] p-1 shadow-inner"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(loadingProgress)}
                  aria-label={G.loadingBar}
                >
                  <div
                    className="relative h-full overflow-hidden rounded-full border-t border-white/30 bg-[#7ec45b] transition-[width] duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-x-0 top-0 h-[40%] bg-white/20" />
                  </div>
                </div>
                <p className="mt-2 h-4 text-center text-[8px] text-[#8d5d42]/80" aria-live="polite">
                  {loadingStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <p className="relative z-10 mt-2 max-w-xs px-4 text-center font-sans text-[13px] font-semibold leading-snug text-[#2f5d58]">{tip}</p>

      {/* Sprout Lands lisansı kaynak belirtmeyi istiyor */}
      <a
        href="https://cupnooble.itch.io/sprout-lands-asset-pack"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 left-0 right-0 z-10 text-center font-sans text-[11px] text-[#2f5d58]/70 hover:text-[#2f5d58]"
      >
        {G.credit}
      </a>
    </div>
  );
};
