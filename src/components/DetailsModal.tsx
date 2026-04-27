import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Loader2, Edit3, Star, Calendar, Music, ExternalLink } from 'lucide-react';
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
        status: form.status,
        spotify_url: form.spotify_url,
        youtube_url: form.youtube_url,
        tracks: form.tracks
      }).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } catch (err) { alert('Update failed'); }
  };

  const del = async () => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    setIsDeleting(true);
    try {
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess(); onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const openLink = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div layout className="bg-zinc-900 w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-t md:border border-white/10 flex flex-col md:flex-row max-h-[95vh]" onClick={e => e.stopPropagation()}>
        
        {/* COVER SIDE */}
        <div className="relative w-full md:w-[45%] aspect-square md:aspect-auto">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt={album.title} />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent md:bg-gradient-to-r" />
          
          <div className="absolute top-6 left-6 flex gap-2">
            <button onClick={() => setIsEdit(!isEdit)} className={`p-4 rounded-full backdrop-blur-md transition-all ${isEdit ? 'bg-green-500 text-black' : 'bg-black/40 text-white'}`}><Edit3 size={18} /></button>
            <button onClick={del} className="p-4 bg-red-500/20 text-red-500 rounded-full backdrop-blur-md hover:bg-red-500 hover:text-white transition-all">{isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}</button>
          </div>
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/40 text-white rounded-full backdrop-blur-md transition-transform active:scale-90">
            <X size={18} />
          </button>
        </div>

        {/* INFO SIDE */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xl font-black uppercase outline-none focus:border-green-500" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Album Title" />
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-green-500 outline-none" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} placeholder="Artist" />
                </div>
                
                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Streaming Links</p>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none" value={form.spotify_url || ''} onChange={e => setForm({...form, spotify_url: e.target.value})} placeholder="Spotify URL" />
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold outline-none" value={form.youtube_url || ''} onChange={e => setForm({...form, youtube_url: e.target.value})} placeholder="YouTube URL" />
                </div>

                <div className="space-y-3">
                  <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest">Tracks</p>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold min-h-[120px] outline-none" value={form.tracks || ''} onChange={e => setForm({...form, tracks: e.target.value})} placeholder="1. Track..." />
                </div>

                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onClick={() => setForm({...form, rating: s})} className={(form.rating ?? 0) >= s ? 'text-yellow-500' : 'text-zinc-800'}>
                      <Star size={20} fill={(form.rating ?? 0) >= s ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                <button onClick={update} className="w-full py-4 bg-green-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Save Changes</button>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <header className="mb-8">
                  <p className="text-green-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-2">{album.artist}</p>
                  <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">{album.title}</h2>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < (album.rating ?? 0) ? 'text-yellow-500' : 'text-zinc-800'} fill={i < (album.rating ?? 0) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </header>
                
                <div className="flex flex-wrap gap-2 mb-10">
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Calendar size={12} /> {album.year ?? 'N/A'}</div>
                  <div className="px-4 py-2 bg-zinc-800 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2"><Music size={12} /> {album.genre ?? 'N/A'}</div>
                  <div className="px-4 py-2 bg-zinc-900 border border-green-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-green-500">{album.format}</div>
                </div>

                {album.tracks && (
                  <div className="mb-10 bg-white/[0.02] rounded-[2rem] p-6 border border-white/5">
                    <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4 flex items-center gap-2"><Music size={12} /> Tracklist</p>
                    <div className="text-[11px] font-medium text-zinc-400 leading-relaxed whitespace-pre-line font-mono">
                      {album.tracks}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sticky bottom-0 pt-4 bg-zinc-900 md:bg-transparent">
                  <button 
                    disabled={!album.spotify_url}
                    onClick={() => openLink(album.spotify_url)}
                    className={`py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${album.spotify_url ? 'bg-white text-black shadow-xl' : 'bg-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed'}`}
                  >
                    <Play size={14} fill="currentColor" /> Spotify {album.spotify_url && <ExternalLink size={10} />}
                  </button>
                  <button 
                    disabled={!album.youtube_url}
                    onClick={() => openLink(album.youtube_url)}
                    className={`py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 border transition-all active:scale-95 ${album.youtube_url ? 'bg-zinc-800 text-white border-white/10' : 'bg-zinc-800 text-zinc-600 border-transparent opacity-50'}`}
                  >
                    <MonitorPlay size={14} /> YouTube {album.youtube_url && <ExternalLink size={10} />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
