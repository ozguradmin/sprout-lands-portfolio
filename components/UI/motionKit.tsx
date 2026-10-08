import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { GAME_LANG } from '../../i18n/game';

// Bina içlerinin ortak hareket dili: tek bir giriş jesti ve tek bir tempo.
// Her şey aynı eğriyle, 70 ms arayla sahneye girer; hareketi kapatan kullanıcıda hiçbir şey gecikmez.
export const TEMPO = 0.07;
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

type RevealProps = HTMLMotionProps<'div'> & {
  /** Sahne sırası: gecikme slot * TEMPO olur. */
  slot?: number;
  /** Ek gecikme (sn). */
  delay?: number;
  /** Panel içinde olduğu gibi görünür olmayı beklemeden oynat. */
  immediate?: boolean;
  as?: 'div' | 'section' | 'li' | 'ul' | 'p' | 'h2' | 'header' | 'article';
};

export const Reveal: React.FC<RevealProps> = ({ slot = 0, delay = 0, immediate, as = 'div', children, ...rest }) => {
  const still = useReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  if (still) {
    // Hareket kapalıyken sade bir etiket basılır; role/aria/id gibi her şey korunur.
    const Plain = as as 'div';
    const { initial, animate, whileInView, viewport, transition, exit, whileHover, whileTap, layout, ...dom } = rest as Record<string, unknown>;
    void initial, animate, whileInView, viewport, transition, exit, whileHover, whileTap, layout;
    return <Plain {...(dom as React.HTMLAttributes<HTMLElement>)}>{children}</Plain>;
  }
  return (
    <Tag
      initial={{ opacity: 0, y: 14 }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '0px 0px -10% 0px' } })}
      transition={{ duration: 0.55, ease: EASE_OUT, delay: slot * TEMPO + delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
};

// Sosyal medyada iki dilde de aynı okunan kısaltma: 250K, 1M. (Intl'in TR kısaltması "250 B / 1 Mn" veriyor.)
const nf = (n: number, digits = 0) => new Intl.NumberFormat(GAME_LANG === 'en' ? 'en' : 'tr', { maximumFractionDigits: digits }).format(n);
const compact = (n: number) => {
  if (n >= 1_000_000) return `${nf(n / 1_000_000, n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 10_000) return `${nf(Math.round(n / 1000))}K`;
  return nf(n);
};

/** Görünür olunca 0'dan hedefe sayar. Hareket kapalıysa doğrudan hedefi yazar. */
export const CountUp: React.FC<{ to: number; suffix?: string; className?: string; duration?: number }> = ({
  to,
  suffix = '+',
  className,
  duration = 1.05,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -12% 0px' });
  const still = useReducedMotion();
  const [value, setValue] = useState(still ? to : 0);

  useEffect(() => {
    if (!inView || still) return;
    const controls = animate(0, to, {
      duration,
      ease: [0, 0, 0.2, 1],
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, still, to, duration]);

  const label = `${compact(to)}${suffix}`;
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true" className="tabular-nums">
        {compact(Math.round(value))}
        {suffix}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
};

/** Mardin'deki saat; köyün "burada biri var" detayı. */
export const useLocalClock = () => {
  const [time, setTime] = useState('');
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(GAME_LANG === 'en' ? 'en-GB' : 'tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
};

/** Kartların ortak dokunma hissi: hafif kalkar, basınca geri oturur. */
export const CARD_BASE =
  'group relative rounded-2xl border border-[#e3d6bf] bg-[#fffdf9] shadow-[0_1px_2px_rgba(35,40,64,0.05),0_8px_22px_rgba(35,40,64,0.05)] transition-[transform,translate,scale,box-shadow,border-color] duration-200 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1 hover:border-[#b86f50]/60 hover:shadow-[0_14px_32px_rgba(35,40,64,0.12)] active:translate-y-0 active:scale-[0.995] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f6fd6]';

/** Bölüm başlığı: piksel fontta numara, yanında çizilen dalga. */
export const Eyebrow: React.FC<{ n: string; children: React.ReactNode; className?: string }> = ({ n, children, className = '' }) => (
  <p className={`flex items-center gap-2 font-pixel text-[9px] uppercase tracking-[0.18em] text-[#8d5d42] ${className}`}>
    <span className="text-[#9a5438]">{n}</span>
    <span className="text-[#b86f50]">/</span>
    <span>{children}</span>
  </p>
);
