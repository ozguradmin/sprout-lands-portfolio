import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ViewState, AppContextType } from '../types';

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
  const [loadingStatus, setLoadingStatus] = useState('Sistemler başlatılıyor...');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Yükleme Simülasyonu ve Otomatik Geçiş
  useEffect(() => {
    if (currentView !== ViewState.LOADING) return;

    const steps = [
      { p: 10, s: 'Doku haritaları yükleniyor...' },
      { p: 30, s: 'Asset kütüphanesi optimize ediliyor...' },
      { p: 60, s: 'Oyun motoru hazırlanıyor...' },
      { p: 85, s: 'Dünya sınırları çiziliyor...' },
      { p: 100, s: 'Evren hazır!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setLoadingProgress(steps[currentStep].p);
        setLoadingStatus(steps[currentStep].s);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCurrentView(ViewState.HUB);
        }, 500);
      }
    }, 600);

    return () => clearInterval(interval);
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
