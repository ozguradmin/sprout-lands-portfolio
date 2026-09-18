import React from 'react';
import { renderToString } from 'react-dom/server';
import { ProfessionalPage } from './ProfessionalPage';
import { LANGS, PROFILE, PROJECTS, SITE_URL, metaFor, parseProPath, proBase, projectPath } from './data';

/** Önceden render edilecek bütün yollar (iki dil × genel sayfa + proje sayfaları). */
export const routes = LANGS.flatMap((l) => [proBase(l), ...PROJECTS.map((p) => projectPath(l, p.slug))]);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function render(path: string) {
  const html = renderToString(
    <React.StrictMode>
      <ProfessionalPage mode="page" path={path} />
    </React.StrictMode>,
  );

  const { lang, slug } = parseProPath(path);
  const meta = metaFor(lang, slug);
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PROFILE.name,
    jobTitle: PROFILE.role[lang],
    url: `${SITE_URL}${proBase(lang)}`,
    image: `${SITE_URL}${PROFILE.avatar}`,
    email: `mailto:${PROFILE.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Mardin', addressCountry: 'TR' },
    sameAs: [PROFILE.links.github, PROFILE.links.linkedin, PROFILE.links.x],
  };

  const head = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${meta.url}" />`,
    ...meta.alternates.map((a) => `<link rel="alternate" hreflang="${a.lang}" href="${a.url}" />`),
    `<link rel="alternate" hreflang="x-default" href="${meta.alternates.find((a) => a.lang === 'tr')!.url}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'tr_TR'}" />`,
    `<meta property="og:site_name" content="Özgür Güler" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${meta.url}" />`,
    `<meta property="og:image" content="${meta.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Özgür Güler, ${esc(PROFILE.role[lang])}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${meta.image}" />`,
    `<script type="application/ld+json">${JSON.stringify(person).replace(/</g, '\\u003c')}</script>`,
  ].join('\n    ');

  return { html, head, lang };
}
