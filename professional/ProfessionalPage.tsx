import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown, Download, FileText, Github, Globe, Link2, Linkedin, Mail, MapPin, Moon, Smartphone, Sun } from 'lucide-react';
import {
  ABOUT,
  MEDIA,
  MORE_PROJECTS,
  PROFILE,
  PROJECTS,
  SKILLS,
  STORE_APPS,
  UI,
  counterpartPath,
  labelOf,
  parseProPath,
  projectPath,
  villagePath,
  type FeaturedProject,
  type Lang,
  type LinkKind,
} from './data';
import './professional.css';

export interface ProfessionalPageProps {
  /** 'page': /professional adresinde tek başına; 'overlay': oyunun üstünde açılan katman. */
  mode: 'page' | 'overlay';
  /** Sunucuda render edilen yol; istemcide verilmezse location.pathname kullanılır. */
  path?: string;
  /** Katman modunda köye dönüş. */
  onBackToVillage?: () => void;
}

type Strings = (typeof UI)['tr'];

const THEME_KEY = 'pro-theme';

const linkIcon = (kind: LinkKind) => {
  if (kind === 'github') return <Github size={15} aria-hidden="true" />;
  if (kind === 'store') return <Smartphone size={15} aria-hidden="true" />;
  return <Globe size={15} aria-hidden="true" />;
};

const External: React.FC<{ href: string; className?: string; t: Strings; children: React.ReactNode }> = ({ href, className, t, children }) => (
  <a href={href} className={className} target="_blank" rel="noopener noreferrer">
    {children}
    <span className="pro-sr"> {t.newTab}</span>
  </a>
);

const VillageLink: React.FC<{ lang: Lang; t: Strings; onBack?: () => void; className?: string; children: React.ReactNode }> = ({
  lang,
  t,
  onBack,
  className,
  children,
}) => (
  <a
    href={villagePath(lang)}
    className={className}
    aria-label={t.villageAria}
    onClick={(e) => {
      if (onBack) {
        e.preventDefault();
        onBack();
      }
    }}
  >
    {children}
  </a>
);

