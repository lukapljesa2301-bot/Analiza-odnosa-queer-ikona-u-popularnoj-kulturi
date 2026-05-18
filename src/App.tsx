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
        <div className="artistic-blur -top-24 -left-24 bg-purple-600" />
        <div className="artistic-blur top-1/2 -right-24 bg-rose-500" />
        <div className="artistic-blur -bottom-24 left-1/3 bg-indigo-600 w-[500px] h-[500px]" />
      </div>

      {/* Header */}
      <header className="relative p-8 flex justify-between items-end border-b border-zinc-800 z-40 bg-zinc-950/50 backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-rose-400 to-amber-300">
            Kvir Ikonografija
          </h1>
          <p className="text-zinc-400 mt-2 font-medium tracking-widest uppercase text-[10px] italic">
            Mapa kulturnog utjecaja i međusobnih veza
          </p>
        </motion.div>

        <div className="hidden md:flex flex-col gap-1 items-end">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Zadnje ažuriranje</span>
          <span className="text-sm font-mono text-zinc-300">2026 / Q3</span>
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
