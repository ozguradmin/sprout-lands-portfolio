import React, { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Briefcase, Github, Globe, Smartphone, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { G, GAME_LANG } from '../../i18n/game';
import { labelOf, projectPath, type LinkKind } from '../../professional/data';
import { Interior, openProfessional } from '../UI/Interior';
import { Mark } from '../UI/marks';
import { CARD_BASE, CountUp, Eyebrow, Reveal } from '../UI/motionKit';
import { VILLAGE_PROJECTS, type VillageCategory, type VillageProject } from './villageProjects';

type Filter = 'all' | VillageCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: G.filterAll },
  { id: 'mobile', label: G.filterMobile },
  { id: 'web', label: G.filterWeb },
  { id: 'ai', label: G.filterAi },
];

const STORE_COUNT = 4;
const DOWNLOADS = 50000;

const linkIcon = (kind: LinkKind) =>
  kind === 'github' ? <Github size={15} aria-hidden="true" /> : kind === 'store' ? <Smartphone size={15} aria-hidden="true" /> : <Globe size={15} aria-hidden="true" />;

// Kart: panoya iğnelenmiş bir baskı gibi hafif eğik durur, üstüne gelince düzelir.
const ProjectCard: React.FC<{ project: VillageProject; index: number; onOpen: () => void }> = ({ project: p, index, onOpen }) => {
  const [ready, setReady] = useState(false);
  const tilt = [(-0.55).toFixed(2), '0.45', '-0.35'][index % 3];
  return (
    <Reveal slot={4} delay={(index % 3) * 0.05} className="h-full">
      <button
        type="button"
        onClick={onOpen}
        style={{ ['--tilt' as string]: `${tilt}deg` }}
        className={`${CARD_BASE} flex h-full w-full flex-col overflow-hidden text-left [transform:rotate(var(--tilt))] hover:[transform:rotate(0deg)_translateY(-4px)]`}
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden" style={{ background: p.image.bg }}>
          <img
            src={`${p.image.src}-720.webp`}
            width={720}
            height={450}
            alt=""
            loading="lazy"
            decoding="async"
            onLoad={() => setReady(true)}
            className={`h-full w-full object-cover transition-[opacity,transform] duration-500 group-hover:scale-[1.03] ${ready ? 'opacity-100' : 'opacity-0'}`}
          />
          <span className="absolute left-3 top-3 rounded bg-[#262b44]/75 px-1.5 py-1 font-pixel text-[8px] leading-none text-[#faf6ee]">
            {String(index + 1).padStart(2, '0')}
          </span>
          {p.metric && (
            <span className="absolute bottom-3 left-3 rounded-full bg-[#fffdf9]/95 px-2.5 py-1 text-[12px] font-bold text-[#4a2f22] shadow-sm ring-1 ring-black/5">
              {p.metric[GAME_LANG]}
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-3">
            {p.icon && <img src={p.icon} width={36} height={36} alt="" className="h-9 w-9 rounded-[23%] ring-1 ring-black/5" />}
            <div className="min-w-0">
              <h3 className="font-heading text-xl font-bold leading-tight tracking-tight">{p.name}</h3>
              <p className="text-[13px] text-[#5b6075]">{p.status[GAME_LANG]}</p>
            </div>
          </div>
          <p className="mt-3 text-[15px] leading-relaxed text-[#3c4159]">{p.summary[GAME_LANG]}</p>
          <span className="mt-auto flex items-center gap-1 pt-4 text-sm font-semibold text-[#9a5438]">
            {G.detailsCta}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </button>
    </Reveal>
  );
};

const ProjectSheet: React.FC<{ project: VillageProject; onClose: () => void }> = ({ project: p, onClose }) => {
  const still = useReducedMotion();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const lang = GAME_LANG;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[#1b1f31]/70 backdrop-blur-sm md:items-center md:p-8"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        initial={still ? false : { y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={still ? undefined : { y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#fffdf9] text-[#262b44] shadow-2xl md:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={G.close}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#fffdf9]/90 text-[#262b44] shadow ring-1 ring-black/5 transition hover:bg-white active:scale-95"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto">
          <div style={{ background: p.image.bg }}>
            <img src={`${p.image.src}.webp`} width={1200} height={750} alt="" className="w-full" />
          </div>
          <div className="p-6 md:p-8">
            <Reveal slot={1} immediate className="flex items-center gap-3">
              {p.icon && <img src={p.icon} width={44} height={44} alt="" className="h-11 w-11 rounded-[23%] ring-1 ring-black/5" />}
              <div>
                <h2 id="sheet-title" className="font-heading text-3xl font-extrabold leading-tight tracking-tight">
                  {p.name}
                </h2>
                <p className="text-sm text-[#5b6075]">{p.status[lang]}</p>
              </div>
            </Reveal>

            <Reveal slot={2} immediate>
              <p className="mt-4 text-[17px] font-medium leading-relaxed">{p.summary[lang]}</p>
            </Reveal>

            <Reveal slot={3} immediate className="mt-5 flex flex-wrap gap-2">
              {p.links.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition active:scale-[0.98] ${
                    i === 0 ? 'border-[#262b44] bg-[#262b44] text-[#faf6ee] hover:brightness-125' : 'border-[#e3d6bf] hover:border-[#262b44]/40'
                  }`}
                >
                  {linkIcon(l.kind)}
                  {labelOf(l.label, lang)}
                </a>
              ))}
            </Reveal>

            {p.details && (
              <dl className="mt-7 grid gap-5 border-t border-[#e3d6bf] pt-6">
                <Reveal slot={4} immediate as="div">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.goal}</dt>
                  <dd className="mt-1 leading-relaxed text-[#5b6075]">{p.details.goal[lang]}</dd>
                </Reveal>
                <Reveal slot={5} immediate as="div">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.built}</dt>
                  <dd className="mt-2">
                    <ul className="space-y-2">
                      {p.details.built[lang].map((b, i) => (
                        <li key={b} className="flex gap-2.5 leading-relaxed text-[#5b6075]">
                          <Mark kind="tick" immediate delay={0.35 + i * 0.08} className="mt-[0.3em] h-4 w-4 flex-none text-[#b86f50]" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </Reveal>
                <Reveal slot={6} immediate as="div">
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.result}</dt>
                  <dd className="mt-1 leading-relaxed text-[#5b6075]">{p.details.result[lang]}</dd>
                </Reveal>
                {p.stack && (
                  <Reveal slot={7} immediate as="div">
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.technologies}</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="rounded-full border border-[#e3d6bf] bg-[#f6efe2] px-2.5 py-1 text-[13px] font-semibold text-[#3c4159]">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </Reveal>
                )}
              </dl>
            )}

            {p.proSlug && (
              <a
                href={projectPath(lang, p.proSlug)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  onClose();
                  openProfessional(projectPath(lang, p.proSlug!));
                }}
                className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#9a5438] underline decoration-[#9a5438]/40 underline-offset-4 hover:decoration-[#9a5438]"
              >
                <Briefcase size={15} aria-hidden="true" />
                {G.openInPro}
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const PortfolioView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<VillageProject | null>(null);

  const projects = VILLAGE_PROJECTS.filter((p) => filter === 'all' || p.categories.includes(filter));

  const back = () => {
    sessionStorage.setItem('lastView', 'PORTFOLIO');
    setCurrentView(ViewState.HUB);
  };

  return (
    <Interior
      title={G.projectsTitle}
      markWord={G.projectsMarkWord}
      subtitle={G.projectsSub}
      eyebrow={<Eyebrow n="01">{G.eyebrowProjects}</Eyebrow>}
      onBack={back}
      note={
        <>
          <Reveal slot={3} immediate className="pointer-events-none absolute right-0 top-0 hidden w-44 lg:block">
            <p className="font-hand text-[22px] leading-tight text-[#9a5438] [rotate:-4deg]">{G.projectsNote}</p>
            <Mark kind="arrow" delay={0.9} className="ml-10 mt-1 h-14 w-20 text-[#b86f50] [rotate:12deg]" />
          </Reveal>
          <Reveal slot={3} immediate className="lg:hidden">
            <p className="mt-3 font-hand text-[21px] leading-tight text-[#9a5438] [rotate:-2deg]">{G.projectsNote}</p>
          </Reveal>
        </>
      }
    >
      {/* Rakamlar: iddia değil, sayfadaki işlerin özeti */}
      <Reveal slot={3} immediate className="mt-7 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-y border-[#e3d6bf] py-4">
        {[
          { v: VILLAGE_PROJECTS.length, s: '', label: G.statProjects },
          { v: STORE_COUNT, s: '', label: G.statStores },
          { v: DOWNLOADS, s: '+', label: G.statDownloads },
        ].map((st) => (
          <p key={st.label} className="flex items-baseline gap-2">
            <CountUp to={st.v} suffix={st.s} className="font-heading text-2xl font-extrabold tracking-tight text-[#262b44]" />
            <span className="text-[13px] text-[#5b6075]">{st.label}</span>
          </p>
        ))}
      </Reveal>

      <LayoutGroup>
        <Reveal slot={4} immediate className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label={G.projectsTitle}>
          <div className="flex flex-wrap gap-1 rounded-full border border-[#e3d6bf] bg-[#f1e7d6] p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className="relative h-9 rounded-full px-4 text-sm font-semibold text-[#3c4159] transition-colors hover:text-[#4a2f22]"
              >
                {filter === f.id && (
                  <motion.span
                    layoutId="filter-pill"
                    className="absolute inset-0 rounded-full border border-[#b86f50] bg-[#e4a672] shadow-[0_2px_0_#b86f50]"
                    transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                  />
                )}
                <span className={`relative z-10 ${filter === f.id ? 'text-[#4a2f22]' : ''}`}>{f.label}</span>
              </button>
            ))}
          </div>
          <span className="ml-auto font-pixel text-[9px] uppercase tracking-wider text-[#8d5d42]">{G.projectCount(projects.length)}</span>
        </Reveal>
      </LayoutGroup>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onOpen={() => setSelected(p)} />
        ))}
      </div>

      <AnimatePresence>{selected && <ProjectSheet project={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </Interior>
  );
};
