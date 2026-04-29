import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit3, Save, Play, MonitorPlay, ListMusic, Calendar, Music, Star } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Album } from '../../../types/album';

export const DigitalDetailsModal = ({ album, onClose, onUpdateSuccess }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [form, setForm] = useState<Album>(album);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums').update(form).eq('id', album.id);
      onUpdateSuccess(); 
      setIsEdit(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${album.title}"?`)) {
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess();
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12" onClick={onClose}>
      <motion.div className="bg-zinc-900 w-full max-w-5xl rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh] border border-white/5 relative" onClick={e => e.stopPropagation()}>
        
        {/* Cover side */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 group">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button onClick={() => setShowTracks(!showTracks)} className="p-4 bg-white text-black rounded-full shadow-2xl active:scale-90 transition-transform">
              <ListMusic size={24} />
            </button>
          </div>
          <button onClick={onClose} className="absolute top-6 left-6 p-3 bg-black/50 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* Content side */}
        <div className="p-10 md:p-16 flex-1 overflow-y-auto no-scrollbar text-left relative">
          <AnimatePresence mode="wait">
            {showTracks ? (
              <motion.div key="tracks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="h-full">
                <button onClick={() => setShowTracks(false)} className="mb-6 flex items-center gap-2 text-brand font-black uppercase text-[10px] tracking-widest"><X size={14}/> Back to details</button>
                <div className="text-zinc-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{album.tracks || 'No tracklist available'}</div>
              </motion.div>
            ) : isEdit ? (
              <motion.div key="edit" className="space-y-6">
                <input className="w-full bg-zinc-800 border border-white/10 rounded-xl p-4 text-sm font-bold" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                <input className="w-full bg-zinc-800 border border-white/10 rounded-xl p-4 text-sm font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="flex-1 py-4 bg-brand text-black rounded-xl font-black uppercase text-[10px]">{loading ? 'Saving...' : 'Save'}</button>
                  <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 rounded-xl font-black uppercase text-[10px]">Cancel</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" className="space-y-8">
                <div>
                  <p className="text-brand font-black uppercase text-[10px] tracking-[0.3em] italic mb-2">{album.artist}</p>
                  <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-none mb-6">{album.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[9px] font-black uppercase flex items-center gap-2"><Calendar size={12} className="text-brand"/> {album.year}</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-brand/30 rounded-full text-[9px] font-black uppercase text-brand">{album.format}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="py-5 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="black"/> Spotify</button>
                  <button className="py-5 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><MonitorPlay size={14}/> YouTube</button>
                </div>

                <div className="pt-8 border-t border-white/5 flex gap-4">
                  <button onClick={() => setIsEdit(true)} className="text-zinc-500 hover:text-white transition-colors"><Edit3 size={18}/></button>
                  <button onClick={handleDelete} className="text-zinc-500 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};