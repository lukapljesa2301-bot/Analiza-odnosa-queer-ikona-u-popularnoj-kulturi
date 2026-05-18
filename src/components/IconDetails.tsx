import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QueerIcon } from '../types';
import { X, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  icon: QueerIcon | null;
  onClose: () => void;
  allIcons: QueerIcon[];
  onSelectIcon: (icon: QueerIcon) => void;
}

const IconDetails: React.FC<Props> = ({ icon, onClose, allIcons, onSelectIcon }) => {
  return (
    <AnimatePresence>
      {icon && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border-l border-zinc-800 p-10 overflow-y-auto z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] no-scrollbar"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 transition-colors group"
          >
            <X className="w-6 h-6 text-zinc-600 group-hover:text-zinc-300" />
          </button>

          <header className="mb-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-rose-500 mb-3 block">
              Klasifikacija: {icon.category}
            </span>
            <h2 className="text-5xl font-serif font-black text-white tracking-tight leading-none mb-6">
              {icon.name}
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-rose-500 to-transparent" />
          </header>

          <section className="mb-12">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-zinc-500 mb-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-500" /> Biografska Bilješka
            </h3>
            <div className="text-zinc-300 leading-relaxed space-y-4 text-base font-normal opacity-90 font-serif">
              <ReactMarkdown>{icon.description}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-mono font-bold text-zinc-500 mb-6 flex items-center gap-2">
              <ExternalLink className="w-3 h-3 text-emerald-500" /> Relacijske Veze
            </h3>
            <div className="space-y-4">
              {icon.connections.map((conn, idx) => {
                const target = allIcons.find(i => i.id === conn.targetId);
                if (!target) return null;
                return (
                  <button 
                    key={idx} 
                    onClick={() => onSelectIcon(target)}
                    className="w-full text-left p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-900/80 transition-all group flex gap-4 items-start"
                  >
                    <div 
                      className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-white font-black italic shadow-lg"
                      style={{ backgroundColor: CATEGORY_COLORS[target.category] || '#444' }}
                    >
                      {target.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate pr-2">
                          {target.name}
                        </div>
                        <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <div className="text-[10px] text-zinc-500 leading-relaxed italic line-clamp-2">
                        {conn.reason}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IconDetails;
