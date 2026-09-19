import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Briefcase, Github, Globe, Smartphone, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ViewState } from '../../types';
import { G, GAME_LANG } from '../../i18n/game';
import { labelOf, projectPath, type LinkKind } from '../../professional/data';
import { Interior, openProfessional } from '../UI/Interior';
import { VILLAGE_PROJECTS, type VillageCategory, type VillageProject } from './villageProjects';

type Filter = 'all' | VillageCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: G.filterAll },
  { id: 'mobile', label: G.filterMobile },
  { id: 'web', label: G.filterWeb },
  { id: 'ai', label: G.filterAi },
];

const linkIcon = (kind: LinkKind) =>
  kind === 'github' ? <Github size={15} aria-hidden="true" /> : kind === 'store' ? <Smartphone size={15} aria-hidden="true" /> : <Globe size={15} aria-hidden="true" />;

const ProjectCard: React.FC<{ project: VillageProject; onOpen: () => void }> = ({ project: p, onOpen }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group flex w-full flex-col overflow-hidden rounded-2xl border border-[#e3d6bf] bg-[#fffdf9] text-left shadow-[0_1px_2px_rgba(35,40,64,0.05),0_6px_20px_rgba(35,40,64,0.05)] transition hover:-translate-y-0.5 hover:border-[#b86f50]/60 hover:shadow-[0_10px_30px_rgba(35,40,64,0.10)] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f6fd6]"
  >
    <div className="aspect-[16/10] w-full overflow-hidden" style={{ background: p.image.bg }}>
      <img
        src={`${p.image.src}-720.webp`}
        width={720}
        height={450}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
      />
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
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </div>
  </button>
);

const ProjectSheet: React.FC<{ project: VillageProject; onClose: () => void }> = ({ project: p, onClose }) => {
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
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-[#fffdf9] text-[#262b44] shadow-2xl md:rounded-3xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={G.close}
          className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#fffdf9]/90 text-[#262b44] shadow ring-1 ring-black/5 hover:bg-white"
        >
          <X size={20} />
        </button>
        <div className="overflow-y-auto">
          <div style={{ background: p.image.bg }}>
            <img src={`${p.image.src}.webp`} width={1200} height={750} alt="" className="w-full" />
          </div>
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3">
              {p.icon && <img src={p.icon} width={44} height={44} alt="" className="h-11 w-11 rounded-[23%] ring-1 ring-black/5" />}
              <div>
                <h2 id="sheet-title" className="font-heading text-3xl font-extrabold leading-tight tracking-tight">
                  {p.name}
                </h2>
                <p className="text-sm text-[#5b6075]">{p.status[lang]}</p>
              </div>
            </div>
            <p className="mt-4 text-[17px] font-medium leading-relaxed">{p.summary[lang]}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.links.map((l, i) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-semibold transition ${
                    i === 0 ? 'border-[#262b44] bg-[#262b44] text-[#faf6ee] hover:brightness-125' : 'border-[#e3d6bf] hover:border-[#262b44]/40'
                  }`}
                >
                  {linkIcon(l.kind)}
                  {labelOf(l.label, lang)}
                </a>
              ))}
            </div>

            {p.details && (
              <dl className="mt-7 grid gap-5 border-t border-[#e3d6bf] pt-6">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.goal}</dt>
                  <dd className="mt-1 leading-relaxed text-[#5b6075]">{p.details.goal[lang]}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.built}</dt>
                  <dd className="mt-1">
                    <ul className="space-y-1.5">
                      {p.details.built[lang].map((b) => (
                        <li key={b} className="relative pl-4 leading-relaxed text-[#5b6075] before:absolute before:left-0 before:top-[0.62em] before:h-1.5 before:w-1.5 before:bg-[#b86f50]">
                          {b}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.result}</dt>
                  <dd className="mt-1 leading-relaxed text-[#5b6075]">{p.details.result[lang]}</dd>
                </div>
                {p.stack && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-wider text-[#9a5438]">{G.technologies}</dt>
                    <dd className="mt-1 font-medium text-[#3c4159]">{p.stack.join(' · ')}</dd>
                  </div>
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
    <Interior title={G.projectsTitle} subtitle={G.projectsSub} onBack={back}>
      <div className="mt-7 flex flex-wrap items-center gap-2" role="group" aria-label={G.projectsTitle}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            aria-pressed={filter === f.id}
            className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
              filter === f.id ? 'border-[#b86f50] bg-[#e4a672] text-[#4a2f22] shadow-[0_2px_0_#b86f50]' : 'border-[#e3d6bf] bg-[#fffdf9] text-[#3c4159] hover:border-[#b86f50]/50'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-[#5b6075]">{G.projectCount(projects.length)}</span>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onOpen={() => setSelected(p)} />
        ))}
      </div>

      <AnimatePresence>{selected && <ProjectSheet project={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
    </Interior>
  );
};
