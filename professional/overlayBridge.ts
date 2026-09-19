// Oyun (HubView) ile profesyonel katman arasındaki küçük köprü.
// Katman açıkken oyunun klavye yakalamasını kapatıp döngüsünü uyutmak için kullanılır.
export const PRO_OVERLAY_EVENT = 'pro-overlay-change';

let open = false;

export const isProOverlayOpen = () => open;

export const setProOverlayOpen = (value: boolean) => {
  if (open === value) return;
  open = value;
  window.dispatchEvent(new CustomEvent<boolean>(PRO_OVERLAY_EVENT, { detail: value }));
};

export const isProPath = (pathname: string) => pathname === '/professional' || pathname.startsWith('/professional/');

// Köyün içinden (ör. karşılama penceresi) profesyonel katmanı açma isteği; App dinler.
export const PRO_OVERLAY_REQUEST = 'pro-overlay-request';
export const requestProOverlay = () => window.dispatchEvent(new Event(PRO_OVERLAY_REQUEST));
