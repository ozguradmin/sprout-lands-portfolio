import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ViewState } from './types';
import { HubView } from './components/Hub/HubView';
import { PortfolioView } from './components/Portfolio/PortfolioView';
import { ArcadeView } from './components/Arcade/ArcadeView';
import { GalleryView } from './components/Gallery/GalleryView';
import { LoadingScreen } from './components/UI/LoadingScreen';
import { AdminView } from './components/Admin/AdminView';
import { motion, AnimatePresence } from 'framer-motion';

const Main: React.FC = () => {
  const { currentView } = useApp();

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
