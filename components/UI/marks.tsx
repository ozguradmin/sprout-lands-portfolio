import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

// Elle çizilmiş gibi duran işaretler: alt çizgi, daire, dalga, ok, tik, yıldız, damga.
// Hepsi tek bir ilkeden çıkar — çizgi görünür olunca kendini çizer (pathLength 0 → 1).
// Renk currentColor'dan gelir; hareketi kapatan kullanıcıda çizgi hazır hâlde durur.

const DRAW_EASE = [0.65, 0, 0.35, 1] as const;

export type MarkKind = 'underline' | 'circle' | 'squiggle' | 'arrow' | 'tick' | 'sparkle' | 'stamp';

type Shape = { viewBox: string; paths: { d: string; w?: number; at?: number }[]; dur: number };

// Yollar elle yazıldı; bilerek hafif eğri ve kapanışları taşkın (makineyle çizilmiş gibi durmasın).
const SHAPES: Record<MarkKind, Shape> = {
  underline: {
    viewBox: '0 0 200 18',
    dur: 0.55,
    paths: [{ d: 'M5 11 C 54 4, 118 3, 196 8' }, { d: 'M16 16 C 68 11, 134 10, 188 13', at: 0.22 }],
  },
  circle: {
    viewBox: '0 0 220 84',
    dur: 0.9,
    paths: [{ d: 'M168 13 C 118 2, 48 7, 21 27 C 2 41, 17 66, 77 76 C 141 86, 207 67, 202 39 C 198 17, 150 9, 101 12', w: 2.5 }],
  },
  squiggle: {
    viewBox: '0 0 120 14',
    dur: 0.7,
    paths: [{ d: 'M3 8 Q 11 1, 19 8 T 35 8 T 51 8 T 67 8 T 83 8 T 99 8 T 115 7', w: 2.5 }],
  },
  arrow: {
    viewBox: '0 0 110 76',
    dur: 0.6,
    paths: [
      { d: 'M7 11 C 44 5, 84 21, 97 60' },
      { d: 'M82 50 L99 66 L101 44', at: 0.45 },
    ],
  },
  tick: {
    viewBox: '0 0 20 20',
    dur: 0.3,
    paths: [{ d: 'M3 11 L8 16 L17 4', w: 2.6 }],
  },
  sparkle: {
    viewBox: '0 0 40 40',
    dur: 0.24,
    paths: [
      { d: 'M20 4 L20 15', w: 2.4 },
      { d: 'M33 13 L25 20', w: 2.4, at: 0.12 },
      { d: 'M7 13 L15 20', w: 2.4, at: 0.24 },
    ],
  },
  stamp: {
    viewBox: '0 0 80 80',
    dur: 0.55,
    paths: [
      { d: 'M62 12 C 44 3, 18 9, 10 28 C 2 47, 14 70, 38 73 C 62 76, 76 58, 73 38 C 71 22, 58 11, 44 9', w: 3 },
      { d: 'M26 40 L36 51 L56 27', w: 3.4, at: 0.4 },
    ],
  },
};

export interface MarkProps {
  kind: MarkKind;
  className?: string;
  /** Çizim gecikmesi (sn). */
  delay?: number;
  strokeWidth?: number;
  /** true: görünür olmayı beklemeden çizer (açılan panel içinde kullanışlı). */
  immediate?: boolean;
  /** Kelimenin arkasına yayılan işaretlerde (alt çizgi, daire) oranı koru deme. */
  stretch?: boolean;
}

export const Mark: React.FC<MarkProps> = ({ kind, className, delay = 0, strokeWidth, immediate, stretch }) => {
  const still = useReducedMotion();
  const shape = SHAPES[kind];
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg
      className={className}
      viewBox={shape.viewBox}
      preserveAspectRatio={stretch ? 'none' : 'xMidYMid meet'}
      aria-hidden="true"
      focusable="false"
    >
      {shape.paths.map((p) =>
        still ? (
          <path key={p.d} d={p.d} strokeWidth={strokeWidth ?? p.w ?? 3} {...common} />
        ) : (
          <motion.path
            key={p.d}
            d={p.d}
            strokeWidth={strokeWidth ?? p.w ?? 3}
            {...common}
            initial={{ pathLength: 0, opacity: 0 }}
            {...(immediate
              ? { animate: { pathLength: 1, opacity: 1 } }
              : { whileInView: { pathLength: 1, opacity: 1 }, viewport: { once: true, margin: '0px 0px -8% 0px' } })}
            transition={{
              pathLength: { duration: shape.dur, delay: delay + (p.at ?? 0), ease: DRAW_EASE },
              opacity: { duration: 0.01, delay: delay + (p.at ?? 0) },
            }}
          />
        ),
      )}
    </svg>
  );
};

/** Bir kelimenin altını ya da etrafını işaretler: <Marked kind="underline">kelime</Marked> */
export const Marked: React.FC<{ kind?: 'underline' | 'circle'; delay?: number; className?: string; children: React.ReactNode }> = ({
  kind = 'underline',
  delay = 0.25,
  className = 'text-[#b86f50]',
  children,
}) => (
  <span className="relative inline-block whitespace-nowrap">
    <span className="relative z-10">{children}</span>
    <Mark
      kind={kind}
      delay={delay}
      stretch
      className={`pointer-events-none absolute ${
        kind === 'underline' ? '-bottom-[0.22em] left-[-2%] h-[0.38em] w-[104%]' : 'left-[-10%] top-[-22%] h-[144%] w-[120%]'
      } ${className}`}
    />
  </span>
);

/** Fosforlu kalem izi: kelimenin arkasına soldan sağa çekilir. */
export const Highlight: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 0.3, children }) => {
  const still = useReducedMotion();
  return (
    <span className="relative inline-block whitespace-nowrap">
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-[-0.14em] bottom-[0.02em] top-[0.12em] -z-0 origin-left rounded-[2px] bg-[#f6d98a]/70"
        initial={still ? false : { scaleX: 0 }}
        whileInView={still ? undefined : { scaleX: 1 }}
        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
        transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      <span className="relative">{children}</span>
    </span>
  );
};
