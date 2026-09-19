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

const shouldPlay = () => enabled && !isProOverlayOpen();

let retryArmed = false;
const play = () => {
  const a = getAudio();
  a.play().then(
    // play() geç çözülebilir; bu arada kapatıldıysa sesi açma, durdur.
    () => (shouldPlay() ? fadeTo(VOLUME) : pause()),
    // Tarayıcı kullanıcı etkileşimi olmadan çalmaya izin vermedi; ilk tıklama/tuşta tekrar dene.
    () => {
      if (retryArmed) return;
      retryArmed = true;
      const retry = () => {
        window.removeEventListener('click', retry);
        window.removeEventListener('keydown', retry);
        retryArmed = false;
        // click (pointerdown değil): müzik düğmesine basıldıysa önce onun kararı işlensin
        window.setTimeout(() => shouldPlay() && play(), 0);
      };
      window.addEventListener('click', retry);
      window.addEventListener('keydown', retry);
    },
  );
};

const pause = () => {
  if (!audio) return;
  if (audio.paused) {
    window.clearInterval(fadeTimer);
    audio.volume = 0;
    return;
  }
  fadeTo(0, () => {
    if (!shouldPlay()) audio?.pause();
  });
};

const sync = () => (shouldPlay() ? play() : pause());

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

// Hayvan sesleri (BigSoundBank, CC0) — müzik düğmesine bağlı: ses kapalıysa çalmaz.
const sfxCache = new Map<string, HTMLAudioElement>();
export const playSfx = (name: string, volume = 0.5) => {
  if (!shouldPlay()) return;
  let base = sfxCache.get(name);
  if (!base) {
    base = new Audio(`/audio/sfx/${name}.mp3`);
    sfxCache.set(name, base);
  }
  const a = base.cloneNode() as HTMLAudioElement;
  a.volume = Math.max(0, Math.min(1, volume));
  void a.play().catch(() => undefined);
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
