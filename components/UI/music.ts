import { useSyncExternalStore } from 'react';
import { PRO_OVERLAY_EVENT, isProOverlayOpen } from '../../professional/overlayBridge';

// Arka plan müziği: "Good Morning" (Cakeflaps, CC0) — https://opengameart.org/content/good-morning
// Varsayılan kapalı; tercih tarayıcıda hatırlanır. Profesyonel katman açıkken susar.
const SRC = '/audio/good-morning.mp3';
const KEY = 'village-music';
const VOLUME = 0.35;

let audio: HTMLAudioElement | null = null;
let fadeTimer: number | undefined;
let enabled = false;
const listeners = new Set<() => void>();

try {
  enabled = localStorage.getItem(KEY) === 'on';
} catch {
  /* gizli pencere vb. */
}

const getAudio = () => {
  if (!audio) {
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'none';
    audio.volume = 0;
  }
  return audio;
};

const fadeTo = (target: number, onDone?: () => void) => {
  const a = getAudio();
  window.clearInterval(fadeTimer);
  fadeTimer = window.setInterval(() => {
    const next = a.volume + Math.sign(target - a.volume) * 0.035;
    if (Math.abs(target - a.volume) <= 0.035) {
      a.volume = target;
      window.clearInterval(fadeTimer);
      onDone?.();
    } else {
      a.volume = Math.min(1, Math.max(0, next));
    }
  }, 40);
};

const play = () => {
  const a = getAudio();
  a.play().then(
    () => fadeTo(VOLUME),
    // Tarayıcı kullanıcı etkileşimi olmadan çalmaya izin vermedi; ilk tıklama/tuşta tekrar dene.
    () => {
      const retry = () => {
        window.removeEventListener('pointerdown', retry);
        window.removeEventListener('keydown', retry);
        if (enabled && !isProOverlayOpen()) play();
      };
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
    },
  );
};

const pause = () => {
  if (!audio || audio.paused) return;
  fadeTo(0, () => audio?.pause());
};

const sync = () => (enabled && !isProOverlayOpen() ? play() : pause());

export const setMusic = (on: boolean) => {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* yok say */
  }
  sync();
  listeners.forEach((l) => l());
};

let started = false;
/** Köy açıldığında bir kez çağrılır; kayıtlı tercih "açık"sa müziği başlatır. */
export const startMusicIfEnabled = () => {
  if (started) return;
  started = true;
  window.addEventListener(PRO_OVERLAY_EVENT, sync);
  if (enabled) sync();
};

export const useMusicEnabled = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => enabled,
    () => false,
  );
