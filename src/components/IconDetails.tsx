import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QueerIcon } from '../types';
import { X, Sparkles, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  icon: QueerIcon | null;
  onClose: () => void;
  allIcons: QueerIcon[];
}

const IconDetails: React.FC<Props> = ({ icon, onClose, allIcons }) => {
  return (
    <AnimatePresence>
      {icon && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-zinc-950/90 backdrop-blur-2xl border-l border-zinc-800 p-10 overflow-y-auto z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
        >
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 transition-colors group"
          >
            <X className="w-6 h-6 text-zinc-600 group-hover:text-zinc-300" />
          </button>

          <header className="mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-3 block">
              {icon.category}
            </span>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none mb-6 italic uppercase skew-x-[-4deg]">
              {icon.name}
            </h2>
            <div className="h-px w-16 bg-gradient-to-r from-rose-500 to-transparent" />
          </header>

          <section className="mb-12">
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-6 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-rose-500" /> O Ikoni
            </h3>
            <div className="text-zinc-300 leading-relaxed space-y-4 text-base font-medium opacity-90">
              <ReactMarkdown>{icon.description}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-500 mb-6 flex items-center gap-2">
              <ExternalLink className="w-3 h-3 text-emerald-500" /> Kulturna Mreža
            </h3>
            <div className="space-y-3">
              {icon.connections.map((conn, idx) => {
                const target = allIcons.find(i => i.id === conn.targetId);
                return (
                  <div key={idx} className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all group cursor-default">
                    <div className="font-bold text-zinc-100 mb-2 group-hover:text-amber-400 transition-colors">
                      {target ? target.name : conn.targetId}
                    </div>
                    <div className="text-xs text-zinc-500 leading-relaxed italic">
                      {conn.reason}
                    </div>
                  </div>
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
