import React from 'react';
import { Briefcase, Volume2, VolumeX } from 'lucide-react';
import { setMusic, useMusicEnabled } from './music';
import { G, GAME_LANG, professionalPath, villagePath } from '../../i18n/game';

const prefetch = () => {
  void import('../../professional/ProfessionalOverlay');
};

const woodBack = 'absolute inset-0 rounded-xl bg-[#b86f50] translate-y-1';
const woodFace =
  'relative flex items-center gap-2 rounded-xl border-2 border-[#b86f50] bg-[#e4a672] text-[#4a2f22] font-heading font-bold leading-none shadow-lg transition-transform group-hover:brightness-105 group-active:translate-y-1';

// Köyün ahşap tabelalarıyla aynı paletten, okunaklı yazıyla sabit köşe düğmeleri.
const MusicButton: React.FC = () => {
  const on = useMusicEnabled();
  const label = on ? G.musicOn : G.musicOff;
  return (
    <button type="button" onClick={() => setMusic(!on)} className="relative group" aria-label={label} aria-pressed={on} title={label}>
      <span className={woodBack} />
      <span className={`${woodFace} p-2 md:p-2.5`}>
        {on ? <Volume2 size={17} strokeWidth={2.5} aria-hidden="true" /> : <VolumeX size={17} strokeWidth={2.5} aria-hidden="true" className="opacity-70" />}
      </span>
    </button>
  );
};

export const ProfessionalButton: React.FC<{ onOpen: () => void }> = ({ onOpen }) => (
  <div className="fixed top-3 right-3 md:top-5 md:right-5 z-[10000] flex items-center gap-2 select-none">
    <MusicButton />
    {/* İki dil yan yana; seçili olan koyu. Düğmeye basınca diğer dile geçilir. */}
    <a href={villagePath(GAME_LANG === 'en' ? 'tr' : 'en')} lang={GAME_LANG === 'en' ? 'tr' : 'en'} className="relative group" aria-label={G.langSwitchAria}>
      <span className={woodBack} />
      <span className={`${woodFace} gap-0.5 p-1 text-xs md:text-[13px]`}>
        {(['tr', 'en'] as const).map((l) => (
          <span
            key={l}
            aria-hidden="true"
            className={`rounded-md px-1.5 py-1 md:py-1.5 ${l === GAME_LANG ? 'bg-[#4a2f22] text-[#f3e5c2]' : 'text-[#4a2f22]/70'}`}
          >
            {l.toUpperCase()}
          </span>
        ))}
      </span>
    </a>
    <a
      href={professionalPath(GAME_LANG)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen();
      }}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      onTouchStart={prefetch}
      className="relative group"
      aria-label={G.proButtonAria}
    >
      <span className={woodBack} />
      <span className={`${woodFace} px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-[15px]`}>
        <Briefcase size={17} strokeWidth={2.5} aria-hidden="true" />
        <span className="hidden sm:inline">{G.proButton}</span>
        <span className="sm:hidden">{G.proButtonShort}</span>
      </span>
    </a>
  </div>
);
