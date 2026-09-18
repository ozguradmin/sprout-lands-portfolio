import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { ProfessionalPage } from './ProfessionalPage';

const root = document.getElementById('pro-root');
if (!root) throw new Error('pro-root bulunamadı');

const app = (
  <React.StrictMode>
    <ProfessionalPage mode="page" />
  </React.StrictMode>
);

// Build sırasında önceden render edilmiş HTML varsa hydrate et; dev sunucusunda boş gelir.
if (root.firstElementChild) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
