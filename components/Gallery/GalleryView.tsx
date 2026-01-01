import React from 'react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { ArrowLeft } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { setCurrentView } = useApp();

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      {/* Üst Bar (Geri Dön Butonu) */}
      <div className="absolute top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 flex justify-between items-center shadow-sm">
         <button 
            onClick={() => {
              sessionStorage.setItem('lastView', 'GALLERY');
              setCurrentView(ViewState.HUB);
            }}
            className="group flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-all text-xs font-bold uppercase tracking-widest shadow-md active:scale-95"
          >
            <ArrowLeft size={16} /> Köye Dön
          </button>
          
          <h1 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">VSCO Galeri</h1>
      </div>

      {/* VSCO Embed */}
      <div className="w-full h-full pt-[60px]">
        <iframe 
          src="https://vscotr.vercel.app/ozgur" 
          className="w-full h-full border-none"
          title="VSCO Gallery"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};
