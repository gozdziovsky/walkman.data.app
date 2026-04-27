import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Edit3, Star, Calendar, Music } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

export const DetailsModal = ({ album, onClose, onUpdateSuccess }: { album: Album, onClose: () => void, onUpdateSuccess: () => void }) => {
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Album>({ ...album });

  const update = async () => {
    await supabase.from('albums').update({ ...form }).eq('id', album.id);
    onUpdateSuccess(); setIsEdit(false);
  };

  const del = async () => {
    if (confirm('Delete?')) {
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess(); onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div layout className="bg-zinc-900 w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden border-t border-white/10 flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="w-full md:w-1/2 aspect-square relative">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
          <div className="absolute top-4 left-4 flex gap-2">
            <button onClick={() => setIsEdit(!isEdit)} className="p-3 bg-black/40 rounded-full text-white"><Edit3 size={18} /></button>
            <button onClick={del} className="p-3 bg-red-500/20 rounded-full text-red-500"><Trash2 size={18} /></button>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-3 bg-black/40 rounded-full text-white"><X size={18} /></button>
        </div>

        <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <div className="space-y-4">
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                <button onClick={update} className="w-full py-3 bg-green-500 text-black rounded-xl font-bold">Save</button>
              </div>
            ) : (
              <div>
                <p className="text-green-500 font-bold uppercase tracking-widest text-[10px] mb-2">{album.artist}</p>
                <h2 className="text-3xl font-black uppercase mb-6 leading-tight">{album.title}</h2>
                <div className="flex gap-2 mb-8">
                  <div className="px-3 py-1 bg-zinc-800 rounded text-[10px] font-bold uppercase flex items-center gap-2"><Calendar size={12} /> {album.year}</div>
                  <div className="px-3 py-1 bg-zinc-800 rounded text-[10px] font-bold uppercase flex items-center gap-2"><Music size={12} /> {album.genre}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => album.spotify_url && window.open(album.spotify_url, '_blank')} className="flex-1 py-4 bg-white text-black rounded-2xl font-bold uppercase text-[10px] flex items-center justify-center gap-2"><Play size={14} fill="black" /> Spotify</button>
                  <button onClick={() => album.youtube_url && window.open(album.youtube_url, '_blank')} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-bold uppercase text-[10px] flex items-center justify-center gap-2"><MonitorPlay size={14} /> YouTube</button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
