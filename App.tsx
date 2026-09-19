import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ViewState } from './types';
import { HubView } from './components/Hub/HubView';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { ArcadeView } from './components/Arcade/ArcadeView';
import { GalleryView } from './components/Gallery/GalleryView';
import { LoadingScreen } from './components/UI/LoadingScreen';
import { AdminView } from './components/Admin/AdminView';
import { ProfessionalButton } from './components/UI/ProfessionalButton';
import { startMusicIfEnabled } from './components/UI/music';
import { isProPath, setProOverlayOpen } from './professional/overlayBridge';
import { GAME_LANG, professionalPath, villagePath } from './i18n/game';
import { motion, AnimatePresence } from 'framer-motion';

const ProfessionalOverlay = lazy(() => import('./professional/ProfessionalOverlay'));

const Main: React.FC = () => {
  const { currentView } = useApp();

  // Profesyonel görünüm: köyün üstünde tam ekran katman, adresi /professional.
  const [proOpen, setProOpen] = useState(() => typeof window !== 'undefined' && isProPath(window.location.pathname));

  const openPro = useCallback(() => {
    if (!isProPath(window.location.pathname)) {
      window.history.pushState({ pro: true }, '', professionalPath(GAME_LANG));
    }
    setProOpen(true);
  }, []);

  const closePro = useCallback(() => {
    if (window.history.state?.pro) {
      window.history.back();
    } else {
      window.history.replaceState(null, '', villagePath(GAME_LANG));
      setProOpen(false);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setProOpen(isProPath(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    setProOverlayOpen(proOpen);
  }, [proOpen]);

  // Müzik açık bırakılmışsa köy açılınca devam etsin (yükleme ekranında başlamasın).
  useEffect(() => {
    if (currentView === ViewState.HUB) startMusicIfEnabled();
  }, [currentView]);

  const showProButton = !proOpen && (currentView === ViewState.LOADING || currentView === ViewState.HUB);

  const renderView = () => {
    switch (currentView) {
      case ViewState.LOADING:
        return <LoadingScreen />;
      case ViewState.HUB:
        return <HubView />;
      case ViewState.PORTFOLIO:
        return <PortfolioView />;
      case ViewState.ARCADE:
        return <ArcadeView />;
      case ViewState.GALLERY:
        return <GalleryView />;
      case ViewState.ADMIN:
        return <AdminView />;
      default:
        return <HubView />;
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-gray-900 text-white font-sans">
      <div className="fixed inset-0 pointer-events-none z-[50] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      <AnimatePresence mode="wait">
        <motion.main
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full relative"
        >
          {renderView()}
        </motion.main>
      </AnimatePresence>
      {showProButton && <ProfessionalButton onOpen={openPro} />}
      {proOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[10050] bg-[#faf6ee] dark:bg-[#161a2b]" />}>
          <ProfessionalOverlay onClose={closePro} />
        </Suspense>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

export default App;
