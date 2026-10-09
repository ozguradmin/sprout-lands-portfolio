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
import { PixelBanner } from '../components/UI/PixelBanner';
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

/** Kelimenin altına elle çizilmiş gibi iki geçişli çizgi. CSS ile çizilir (bu sayfada animasyon kütüphanesi yok). */
const Marked: React.FC<{ children: React.ReactNode; onScroll?: boolean; delay?: string }> = ({ children, onScroll, delay }) => (
  <span className="pro-marked">
    <span>{children}</span>
    <svg className={`pro-mark${onScroll ? ' pro-mark-scroll' : ''}`} viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden="true" style={delay ? ({ ['--rd' as string]: delay } as React.CSSProperties) : undefined}>
      <path pathLength={1} d="M5 11 C 54 4, 118 3, 196 8" />
      <path pathLength={1} d="M16 16 C 68 11, 134 10, 188 13" />
    </svg>
  </span>
);

const Eyebrow: React.FC<{ n: string; children: React.ReactNode }> = ({ n, children }) => (
  <p className="pro-eyebrow">
    <b>{n}</b>
    <i>/</i>
    {children}
  </p>
);

const NoteArrow: React.FC = () => (
  <svg className="pro-note-arrow" viewBox="0 0 110 76" aria-hidden="true">
    <path d="M7 11 C 44 5, 84 21, 97 60" />
    <path d="M82 50 L99 66 L101 44" />
  </svg>
);

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

  // Kahraman bloğu sırayla gelsin diye her parçaya gecikme verilir (CSS animasyonu, JS gerekmez).
  const rd = (sec: number) => ({ ['--rd' as string]: `${sec}s` }) as React.CSSProperties;
  // Unvanın son kelimesinin altı elle çizilir.
  const roleWords = PROFILE.role[lang].split(' ');
  const roleTail = roleWords[roleWords.length - 1];
  const roleHead = roleWords.slice(0, -1).join(' ') + (roleWords.length > 1 ? ' ' : '');

  // Okuma ilerlemesi + menüde bulunduğun bölüm. Katman modunda sayfa .pro-overlay içinde kayar.
  const [section, setSection] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = (rootRef.current?.closest('.pro-overlay') as HTMLElement | null) ?? null;
    const target: HTMLElement | Window = scroller ?? window;
    // Değer doğrudan çubuğun stiline yazılır; React yeniden render edilmez.
    let frame = 0;
    const read = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = scroller ?? document.documentElement;
        const max = el.scrollHeight - el.clientHeight;
        barRef.current?.style.setProperty('--p', String(max > 0 ? Math.min(1, el.scrollTop / max) : 0));
      });
    };
    read();
    target.addEventListener('scroll', read, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setSection(visible.target.id);
      },
      { root: scroller, rootMargin: '-38% 0px -55% 0px' },
    );
    for (const id of ['projects', 'skills', 'about', 'contact']) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }

    const fmt = new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' });
    const tick = () => setClock(fmt.format(new Date()));
    tick();
    const clockId = window.setInterval(tick, 30_000);

    return () => {
      cancelAnimationFrame(frame);
      target.removeEventListener('scroll', read);
      io.disconnect();
      window.clearInterval(clockId);
    };
  }, [lang]);

  const otherLang: Lang = lang === 'en' ? 'tr' : 'en';

  return (
    <div className="pro" lang={lang} ref={rootRef}>
      <a className="pro-skip" href="#main">
        {t.skip}
      </a>
      <PixelBanner className="pro-banner" />
      <header className="pro-header">
        <div className="pro-progress" ref={barRef} aria-hidden="true" />
        <div className="pro-container pro-header-inner">
          <a className="pro-brand" href="#main" aria-label={`${PROFILE.name}, ${t.toTop}`}>
            <img src={PROFILE.avatar} width={30} height={30} alt="" />
            <span className="pro-brand-name">{PROFILE.name}</span>
          </a>
          <nav className="pro-nav" aria-label={t.navLabel}>
            {(['projects', 'skills', 'about', 'contact'] as const).map((id) => (
              <a key={id} href={`#${id}`} aria-current={section === id ? 'true' : undefined}>
                {t.nav[id]}
              </a>
            ))}
          </nav>
          <div className="pro-header-actions">
            {/* İki dil yan yana: seçili olan vurgulu, diğeri o sayfanın karşılığına gider. */}
            <div className="pro-langs" role="group" aria-label="Dil / Language">
              {(['tr', 'en'] as Lang[]).map((l) =>
                l === lang ? (
                  <span key={l} className="is-current" aria-current="true">
                    {l.toUpperCase()}
                  </span>
                ) : (
                  <a key={l} href={counterpartPath(lang, activeSlug)} hrefLang={otherLang} lang={otherLang} aria-label={t.langSwitchAria}>
                    {l.toUpperCase()}
                  </a>
                ),
              )}
            </div>
            <button
              type="button"
              className="pro-icon-btn pro-theme-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? t.themeToLight : t.themeToDark}
              title={theme === 'dark' ? t.themeToLight : t.themeToDark}
            >
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <VillageLink lang={lang} t={t} onBack={onBack} className="pro-village-btn">
              <ArrowLeft size={14} aria-hidden="true" />
              <span className="pro-village-label">{t.village}</span>
              <span className="pro-village-short" aria-hidden="true">
                {t.villageShort}
              </span>
            </VillageLink>
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <section className="pro-hero" aria-labelledby="pro-name">
          <div className="pro-container">
            <div className="pro-hero-grid">
              <img className="pro-avatar pro-rise" src={PROFILE.avatar} width={132} height={132} alt="" fetchPriority="high" />
              <div className="pro-hero-head pro-rise" style={rd(0.07)}>
                <h1 id="pro-name">{PROFILE.name}</h1>
                <p className="pro-role">
                  <span>
                    {roleHead}
                    <Marked delay="0.2s">{roleTail}</Marked>
                  </span>
                  <span className="pro-location">
                    <MapPin size={15} aria-hidden="true" />
                    {PROFILE.location[lang]}
                  </span>
                </p>
              </div>
              <div className="pro-hero-body">
                {PROFILE.intro[lang].map((p, i) => (
                  <p className="pro-intro pro-rise" style={rd(0.14 + i * 0.05)} key={p}>
                    {p}
                  </p>
                ))}
                <div className="pro-cta pro-rise" style={rd(0.26)}>
                  <a className="pro-btn pro-btn-primary" href="#projects">
                    {t.seeProjects} <ArrowRight size={17} aria-hidden="true" />
                  </a>
                  {/* Not ve ok CV düğmesinin hemen altında duruyor ki neyi gösterdiği şaşmasın. */}
                  <span className="pro-cv-group">
                    <span className="pro-cv-row">
                      <a className="pro-btn" href={PROFILE.cv[lang]} target="_blank" rel="noopener">
                        <FileText size={17} aria-hidden="true" /> {t.cv}
                      </a>
                      <a className="pro-btn pro-btn-icon" href={PROFILE.cv[lang]} download aria-label={t.cvDownload} title={t.cvDownload}>
                        <Download size={17} aria-hidden="true" />
                      </a>
                    </span>
                    <span className="pro-cv-note">
                      <NoteArrow />
                      <span className="pro-note">{t.heroNote}</span>
                    </span>
                  </span>
                </div>
                <ul className="pro-links pro-rise" style={rd(0.38)}>
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

            <div className="pro-stores pro-rise" style={rd(0.45)}>
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

        <hr className="pro-rule" />
        <section id="projects" className="pro-section pro-in" aria-labelledby="projects-title">
          <div className="pro-container">
            <Eyebrow n="01">{t.eyebrows.projects}</Eyebrow>
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

        <hr className="pro-rule" />
        <section id="skills" className="pro-section pro-in" aria-labelledby="skills-title">
          <div className="pro-container">
            <Eyebrow n="02">{t.eyebrows.skills}</Eyebrow>
            <h2 id="skills-title">{t.skillsTitle}</h2>
            <p className="pro-section-sub">{t.skillsSub}</p>
            <dl className="pro-skills">
              {SKILLS.map((g) => (
                <div key={g.title} className="pro-in">
                  <dt>{g.title}</dt>
                  <dd>
                    <ul className="pro-chips">
                      {g.primary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {g.also && (
                      <p className="pro-skill-also">
                        {t.alsoLabel}: {g.also[lang]}
                      </p>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <hr className="pro-rule" />
        <section id="about" className="pro-section pro-in" aria-labelledby="about-title">
          <div className="pro-container pro-prose">
            <Eyebrow n="03">{t.eyebrows.about}</Eyebrow>
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

        <hr className="pro-rule" />
        <section id="contact" className="pro-section pro-in" aria-labelledby="contact-title">
          <div className="pro-container pro-contact">
            <div>
              <Eyebrow n="04">{t.eyebrows.contact}</Eyebrow>
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
          <span className="pro-sign">{t.signOff} — Özgür</span>
          <span className="pro-clock">
            <span aria-hidden="true" />
            {t.clockLabel} {clock}
          </span>
          <span>
            © {new Date().getFullYear()} Özgür Güler ·{' '}
            <a href="https://cupnooble.itch.io/sprout-lands-asset-pack" target="_blank" rel="noopener noreferrer" className="pro-credit">
              {t.credit}
            </a>
          </span>
          {/* Dar ekranda üst çubukta yer yok; tema düğmesi burada da var. */}
          <button type="button" className="pro-footer-theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={15} aria-hidden="true" /> : <Moon size={15} aria-hidden="true" />}
            {theme === 'dark' ? t.themeToLight : t.themeToDark}
          </button>
        </div>
      </footer>

      <div aria-live="polite" role="status">
        {toast && <div className="pro-toast">{toast}</div>}
      </div>
    </div>
  );
};

export default ProfessionalPage;
