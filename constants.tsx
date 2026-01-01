import React from 'react';
import { Project, Photo } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'VSCO TR',
    category: 'Web',
    description: 'Fotoğraflarını paylaş, keşfet ve yaratıcı topluluğa katıl. Tamamen ücretsiz VSCO alternatifi.',
    techStack: [],
    thumbnail: '/assets/projects/vscotr.png',
    details: 'vscotr.vercel.app adresinde yayında.',
    link: 'https://vscotr.vercel.app/'
  },
  {
    id: '2',
    title: 'Portal Dash',
    category: 'Oyun',
    description: 'Mobil oyun hem Google Play Store hem App Store için geliştirildi.',
    techStack: [],
    thumbnail: '/assets/projects/portaldash.jpg',
    details: 'Çok Yakında',
    link: '#'
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
      details: 'kurdishtranslate.netlify.app adresinde yayında.',
      link: 'https://kurdishtranslate.netlify.app/'
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
