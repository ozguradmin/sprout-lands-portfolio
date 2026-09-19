import { useSyncExternalStore } from 'react';
import { PRO_OVERLAY_EVENT, isProOverlayOpen } from '../../professional/overlayBridge';

// Köyün sesi: arka plan müziği + hayvan sesleri, tek düğmeyle. Varsayılan kapalı; tercih tarayıcıda hatırlanır,
// profesyonel katman açıkken susar.
// Müzik: "Good Morning" (Cakeflaps, CC0) — https://opengameart.org/content/good-morning
// Hayvanlar: BigSoundBank (CC0) — https://bigsoundbank.com
//
// Web Audio kullanılır: iOS Safari'de <audio>.volume salt okunur (kısarak durdurma hiç bitmiyordu) ve
// her yeni <audio> ancak dokunuşla çalabiliyor (oyun döngüsünden tetiklenen hayvan sesleri engelleniyordu).
// AudioContext bir kez dokunuşla açılınca ikisi de çalışır.
const SRC = '/audio/good-morning.mp3';
const KEY = 'village-music';
const MUSIC_VOLUME = 0.35;
const FADE_S = 0.6;
const SFX = ['moo-1', 'moo-2', 'moo-3', 'cluck-1', 'cluck-2'];

let enabled = false;
const listeners = new Set<() => void>();

try {
  enabled = localStorage.getItem(KEY) === 'on';
} catch {
  /* gizli pencere vb. */
}

const shouldPlay = () => enabled && !isProOverlayOpen();

// ---------------------------------------------------------------- Web Audio
let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let audio: HTMLAudioElement | null = null;
let pauseTimer: number | undefined;
const buffers = new Map<string, AudioBuffer>();

const getCtx = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  // iOS: sessiz anahtarı açıkken de çalsın (<audio> öğesinin eski davranışıyla aynı)
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
  if (session) session.type = 'playback';
  ctx = new AC();
  return ctx;
};

const loadSfx = () => {
  const c = getCtx();
  if (!c) return;
  for (const name of SFX) {
    if (buffers.has(name)) continue;
    buffers.set(name, null as unknown as AudioBuffer); // yükleniyor; ikinci kez istek atma
    fetch(`/audio/sfx/${name}.mp3`)
      .then((r) => r.arrayBuffer())
      .then((data) => c.decodeAudioData(data))
      .then((buf) => buffers.set(name, buf))
      .catch(() => buffers.delete(name));
  }
};

/** Dokunuş/tıklama içinde çağrılmalı: ses bağlamını açar (iOS'ta başka yolu yok). */
const unlock = () => {
  const c = getCtx();
  if (c && c.state !== 'running') void c.resume().catch(() => undefined);
  loadSfx();
};

const getAudio = () => {
  if (audio) return audio;
  audio = new Audio(SRC);
  audio.loop = true;
  audio.preload = 'none';
  const c = getCtx();
  if (c) {
    musicGain = c.createGain();
    musicGain.gain.value = 0;
    c.createMediaElementSource(audio).connect(musicGain).connect(c.destination);
  } else {
    audio.volume = MUSIC_VOLUME;
  }
  return audio;
};

const rampTo = (target: number) => {
  if (!ctx || !musicGain) return;
  const g = musicGain.gain;
  const now = ctx.currentTime;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now);
  g.linearRampToValueAtTime(target, now + FADE_S);
};

let retryArmed = false;
const play = () => {
  window.clearTimeout(pauseTimer);
  const a = getAudio();
  rampTo(MUSIC_VOLUME);
  a.play().then(
    () => {
      if (!shouldPlay()) pause(); // play() geç çözüldü, bu arada kapatılmış
    },
    // Tarayıcı etkileşimsiz çalmaya izin vermedi: ilk tıklamada (düğmenin kararından sonra) tekrar dene.
    () => {
      if (retryArmed) return;
      retryArmed = true;
      const retry = () => {
        window.removeEventListener('click', retry);
        window.removeEventListener('keydown', retry);
        retryArmed = false;
        // window'daki click, düğmenin (React kökündeki) işleyicisinden sonra gelir; aynı dokunuş içinde kalmak
        // için (iOS) setTimeout kullanılmaz.
        unlock();
        if (shouldPlay()) play();
      };
      window.addEventListener('click', retry);
      window.addEventListener('keydown', retry);
    },
  );
};

const pause = () => {
  if (!audio) return;
  window.clearTimeout(pauseTimer);
  if (!musicGain) {
    audio.pause();
    return;
  }
  rampTo(0);
  pauseTimer = window.setTimeout(() => {
    if (!shouldPlay()) audio?.pause();
  }, FADE_S * 1000 + 50);
};

const sync = () => (shouldPlay() ? play() : pause());

// ---------------------------------------------------------------- dışa açık
export const setMusic = (on: boolean) => {
  enabled = on;
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    /* yok say */
  }
  if (on) unlock(); // düğmeye basış bir dokunuş: bağlamı burada aç
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

/** Hayvan sesleri; ses kapalıysa ya da bağlam henüz açılmadıysa sessizce geçer. */
export const playSfx = (name: string, volume = 0.5) => {
  if (!shouldPlay() || !ctx || ctx.state !== 'running') return;
  const buf = buffers.get(name);
  if (!buf) {
    loadSfx();
    return;
  }
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.buffer = buf;
  src.connect(gain).connect(ctx.destination);
  src.start();
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
