import React, { useEffect, useRef } from 'react';
import { ProfessionalPage } from './ProfessionalPage';
import { metaFor, parseProPath } from './data';

/** Oyunun üstünde tam ekran açılan profesyonel görünüm. Oyun arkada duraklatılmış olarak bekler. */
const ProfessionalOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previousTitle = document.title;
    const { lang, slug } = parseProPath(window.location.pathname);
    document.title = metaFor(lang, slug).title;
    const previousFocus = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.title = previousTitle;
      previousFocus?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <div ref={ref} className="pro-overlay" role="dialog" aria-modal="true" aria-label="Profesyonel portfolyo" tabIndex={-1}>
      <ProfessionalPage mode="overlay" path={window.location.pathname} onBackToVillage={onClose} />
    </div>
  );
};

export default ProfessionalOverlay;
