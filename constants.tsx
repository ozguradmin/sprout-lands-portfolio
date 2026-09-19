import React from 'react';
import { Photo } from './types';

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
