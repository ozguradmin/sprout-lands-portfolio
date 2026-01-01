import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { GameScene } from './GameScene';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Hand } from 'lucide-react';

// Oturum süresince (refresh hariç) hoşgeldin mesajını takip etmek için modül dışı değişken
let hasSeenSession = false;

// Ultra-Modern Dynamic Joystick
const VirtualJoystick: React.FC<{ onMove: (x: number, y: number) => void }> = ({ onMove }) => {
  const [active, setActive] = useState(false);
  const [basePosition, setBasePosition] = useState({ x: 0, y: 0 });
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });
  
  // Refs for immediate access in event handlers
  const activeRef = useRef(false);
  const basePosRef = useRef({ x: 0, y: 0 });

  const handleMove = (clientX: number, clientY: number) => {
    const maxRadius = 50;
    let dx = clientX - basePosRef.current.x;
    let dy = clientY - basePosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxRadius) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxRadius;
      dy = Math.sin(angle) * maxRadius;
    }

    setKnobPosition({ x: dx, y: dy });
    onMove(dx / maxRadius, dy / maxRadius);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!activeRef.current) return;
    if (e.cancelable) e.preventDefault();
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!activeRef.current) return;
    handleMove(e.clientX, e.clientY);
  };

  const onEnd = () => {
    activeRef.current = false;
    setActive(false);
    setKnobPosition({ x: 0, y: 0 });
    onMove(0, 0);
    
    // Clean up listeners immediately
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onEnd);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onEnd);
  };

  const handleStart = (e: React.TouchEvent | React.MouseEvent, clientX: number, clientY: number) => {
    if (clientY < window.innerHeight / 2) return;
    
    // Tarayıcının bu dokunuşu bir "scroll" olarak algılamasını engelle
    if (e.cancelable) e.preventDefault();

    activeRef.current = true;
    setActive(true);
    setBasePosition({ x: clientX, y: clientY });
    basePosRef.current = { x: clientX, y: clientY };
    setKnobPosition({ x: 0, y: 0 });
    onMove(0, 0);

    // Dinleyicileri hemen ekle
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onEnd);
  };

  // Ekranın alt yarısını kaplayan görünmez tetikleyici alan
  return (
    <>
      {/* Görünmez Tetikleyici Alan - Arka plan kaydırmasını tamamen durdurur */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-1/2 z-40"
        style={{ 
          touchAction: 'none', 
          pointerEvents: active ? 'none' : 'auto' 
        }}
        onTouchStart={(e) => {
          if (e.cancelable) e.preventDefault();
          handleStart(e, e.touches[0].clientX, e.touches[0].clientY);
        }}
        onMouseDown={(e) => handleStart(e, e.clientX, e.clientY)}
      />

      {/* Joystick Görseli */}
      <div 
        className="fixed w-32 h-32 rounded-full backdrop-blur-[1px] bg-white/10 border border-white/20 shadow-2xl z-50 pointer-events-none transition-all duration-300 ease-out"
        style={{ 
          left: active ? basePosition.x - 64 : window.innerWidth / 2 - 64, 
          top: active ? basePosition.y - 64 : window.innerHeight - 180, // %20 yukarı çekildi
          opacity: active ? 1 : 0.5, // Daha belirgin hale getirildi
          transform: active ? 'scale(1)' : 'scale(0.85)',
          touchAction: 'none'
        }}
      >
        {/* Knob (Topuz) */}
        <div 
          className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 rounded-full bg-white shadow-lg border-2 border-white/50 z-10 transition-transform duration-75 ease-out"
          style={{ 
            transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
            opacity: active ? 1 : 0.3
          }}
        />
        
        {/* İç halka süsü */}
        <div className="absolute inset-8 rounded-full border border-white/5" />
      </div>
    </>
  );
};

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
            gravity: { y: 0 },
            debug: false // HATA AYIKLAMA MODU KAPATILDI
        }
      },
      scene: new GameScene((target) => {
        setCurrentView(target as ViewState);
      }),
      backgroundColor: '#1a1a1a', // Darker earthy tone base
    };

    gameRef.current = new Phaser.Game(config);
    
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
        className="w-full h-full" 
      />
      
      {/* Welcome Modal Overlay - Sprout Lands Style */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className="relative max-w-sm w-full"
            >
              {/* Wood Frame Structure */}
              <div className="bg-[#e4a672] p-1.5 rounded-xl shadow-2xl border-[3px] border-[#b86f50]">
                {/* Inner Bevel/Border */}
                <div className="bg-[#e4a672] border-2 border-[#ffce9e] rounded-lg p-1">
                  {/* Content Area (Paper/Light Wood) */}
                  <div className="bg-[#ead4aa] rounded-md p-6 relative flex flex-col items-center font-pixel">
                    
                    {/* Close Button */}
                    <button 
                      onClick={handleCloseWelcome}
                      className="absolute -top-5 -right-5 bg-[#e4a672] border-2 border-[#b86f50] text-[#5d4037] w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#ffce9e] transition-colors shadow-lg z-20 active:translate-y-1"
                    >
                      <X size={24} strokeWidth={3} />
                    </button>

                    {/* Header Image/Icon */}
                    <div className="w-32 h-32 mb-4 overflow-hidden rounded-xl shadow-lg">
                       <img src="/assets/ben.png" alt="Özgür Güler" className="w-full h-full object-cover" />
                    </div>

                    {/* Title */}
                    <div className="flex items-center gap-2 mb-2">
                       <h2 className="text-[#5d4037] font-bold text-xl tracking-wider uppercase drop-shadow-sm">MERHABA!</h2>
                    </div>
                    
                    <div className="h-0.5 w-16 bg-[#b86f50]/40 rounded-full mb-4"></div>

                    {/* Text */}
                    <div className="text-[#5d4037] text-center font-medium leading-relaxed mb-6 text-sm">
                      Ben <span className="font-bold">Özgür</span>, 23 yaşındayım.<br/>
                      Dijital köyüme hoş geldin!<br/><br/>
                      <span className="text-[#5d4037]/80 text-[10px] leading-tight block">Buradan karakteri hareket ettirerek benimle ilgili bilgilere ulaşabilirsin.</span>
                    </div>
                    
                    {/* Action Button */}
                    <button 
                      onClick={handleCloseWelcome}
                      className="w-full group relative"
                    >
                      <div className="absolute inset-0 bg-[#b86f50] rounded-xl translate-y-1.5 transition-transform group-active:translate-y-0"></div>
                      <div className="relative bg-[#e4a672] border-2 border-[#b86f50] text-[#5d4037] font-extrabold py-3 rounded-xl hover:brightness-110 transition-all uppercase tracking-wider flex items-center justify-center gap-2 group-active:translate-y-1.5">
                        KÖYÜ KEŞFET <Hand size={18} className="rotate-12" />
                      </div>
                    </button>

                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mobile Joystick - Dynamic */}
      <div className={`md:hidden ${showWelcome ? 'pointer-events-none' : ''}`}>
        <VirtualJoystick onMove={handleJoystickMove} />
      </div>

      {/* Desktop Hints */}
      <div className={`pointer-events-none absolute bottom-12 left-12 z-10 hidden md:block transition-opacity duration-500 ${showWelcome ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <div className="flex gap-1">
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">W</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">A</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">S</span>
                <span className="w-6 h-6 flex items-center justify-center border border-white/20 rounded text-[10px] font-bold text-white bg-white/5">D</span>
              </div>
              <span className="text-[10px] font-mono text-gray-200 uppercase tracking-widest">YÜRÜ</span>
            </div>
          </div>
      </div>
    </div>
  );
};