const ProjectCard: React.FC<{
  project: FeaturedProject;
  lang: Lang;
  t: Strings;
  active: boolean;
  onCopy: (p: FeaturedProject) => void;
}> = ({ project: p, lang, t, active, onCopy }) => {
  // Mobilde amaç/ne geliştirdim/sonuç/teknolojiler kapalı gelir; geniş ekranda hep açık (CSS).
  const [open, setOpen] = useState(active);
  const storyId = `${p.slug}-story`;
  return (
    <article id={p.slug} className={`pro-project${active ? ' is-active' : ''}${open ? ' is-open' : ''}`} aria-labelledby={`${p.slug}-title`}>
      <div className="pro-project-media" style={{ background: p.image.bg }}>
        <img
          src={`${p.image.src}.webp`}
          srcSet={`${p.image.src}-720.webp 720w, ${p.image.src}.webp 1200w`}
          sizes="(min-width: 900px) 520px, 100vw"
          width={1200}
          height={750}
          alt={p.image.alt[lang]}
          loading={active ? 'eager' : 'lazy'}
          decoding="async"
        />
      </div>
      <div className="pro-project-body">
        <div className="pro-project-title">
          {p.icon && <img className="pro-app-icon" src={p.icon} width={40} height={40} alt="" loading="lazy" decoding="async" />}
          <div>
            <h3 id={`${p.slug}-title`}>{p.name}</h3>
            <p className="pro-project-meta">
              <span className="pro-kind">{p.kind[lang]}</span>
              <span className="pro-status">{p.status[lang]}</span>
            </p>
          </div>
          <button type="button" className="pro-copy" onClick={() => onCopy(p)} title={t.copyLink}>
            <Link2 size={15} aria-hidden="true" />
            <span className="pro-copy-label">{t.copyLink}</span>
            <span className="pro-sr"> ({p.name})</span>
          </button>
        </div>
        <p className="pro-project-summary">{p.summary[lang]}</p>
        <ul className="pro-project-links">
          {p.links.map((l) => (
            <li key={l.href}>
              <External href={l.href} t={t}>
                {linkIcon(l.kind)}
                {labelOf(l.label, lang)}
              </External>
            </li>
          ))}
        </ul>
        <button type="button" className="pro-details-toggle" aria-expanded={open} aria-controls={storyId} onClick={() => setOpen((v) => !v)}>
          {open ? t.hideDetails : t.details}
          <ChevronDown size={16} aria-hidden="true" />
        </button>
        <dl className="pro-story" id={storyId}>
          <div>
            <dt>{t.goal}</dt>
            <dd>{p.goal[lang]}</dd>
          </div>
          <div>
            <dt>{t.built}</dt>
            <dd>
              <ul className="pro-built">
                {p.built[lang].map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </dd>
          </div>
          <div>
            <dt>{t.result}</dt>
            <dd>{p.result[lang]}</dd>
          </div>
          <div>
            <dt>{t.stack}</dt>
            <dd className="pro-stack">{p.stack.join(' · ')}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
};

export const ProfessionalPage: React.FC<ProfessionalPageProps> = ({ mode, path, onBackToVillage }) => {
  const currentPath = path ?? (typeof window !== 'undefined' ? window.location.pathname : '/professional');
  const { lang, slug: activeSlug } = parseProPath(currentPath);
  const t = UI[lang];
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number | undefined>(undefined);
  const onBack = mode === 'overlay' ? onBackToVillage : undefined;

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {
      /* depolama kapalı olabilir */
    }
    if (stored === 'light' || stored === 'dark') {
      document.documentElement.setAttribute('data-theme', stored);
      setTheme(stored);
    } else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }, []);

  // Proje deep-link'i: /professional[/en]/projects/<slug> ya da #slug ilgili karta kaydırır.
  useEffect(() => {
    const target = activeSlug ?? (window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : null);
    if (!target) return;
    const el = document.getElementById(target);
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [activeSlug]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* yok say */
    }
    setTheme(next);
  }, [theme]);

  const copyProjectLink = async (p: FeaturedProject) => {
    const url = `${window.location.origin}${projectPath(lang, p.slug)}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast(t.copied(p.name));
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(''), 2200);
    } catch {
      window.prompt(t.linkPrompt, url);
    }
  };

  const otherLang: Lang = lang === 'en' ? 'tr' : 'en';

  return (
    <div className="pro" lang={lang}>
      <a className="pro-skip" href="#main">
        {t.skip}
      </a>
      <div className="pro-pixel-strip" aria-hidden="true" />
      <header className="pro-header">
        <div className="pro-container pro-header-inner">
          <a className="pro-brand" href="#main" aria-label={`${PROFILE.name}, ${t.toTop}`}>
            <img src={PROFILE.avatar} width={30} height={30} alt="" />
            <span className="pro-brand-name">{PROFILE.name}</span>
          </a>
          <nav className="pro-nav" aria-label={t.navLabel}>
            <a href="#projects">{t.nav.projects}</a>
            <a href="#skills">{t.nav.skills}</a>
            <a href="#about">{t.nav.about}</a>
            <a href="#contact">{t.nav.contact}</a>
          </nav>
          <div className="pro-header-actions">
            <a className="pro-icon-btn pro-lang" href={counterpartPath(lang, activeSlug)} hrefLang={otherLang} lang={otherLang} aria-label={t.langSwitchAria}>
              {t.langSwitchShort}
            </a>
            <button
              type="button"
              className="pro-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
              title={theme === 'dark' ? t.themeToLight : t.themeToDark}
            >
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <VillageLink lang={lang} t={t} onBack={onBack} className="pro-village-btn">
              <ArrowLeft size={14} aria-hidden="true" />
              <span className="pro-village-label">{t.village}</span>
            </VillageLink>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="pro-hero" aria-labelledby="pro-name">
          <div className="pro-container">
            <div className="pro-hero-grid">
              <img className="pro-avatar" src={PROFILE.avatar} width={132} height={132} alt="" fetchPriority="high" />
              <div className="pro-hero-head">
                <h1 id="pro-name">{PROFILE.name}</h1>
                <p className="pro-role">
                  {PROFILE.role[lang]}
                  <span className="pro-location">
                    <MapPin size={15} aria-hidden="true" />
                    {PROFILE.location[lang]}
                  </span>
                </p>
              </div>
              <div className="pro-hero-body">
                {PROFILE.intro[lang].map((p) => (
                  <p className="pro-intro" key={p}>
                    {p}
                  </p>
                ))}
                <div className="pro-cta">
                  <a className="pro-btn pro-btn-primary" href="#projects">
                    {t.seeProjects} <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  <a className="pro-btn" href={PROFILE.cv[lang]} target="_blank" rel="noopener">
                    <FileText size={17} aria-hidden="true" /> {t.cv}
                  </a>
                  <a className="pro-btn pro-btn-icon" href={PROFILE.cv[lang]} download aria-label={t.cvDownload} title={t.cvDownload}>
                    <Download size={17} aria-hidden="true" />
                  </a>
                </div>
                <ul className="pro-links">
                  <li>
                    <External href={PROFILE.links.github} t={t}>
                      <Github size={16} aria-hidden="true" /> GitHub
                    </External>
                  </li>
                  <li>
                    <External href={PROFILE.links.linkedin} t={t}>
                      <Linkedin size={16} aria-hidden="true" /> LinkedIn
                    </External>
                  </li>
                  <li>
                    <a href={`mailto:${PROFILE.email}`}>
                      <Mail size={16} aria-hidden="true" /> {t.email}
                    </a>
                  </li>
                  <li>
                    <VillageLink lang={lang} t={t} onBack={onBack} className="pro-link-village">
                      {t.exploreVillage}
                    </VillageLink>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pro-stores">
              <h2 className="pro-label">{t.storesTitle}</h2>
              <ul>
                {STORE_APPS.map((a) => {
                  const inner = (
                    <>
                      <img className="pro-app-icon" src={a.icon} width={36} height={36} alt="" loading="lazy" decoding="async" />
                      <span>
                        <strong>{a.name}</strong>
                        <small>{a.note[lang]}</small>
                      </span>
                    </>
                  );
                  return (
                    <li key={a.name}>
                      {a.href.startsWith('#') ? (
                        <a href={a.href}>{inner}</a>
                      ) : (
                        <External href={a.href} t={t}>
                          {inner}
                        </External>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        <section id="projects" className="pro-section" aria-labelledby="projects-title">
          <div className="pro-container">
            <h2 id="projects-title">{t.projectsTitle}</h2>
            <p className="pro-section-sub">{t.projectsSub}</p>
            <div className="pro-projects">
              {PROJECTS.map((p) => (
                <ProjectCard key={p.slug} project={p} lang={lang} t={t} active={p.slug === activeSlug} onCopy={copyProjectLink} />
              ))}
            </div>

            <h3 className="pro-subhead">{t.moreTitle}</h3>
            <ul className="pro-more">
              {MORE_PROJECTS.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong>
                  <p>{p.text[lang]}</p>
                  <p className="pro-more-links">
                    {p.links.map((l, i) => (
                      <React.Fragment key={l.href}>
                        {i > 0 && ' · '}
                        <External href={l.href} t={t}>
                          {labelOf(l.label, lang)}
                        </External>
                      </React.Fragment>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="skills" className="pro-section" aria-labelledby="skills-title">
          <div className="pro-container">
            <h2 id="skills-title">{t.skillsTitle}</h2>
            <p className="pro-section-sub">{t.skillsSub}</p>
            <dl className="pro-skills">
              {SKILLS.map((g) => (
                <div key={g.title}>
                  <dt>{g.title}</dt>
                  <dd>{g.items[lang]}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="about" className="pro-section" aria-labelledby="about-title">
          <div className="pro-container pro-prose">
            <h2 id="about-title">{t.aboutTitle}</h2>
            {ABOUT[lang].map((p) => (
              <p key={p}>{p}</p>
            ))}
            <h3 className="pro-subhead">{t.mediaTitle}</h3>
            <p>{MEDIA.intro[lang]}</p>
            <ul className="pro-media">
              {MEDIA.items.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong>: {m.text[lang]}
                  <span className="pro-media-links">
                    {m.links.map((l) => (
                      <External key={l.href} href={l.href} t={t}>
                        {l.label}
                      </External>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="pro-section" aria-labelledby="contact-title">
          <div className="pro-container pro-contact">
            <div>
              <h2 id="contact-title">{t.contactTitle}</h2>
              <p className="pro-section-sub">{t.contactText}</p>
              <a className="pro-mail" href={`mailto:${PROFILE.email}`}>
                {PROFILE.email}
              </a>
              <ul className="pro-contact-list">
                <li>
                  <External href={PROFILE.links.linkedin} t={t}>
                    <Linkedin size={16} aria-hidden="true" /> LinkedIn
                  </External>
                </li>
                <li>
                  <External href={PROFILE.links.github} t={t}>
                    <Github size={16} aria-hidden="true" /> GitHub
                  </External>
                </li>
                <li>
                  <External href={PROFILE.links.x} t={t}>
                    X (@ozguramdin)
                  </External>
                </li>
                <li>
                  <a href={PROFILE.cv.tr} target="_blank" rel="noopener" hrefLang="tr">
                    <FileText size={16} aria-hidden="true" /> {t.cvTr}
                  </a>
                </li>
                <li>
                  <a href={PROFILE.cv.en} target="_blank" rel="noopener" hrefLang="en">
                    <FileText size={16} aria-hidden="true" /> {t.cvEn}
                  </a>
                </li>
              </ul>
            </div>
            <aside className="pro-village-card" aria-label={t.village}>
              <p className="pro-village-title">{t.village}</p>
              <p>{t.villageNote}</p>
              <VillageLink lang={lang} t={t} onBack={onBack} className="pro-village-btn">
                <ArrowLeft size={14} aria-hidden="true" />
                <span>{t.villageCta}</span>
              </VillageLink>
            </aside>
          </div>
        </section>
      </main>

      <footer className="pro-footer">
        <div className="pro-container pro-footer-inner">
          <span>© {new Date().getFullYear()} Özgür Güler</span>
          <span>ozgurguler.tech</span>
        </div>
      </footer>

      <div aria-live="polite" role="status">
        {toast && <div className="pro-toast">{toast}</div>}
      </div>
    </div>
  );
};

export default ProfessionalPage;
