import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewState, AppContextType } from '../types';

import { CLASSIC_LOADER, G } from '../i18n/game';
import { preloadVillage } from '../components/Hub/villageAssets';
interface ExtendedAppContextType extends AppContextType {
  loadingProgress: number;
  loadingStatus: string;
}

const AppContext = createContext<ExtendedAppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/admin') return ViewState.ADMIN;
    }
    return ViewState.LOADING;
  });
  
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<string>(G.loadingInitial);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Yükleme: köyün dosyalarını gerçekten indirir ve ilerlemeyi gösterir (en az MIN_LOADING_MS kadar görünür).
  // ?yukleme=eski ise eski zamanlayıcılı sürüm çalışır.
  useEffect(() => {
    if (currentView !== ViewState.LOADING) return;
    let cancelled = false;
    const timers: number[] = [];

    if (CLASSIC_LOADER) {
      const steps = [10, 30, 60, 85, 100].map((p, i) => ({ p, s: G.loadingSteps[i] }));
      let currentStep = 0;
      const interval = window.setInterval(() => {
        if (currentStep < steps.length) {
          setLoadingProgress(steps[currentStep].p);
          setLoadingStatus(steps[currentStep].s);
          currentStep++;
        } else {
          window.clearInterval(interval);
          timers.push(window.setTimeout(() => setCurrentView(ViewState.HUB), 500));
        }
      }, 600);
      return () => {
        window.clearInterval(interval);
        timers.forEach(window.clearTimeout);
      };
    }

    const MIN_LOADING_MS = 1200;
    const started = performance.now();
    const stage = (p: number) => G.loadingStages[Math.min(G.loadingStages.length - 2, Math.floor(p * (G.loadingStages.length - 1)))];
    setLoadingStatus(stage(0));
    preloadVillage((p) => {
      if (cancelled) return;
      setLoadingProgress(Math.round(p * 100));
      setLoadingStatus(stage(p));
    }).then(() => {
      if (cancelled) return;
      const wait = Math.max(0, MIN_LOADING_MS - (performance.now() - started));
      timers.push(
        window.setTimeout(() => {
          setLoadingProgress(100);
          setLoadingStatus(G.loadingStages[G.loadingStages.length - 1]);
          timers.push(window.setTimeout(() => !cancelled && setCurrentView(ViewState.HUB), 450));
        }, wait),
      );
    });
    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, [currentView]);

  return (
    <AppContext.Provider value={{ 
      currentView, 
      setCurrentView, 
      isDarkMode, 
      toggleTheme,
      loadingProgress,
      loadingStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context as ExtendedAppContextType;
};
