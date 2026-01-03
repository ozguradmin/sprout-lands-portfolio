import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ViewState, Project } from '../../types';
import { PROJECTS } from '../../constants';
import { ArrowLeft, ExternalLink, Github, Layers, Zap, Smartphone, Gamepad, X } from 'lucide-react';

export const PortfolioView: React.FC = () => {
  const { setCurrentView } = useApp();
  const [filter, setFilter] = useState<'Tümü' | 'Web' | 'Oyun'>('Tümü');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const getCategoryFilter = (cat: string) => {
    switch (cat) {
      case 'Tümü': return 'All';
      case 'Web': return 'Web';
      case 'Mobil': return 'Mobile';
      case 'Oyun': return 'Oyun';
      case 'Tasarım': return 'Design';
      default: return 'All';
    }
  };

  const currentFilterEnglish = getCategoryFilter(filter);
  const filteredProjects = PROJECTS.filter(p => currentFilterEnglish === 'All' || p.category === currentFilterEnglish);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Web': return <Layers size={14} />;
      case 'Mobile': return <Smartphone size={14} />;
      case 'Oyun': return <Gamepad size={14} />;
      default: return <Zap size={14} />;
    }
  };

  return (
    // SCROLL FIX: h-full ve overflow-y-auto eklendi
    <div className="h-full w-full overflow-y-auto bg-primary pt-12 px-4 md:px-12 pb-12">
      <div className="max-w-7xl mx-auto min-h-min">
        {/* Header Section */}
        <header className="mb-12">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => {
              sessionStorage.setItem('lastView', 'PORTFOLIO');
              setCurrentView(ViewState.HUB);
            }}
            className="flex items-center gap-2 text-gray-400 hover:text-accent transition-all mb-6 group text-sm font-medium"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-mono text-xs uppercase tracking-widest">Geri Dön</span>
          </motion.button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-white mb-4">
                Projelerim
              </h1>
            </motion.div>

            {/* Filter Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex overflow-x-auto pb-2 md:pb-0 gap-2 no-scrollbar"
            >
              <div className="flex gap-2 bg-secondary/50 p-1 rounded-xl backdrop-blur-sm border border-white/5">
                {['Tümü', 'Web', 'Oyun'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat as any)}
                    className={`px-4 py-2 rounded-lg text-xs font-medium transition-all relative whitespace-nowrap ${filter === cat ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {filter === cat && (
                      <motion.div
                        layoutId="activeFilter"
                        className="absolute inset-0 bg-accent rounded-lg shadow-lg shadow-accent/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </header>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-20"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                onClick={() => setSelectedProject(project)}
                className="group relative bg-secondary rounded-2xl overflow-hidden border border-white/5 shadow-lg cursor-pointer aspect-[4/5] md:aspect-[3/4]"
              >
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Siyah Katman (Overlay) */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute top-4 left-4 z-20">
                  <div className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
                    {getCategoryIcon(project.category)}
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">{project.category}</span>
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-20">
                  <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg group-hover:border-accent/30 transition-colors">
                    <h3 className="text-lg font-heading font-bold text-white mb-1 group-hover:text-accent transition-colors">{project.title}</h3>
                    <p className="text-gray-300 text-xs line-clamp-2 mb-3">{project.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {project.techStack.slice(0, 3).map(s => (
                        <span key={s} className="px-2 py-1 bg-black/30 rounded text-[10px] font-mono text-gray-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-8 bg-black/90 backdrop-blur-sm overflow-hidden"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#151b26] w-full max-w-5xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row"
            >
              <div className="md:w-1/2 h-64 md:h-auto relative bg-black shrink-0">
                <img
                  src={selectedProject.thumbnail}
                  alt={selectedProject.title}
                  className="w-full h-full object-cover opacity-80"
                />
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full text-white md:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="md:w-1/2 p-6 md:p-10 overflow-y-auto">
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hidden md:block"
                >
                  <X size={20} />
                </button>

                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-4 border border-accent/20">
                    {getCategoryIcon(selectedProject.category)}
                    {selectedProject.category}
                  </span>
                  <h2 className="text-3xl font-heading font-bold text-white mb-4">{selectedProject.title}</h2>
                  <p className="text-gray-300 leading-relaxed text-sm">
                    {selectedProject.details}
                  </p>
                </div>

                <div className="space-y-6 pb-8 md:pb-0">
                  {selectedProject.techStack.length > 0 && (
                    <div>
                      <h4 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-3">Teknolojiler</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.techStack.map(s => (
                          <span key={s} className="px-3 py-1.5 bg-white/5 text-gray-300 border border-white/5 rounded-lg text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    {selectedProject.link && selectedProject.link !== '#' ? (
                      <a
                        href={selectedProject.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-accent text-white py-3 rounded-xl font-bold text-sm tracking-wide hover:brightness-110 transition-all"
                      >
                        <ExternalLink size={18} /> CANLI ÖNİZLEME
                      </a>
                    ) : (
                      <button disabled className="flex-1 flex items-center justify-center gap-2 bg-gray-700 text-gray-400 py-3 rounded-xl font-bold text-sm tracking-wide cursor-not-allowed">
                        Çok Yakında
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
