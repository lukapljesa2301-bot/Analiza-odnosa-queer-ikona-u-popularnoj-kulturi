/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import NetworkGraph from './components/NetworkGraph';
import IconDetails from './components/IconDetails';
import { QueerIcon } from './types';
import { Sparkles, Info } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [icons, setIcons] = useState<QueerIcon[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<QueerIcon | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/icons', { method: 'POST' });
        const data = await response.json();
        if (Array.isArray(data)) {
          setIcons(data);
        } else {
          console.error('API did not return an array:', data);
          setIcons([]);
        }
      } catch (error) {
        console.error('Failure fetching icons:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-50 flex flex-col font-sans selection:bg-rose-500/30 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('/src/assets/images/queer_genealogy_synthesis_1779112931728.png')] bg-cover bg-center opacity-[0.2] saturate-[0.8] brightness-75" />
        <div className="artistic-blur -top-32 -left-32 bg-slate-700/40" />
        <div className="artistic-blur top-1/2 -right-32 bg-indigo-900/30" />
        <div className="artistic-blur -bottom-32 left-1/4 bg-blue-950/40 w-[600px] h-[600px]" />
      </div>

      {/* Header */}
      <header className="relative p-8 flex justify-between items-end border-b border-zinc-800 z-40 bg-zinc-950/50 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-serif font-black tracking-tight uppercase leading-none text-white drop-shadow-2xl">
            Genealogija Kulture
          </h1>
          <p className="text-zinc-500 mt-2 font-mono tracking-widest uppercase text-[10px] italic">
            Mreža transgeneracijskih utjecaja i sjećanja
          </p>
        </motion.div>

        <div className="hidden md:flex flex-col gap-1 items-end font-mono">
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">Arhiva Sustava</span>
          <span className="text-sm text-zinc-400">v2.1 / 2026</span>
        </div>
      </header>

      {/* Main Graph Area */}
      <main className="flex-1 relative z-10">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="w-16 h-16 border-2 border-zinc-800 border-t-rose-500 rounded-full animate-spin" />
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">
                Generiranje mreže povezanosti...
              </p>
            </div>
          </div>
        ) : (
          <NetworkGraph 
            icons={icons} 
            onSelectIcon={setSelectedIcon} 
            selectedIconId={selectedIcon?.id}
          />
        )}
      </main>

      {/* Details Side Panel */}
      <IconDetails 
        icon={selectedIcon} 
        onClose={() => setSelectedIcon(null)} 
        allIcons={icons}
        onSelectIcon={setSelectedIcon}
      />

      {/* Footer Info */}
      <div className="fixed bottom-8 right-8 z-40 md:block hidden">
        <div className="group relative">
          <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center border border-white/10 backdrop-blur-md">
            <Info className="w-6 h-6 text-white/50" />
          </button>
          <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-[#111] border border-white/10 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <p className="text-xs text-white/60 leading-relaxed">
              Povucite krugove za interakciju. Koristite kotačić miša za zoom. Kliknite na ikonu za više detalja o njihovom nasljeđu i povezanosti s drugima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
