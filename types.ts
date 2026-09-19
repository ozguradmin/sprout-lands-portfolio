// Define types
export enum ViewState {
  LOADING = 'LOADING',
  HUB = 'HUB',
  PORTFOLIO = 'PORTFOLIO',
  ARCADE = 'ARCADE',
  GALLERY = 'GALLERY',
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  filter: string;
}

export interface AppContextType {
  currentView: ViewState;
  setCurrentView: (view: ViewState) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}
