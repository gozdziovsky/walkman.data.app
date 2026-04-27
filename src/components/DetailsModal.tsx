import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Loader2, Edit3, Star, Calendar, Music } from 'lucide-react'; // Usunięto 'Check', 'Disc'
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

export const DetailsModal = ({ album, onClose, onUpdateSuccess }: { album: Album, onClose: () => void, onUpdateSuccess: () => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Album>({ ...album });

  const update = async () => {
    try {
      await supabase.from('albums').update({ 
        title: form.title, 
        artist: form.artist, 
        year: form.year, 
        genre: form.genre, 
        rating: form.rating, 
        status: form.status 
      }).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } catch (err) { alert('Failed to update'); }
  };

  const del = async () => {
    if (!confirm('Delete?')) return;
    setIsDeleting(true);
    await supabase.from('albums').delete().eq('id', album.id);
    onUpdateSuccess(); onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div layout className="bg-zinc-900 w-full max-w-3xl rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-t md:border border-white/10 flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
        
        <div className="relative w-full md:w-1/2 aspect-square">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
          <div className="absolute top-6 left-6 flex gap-2">
            <button onClick={() => setIsEdit(!isEdit)} className={`p-3 rounded-full backdrop-blur-md transition-all ${isEdit ? 'bg-green-500 text-black' : 'bg-black/40 text-white'}`}><Edit3 size={18} /></button>
            <button onClick={del} className="p-3 bg-red-500/20 text-red-500 rounded-full backdrop-blur-md">{isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}</button>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/40 text-white rounded-full backdrop-blur-md"><X size={18} /></button>
        </div>

        <div className="p-8 md:p-12 flex-1 relative flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-black uppercase outline-none focus:border-green-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-green-500 outline-none" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setForm({...form, rating: s})} className={(form.rating ?? 0) >= s ? 'text-yellow-500' : 'text-zinc-800'}>
                      <Star size={20} fill={(form.rating ?? 0) >= s ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
                <button onClick={update} className="w-full py-4 bg-green-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest">Save Changes</button>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-green-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-2">{album.artist}</p>
                <h2 className="text-4xl font-black uppercase tracking-tighter leading-none mb-6">{album.title}</h2>
                <div className="flex flex-wrap gap-2 mb-8">
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Calendar size={12} /> {album.year ?? 'N/A'}</div>
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Music size={12} /> {album.genre ?? 'N/A'}</div>
                  <div className="px-4 py-2 bg-green-500/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-green-500 border border-green-500/20">{album.format}</div>
                </div>
                <div className="flex gap-1 mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < (album.rating ?? 0) ? 'text-yellow-500' : 'text-zinc-800'} fill={i < (album.rating ?? 0) ? 'currentColor' : 'none'} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="black" /> Spotify</button>
                  <button className="py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border border-white/5"><MonitorPlay size={14} /> Video</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
