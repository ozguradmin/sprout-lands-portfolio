import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { G } from '../../i18n/game';

// Galerinin içeriği VSCO sayfasından geliyor; yalnız üst çubuk köyün diğer binalarıyla aynı dilde.
export const GalleryView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f6efe2]">
      <div className="absolute inset-x-0 top-0 z-50">
        <div className="h-1.5 bg-[linear-gradient(90deg,#e4a672_50%,#b86f50_50%)] bg-[length:12px_6px]" aria-hidden="true" />
        <div className="flex h-16 items-center gap-3 border-b border-[#e3d6bf] bg-[#f6efe2]/92 px-5 backdrop-blur md:px-8">
          <button
            type="button"
            onClick={() => {
              sessionStorage.setItem('lastView', 'GALLERY');
              setCurrentView(ViewState.HUB);
            }}
            className="group relative"
          >
            <span className="absolute inset-0 translate-y-[3px] rounded-lg bg-[#b86f50]" />
            <span className="relative flex h-10 items-center gap-2 rounded-lg border-2 border-[#b86f50] bg-[#e4a672] px-3 font-pixel text-[10px] text-[#4a2f22] transition-transform group-hover:brightness-105 group-active:translate-y-[3px]">
              <ArrowLeft size={14} strokeWidth={3} aria-hidden="true" />
              {G.backToVillage}
            </span>
          </button>
          <h1 className="ml-auto font-pixel text-[9px] uppercase tracking-[0.16em] text-[#8d5d42]">{G.galleryTitle}</h1>
        </div>
      </div>

      {/* VSCO sayfası */}
      <div className="h-full w-full pt-[70px]">
        <iframe
          src="https://vscotr.vercel.app/ozgur"
          className="h-full w-full border-none"
          title="VSCO"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
