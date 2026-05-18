import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Info } from 'lucide-react';
import { QueerIcon } from '../types';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingIcons: QueerIcon[];
  onIconAdded: (icon: QueerIcon) => void;
}

const AddIconModal: React.FC<Props> = ({ isOpen, onClose, existingIcons, onIconAdded }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<QueerIcon['category']>('Music');
  const [description, setDescription] = useState('');
  const [selectedConnections, setSelectedConnections] = useState<{ targetId: string; reason: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setSubmitting(true);
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newIcon = {
      id,
      name,
      category,
      description,
      connections: selectedConnections,
      createdBy: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'icons'), newIcon);
      onIconAdded({ ...newIcon, createdAt: new Date() } as any);
      onClose();
      // Reset form
      setName('');
      setCategory('Music');
      setDescription('');
      setSelectedConnections([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'icons');
    } finally {
      setSubmitting(false);
    }
  };

  const addConnection = () => {
    setSelectedConnections([...selectedConnections, { targetId: existingIcons[0]?.id || '', reason: '' }]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-6 h-6 text-zinc-500" />
            </button>

            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8">
              Dodaj Novu Ikonu
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block">Ime</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors"
                  placeholder="npr. Sylvester"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block">Kategorija</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors appearance-none"
                >
                  <option value="Music">Music</option>
                  <option value="Activism">Activism</option>
                  <option value="Drag">Drag</option>
                  <option value="Art">Art</option>
                  <option value="Film/TV">Film/TV</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2 block">Opis</label>
                <textarea
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-rose-500 outline-none transition-colors h-32 resize-none"
                  placeholder="Ukratko o njihovom značaju..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Povezanosti</label>
                  <button 
                    type="button"
                    onClick={addConnection}
                    className="text-[10px] font-bold uppercase tracking-widest text-rose-500 flex items-center gap-1 hover:text-rose-400"
                  >
                    <Plus className="w-3 h-3" /> Dodaj vezu
                  </button>
                </div>
                
                <div className="space-y-3">
                  {selectedConnections.map((conn, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <select
                        value={conn.targetId}
                        onChange={e => {
                          const next = [...selectedConnections];
                          next[idx].targetId = e.target.value;
                          setSelectedConnections(next);
                        }}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                      >
                        {existingIcons.map(icon => (
                          <option key={icon.id} value={icon.id}>{icon.name}</option>
                        ))}
                      </select>
                      <input
                        placeholder="Razlog veze..."
                        value={conn.reason}
                        onChange={e => {
                          const next = [...selectedConnections];
                          next[idx].reason = e.target.value;
                          setSelectedConnections(next);
                        }}
                        className="flex-[2] bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white"
                      />
                      <button 
                        type="button"
                        onClick={() => setSelectedConnections(selectedConnections.filter((_, i) => i !== idx))}
                        className="p-2 text-zinc-500 hover:text-rose-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                disabled={submitting}
                className="w-full bg-rose-500 hover:bg-rose-400 text-black font-black uppercase tracking-[0.3em] py-4 rounded-2xl transition-all disabled:opacity-50"
              >
                {submitting ? 'Slanje...' : 'Spremi Ikonu'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddIconModal;
