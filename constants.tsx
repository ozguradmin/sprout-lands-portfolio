import React from 'react';
import { Project, Photo } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Coğrafist',
    category: 'Uygulama/Oyun',
    description: 'Coğrafya öğrenme uygulaması.',
    techStack: [],
    thumbnail: '/assets/projects/cografist.png',
    details: 'cografist.app adresinde yayında.',
    link: 'https://cografist.app/'
  },
  {
    id: '3',
    title: 'Dosya Paylaş',
    category: 'Web',
    description: 'Basit, güvenli, bedava ve reklamsız dosya paylaşımı.',
    techStack: [],
    thumbnail: '/assets/projects/dosyapaylas.png',
    details: 'dosyapaylas.vercel.app adresinde yayında.',
    link: 'https://dosyapaylas.vercel.app/'
  },
  {
    id: '4',
    title: 'Kurdish Translate',
    category: 'Web',
    description: 'Kürtçe çeviri web sitesi.',
    techStack: [],
    thumbnail: '/assets/projects/kurdishai.png',
    details: 'kurtceviri.netlify.app adresinde yayında.',
    link: 'https://kurtceviri.netlify.app/'
  },
  {
    id: '5',
    title: 'Galaktik Uzay',
    category: 'Web',
    description: 'Uzayla alakalı web sitem.',
    techStack: [],
    thumbnail: '/assets/projects/galaktikuzay.png',
    details: 'galaktikuzay.com adresinde yayında.',
    link: 'https://galaktikuzay.com/'
  },
  {
    id: '6',
    title: 'Birlikte İzle',
    category: 'Web',
    description: 'Discord yayın paylaşma benzeri web sitesi. Birlikte oda kurup yayın açıp izleyip sohbet edin.',
    techStack: [],
    thumbnail: '/assets/projects/birlikteizle.jpg',
    details: 'birlikteizle.ozgurguler.workers.dev adresinde yayında.',
    link: 'https://birlikteizle.ozgurguler.workers.dev/'
  },
  {
    id: '2',
    title: 'VSCO TR',
    category: 'Web',
    description: 'Fotoğraflarını paylaş, keşfet ve yaratıcı topluluğa katıl. Tamamen ücretsiz VSCO alternatifi.',
    techStack: [],
    thumbnail: '/assets/projects/vscotr.png',
    details: 'vscotr.vercel.app adresinde yayında.',
    link: 'https://vscotr.vercel.app/'
  },
  {
    id: '7',
    title: 'Portal Dash',
    category: 'Uygulama/Oyun',
    description: 'Mobil oyun hem Google Play Store hem App Store için geliştirildi.',
    techStack: [],
    thumbnail: '/assets/projects/portaldash.jpg',
    details: 'Çok Yakında',
    link: '#'
  }
];

export const GALLERY_PHOTOS: Photo[] = [
  { id: '1', url: 'https://picsum.photos/id/101/600/800', caption: 'Kentsel Yalnızlık', filter: 'sepia(20%) contrast(90%) brightness(105%)' }
];

export const THEME_COLORS = {
  light: {
    primary: '#E8DFF5',
    secondary: '#FCE1E4',
    tertiary: '#DAEAF6',
    accent: '#7FB3D5',
    bg: '#FFFFFF',
    text: '#1F2937'
  },
  dark: {
    primary: '#0F1419',
    secondary: '#1A2129',
    accent: '#7FB3D5',
    bg: '#0F1419',
    text: '#F3F4F6'
  }
};
