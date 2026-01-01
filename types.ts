// Define types
export enum ViewState {
  LOADING = 'LOADING',
  HUB = 'HUB',
  PORTFOLIO = 'PORTFOLIO',
  ARCADE = 'ARCADE',
  GALLERY = 'GALLERY',
  ADMIN = 'ADMIN',
}

export interface Project {
  id: string;
  title: string;
  category: 'Web' | 'Mobile' | 'Oyun' | 'Design';
  description: string;
  techStack: string[];
  thumbnail: string;
  details: string;
  link?: string;
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
