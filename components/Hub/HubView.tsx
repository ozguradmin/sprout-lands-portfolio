import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { PRO_OVERLAY_EVENT, isProOverlayOpen } from '../../professional/overlayBridge';

import { G } from '../../i18n/game';
import { WelcomeCard } from './WelcomeCard';
// Oturum süresince (refresh hariç) hoşgeldin mesajını takip etmek için modül dışı değişken
let hasSeenSession = false;

// Dokunmatik joystick: ekranın alt yarısında parmağın değdiği yerde belirir.
// Hareket sırasında React yeniden çizmez; topuz doğrudan stil ile taşınır, değer sahneye ref ile gider.
const JOY_RADIUS = 50;
const VirtualJoystick: React.FC<{ onMove: (x: number, y: number) => void }> = ({ onMove }) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0 });
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  const setVisual = (active: boolean, x?: number, y?: number) => {
    const base = baseRef.current;
    const knob = knobRef.current;
    if (!base || !knob) return;
    if (active && x !== undefined && y !== undefined) {
      base.style.left = `${x - 64}px`;
      base.style.top = `${y - 64}px`;
    } else {
      base.style.left = 'calc(50% - 64px)';
      base.style.top = 'calc(100% - 180px)';
    }
    base.style.opacity = active ? '1' : '0.5';
    base.style.transform = active ? 'scale(1)' : 'scale(0.85)';
    knob.style.opacity = active ? '1' : '0.3';
    knob.style.transform = 'translate(0px, 0px)';
  };

  useEffect(() => {
    const find = (list: TouchList) => {
      for (let i = 0; i < list.length; i++) if (list[i].identifier === touchId.current) return list[i];
      return null;
    };
    const end = () => {
      if (touchId.current === null) return;
      touchId.current = null;
      setVisual(false);
      onMoveRef.current(0, 0);
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = touchId.current === null ? null : find(e.changedTouches);
      if (!t) return;
      if (e.cancelable) e.preventDefault();
      let dx = t.clientX - origin.current.x;
      let dy = t.clientY - origin.current.y;
      const d = Math.hypot(dx, dy);
      if (d > JOY_RADIUS) {
        dx = (dx / d) * JOY_RADIUS;
        dy = (dy / d) * JOY_RADIUS;
      }
      if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      onMoveRef.current(dx / JOY_RADIUS, dy / JOY_RADIUS);
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (find(e.changedTouches)) end();
    };
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    // Bildirim, arama vb. dokunuşu iptal ederse karakter yürümeye devam etmesin
    window.addEventListener('touchcancel', onTouchEnd);
    window.addEventListener('blur', end);
    document.addEventListener('visibilitychange', end);
    return () => {
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('blur', end);
      document.removeEventListener('visibilitychange', end);
      onMoveRef.current(0, 0);
    };
  }, []);

  const onTouchStart = (e: React.TouchEvent) => {
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    origin.current = { x: t.clientX, y: t.clientY };
    setVisual(true, t.clientX, t.clientY);
    onMoveRef.current(0, 0);
  };

  return (
    <>
      {/* Ekranın alt yarısı: dokunuşu yakalar, sayfanın kaymasını engeller */}
      <div className="fixed bottom-0 left-0 right-0 z-40 h-1/2" style={{ touchAction: 'none' }} onTouchStart={onTouchStart} />
      <div
        ref={baseRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-50 h-32 w-32 rounded-full border border-white/25 bg-white/15 shadow-2xl transition-[opacity,transform] duration-200 ease-out"
        style={{ left: 'calc(50% - 64px)', top: 'calc(100% - 180px)', opacity: 0.5, transform: 'scale(0.85)' }}
      >
        <div
          ref={knobRef}
          className="absolute left-1/2 top-1/2 z-10 -ml-6 -mt-6 h-12 w-12 rounded-full border-2 border-white/50 bg-white shadow-lg will-change-transform"
          style={{ opacity: 0.3 }}
        />
        <div className="absolute inset-8 rounded-full border border-white/5" />
      </div>
    </>
  );
};

const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const HubView: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const { setCurrentView } = useApp();
  const [isGameReady, setIsGameReady] = useState(false);
  
  // Sadece sayfa yenilendiğinde (ilk yüklemede) göster, binalardan dönüşte gösterme
  const [showWelcome, setShowWelcome] = useState(!hasSeenSession);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { 
            gravity: { x: 0, y: 0 },
            debug: false, // ?debug ya da F2 ile sahnede açılır (GameScene.setDebug)
            debugBodyColor: 0xff0000,
            debugStaticBodyColor: 0xff0000,
            debugShowVelocity: false
        }
      },
      scene: new GameScene((target) => {
        setCurrentView(target as ViewState);
      }),
      backgroundColor: '#1a1a1a', // Darker earthy tone base
    };

    gameRef.current = new Phaser.Game(config);
    // ?debug: test ve inceleme için oyunu konsoldan erişilebilir yap
    if (new URLSearchParams(window.location.search).has('debug')) (window as any).__village = gameRef.current;
    
    if (showWelcome) {
        gameRef.current.input.enabled = false;
    }

    setTimeout(() => setIsGameReady(true), 300);

    const handleResize = () => {
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [setCurrentView]);

  // Profesyonel görünüm katmanı açıkken oyunu duraklat: ok/boşluk tuşlarını yakalamasın, döngü uyusun.
  useEffect(() => {
    const apply = (open: boolean) => {
      const game = gameRef.current;
      if (!game) return;
      if (game.input.keyboard) game.input.keyboard.enabled = !open;
      if (open) game.loop.sleep();
      else game.loop.wake();
    };
    const onChange = (e: Event) => apply((e as CustomEvent<boolean>).detail);
    window.addEventListener(PRO_OVERLAY_EVENT, onChange);
    gameRef.current?.events.once(Phaser.Core.Events.READY, () => apply(isProOverlayOpen()));
    return () => window.removeEventListener(PRO_OVERLAY_EVENT, onChange);
  }, []);

  useEffect(() => {
    if (!showWelcome && gameRef.current) {
        gameRef.current.input.enabled = true;
    }
  }, [showWelcome]);

  const handleJoystickMove = (x: number, y: number) => {
    if (gameRef.current && !showWelcome) {
       const scene = gameRef.current.scene.getScene('HubScene') as any;
       if (scene && scene.updateJoystick) {
         scene.updateJoystick(x, y);
       }
    }
  };

  const handleCloseWelcome = () => {
    hasSeenSession = true;
    setShowWelcome(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#1a1a1a] select-none">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isGameReady ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        ref={gameContainerRef}
        className={`w-full h-full transition-[filter,transform] duration-500 ${showWelcome ? 'scale-[1.03] blur-[3px]' : ''}`}
      />
      
      {/* Karşılama tabelası */}
      <AnimatePresence>{showWelcome && <WelcomeCard onClose={handleCloseWelcome} />}</AnimatePresence>

      {/* Mobile Joystick - Dynamic */}
      {isTouchDevice && (
        <div className={showWelcome ? 'pointer-events-none' : ''}>
          <VirtualJoystick onMove={handleJoystickMove} />
        </div>
      )}

      {/* Desktop Hints */}
      <div className={`pointer-events-none absolute bottom-12 left-12 z-10 hidden ${isTouchDevice ? "" : "md:block"} transition-opacity duration-500 ${showWelcome ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <div className="flex gap-1">
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">W</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">A</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">S</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">D</span>
              </div>
              <span className="text-[10px] font-mono text-gray-200 uppercase tracking-widest">{G.walk}</span>
            </div>
          </div>
      </div>
    </div>
  );
};
