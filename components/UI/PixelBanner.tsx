import React from 'react';
// Stiller index.css ve professional.css içinden @import ile geliyor (önceden render edilen
// sayfada ayrı bir CSS dosyası bağlanmıyor).

/**
 * Sayfanın üstündeki ince piksel manzara: köyün tepeleri, bulutları ve çimeni;
 * üzerinden karakter geçer, tavuk peşinden gelir. Tamamen süs olduğu için ekran
 * okuyuculara kapalı; hareket azaltma tercihinde her şey durur.
 */
export const PixelBanner: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`pixel-banner${className ? ` ${className}` : ''}`} aria-hidden="true">
    <i className="pixel-banner-hills" />
    <i className="pixel-banner-clouds" />
    <i className="pixel-banner-ground" />
    <div className="pixel-banner-walker" />
    <div className="pixel-banner-chick" />
  </div>
);
