import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Edit3, Save, ImageIcon, Search, Loader2, Calendar, Music, ListMusic, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

interface DetailsModalProps {
  album: Album;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export const DetailsModal = ({ album, onClose, onUpdateSuccess }: DetailsModalProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  
  const [form, setForm] = useState<Album>({ ...album });
  const [imagePreview, setImagePreview] = useState<string | null>(album.coverUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // NAPRAWIONE URL-E WYSZUKIWANIA
  const getSpotifySearchUrl = () => {
    if (album.spotify_url) return album.spotify_url;
    const searchQuery = encodeURIComponent(`${album.artist} ${album.title}`);
    return `https://open.spotify.com/search/${searchQuery}`;
  };

  const getYoutubeSearchUrl = () => {
    if (album.youtube_url) return album.youtube_url;
    const searchQuery = encodeURIComponent(`${album.artist} ${album.title} full album`);
    return `https://www.youtube.com/results?search_query=${searchQuery}`;
  };

  const handleSearchCover = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`);
      const data = await res.json();
      setResults(data.results || []);
    } finally { setSearching(false); }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `covers/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from('albums').update({ ...form, coverUrl: finalUrl }).eq('id', album.id);
      if (error) throw error;
      onUpdateSuccess();
      setIsEdit(false);
    } catch (err: any) {
      alert(err.message);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm(`Usunąć "${album.title}"?`)) {
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess();
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" 
      onClick={onClose}
    >
      <motion.div 
        layout 
        className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden border-t border-white/10 flex flex-col md:flex-row max-h-[95vh] shadow-2xl relative" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* LEWA STRONA: OKŁADKA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-800 shrink-0">
          <img 
            src={imagePreview || album.coverUrl} 
            className={`w-full h-full object-cover transition-all duration-500 ${isEdit ? 'opacity-40 blur-sm' : 'opacity-100'}`} 
            alt="" 
          />
          
          {isEdit && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-4">
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="bg-white text-black px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2"
              >
                <ImageIcon size={16} /> Upload File
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                if(e.target.files?.[0]) {
                  setImageFile(e.target.files[0]);
                  setImagePreview(URL.createObjectURL(e.target.files[0]));
                }
              }} />
            </div>
          )}

          {!isEdit && (
            <div className="absolute top-6 left-6 flex gap-3">
              <button onClick={() => setIsEdit(true)} className="p-4 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all active:scale-90 shadow-xl">
                <Edit3 size={20} />
              </button>
              <button onClick={handleDelete} className="p-4 bg-red-500/20 backdrop-blur-xl rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl">
                <Trash2 size={20} />
              </button>
            </div>
          )}
          <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-xl rounded-full text-white active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* PRAWA STRONA: DANE */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar bg-zinc-900 text-white">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-10">
                <h3 className="text-xl font-black uppercase italic text-green-500">Edit Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Artist</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Title</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Year</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Genre</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Rating</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Manual Spotify Link (Optional)</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono outline-none" value={form.spotify_url || ''} onChange={e => setForm({...form, spotify_url: e.target.value})} placeholder="https://open.spotify.com/..." />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px]">Cancel</button>
                  <button onClick={handleUpdate} disabled={loading} className="flex-[2] py-4 bg-green-500 text-black rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />} Update
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  <p className="text-green-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic leading-none">{album.artist}</p>
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.85] tracking-tighter italic mb-8">{album.title}</h2>
                    {album.rating > 0 && (
                      <div className="flex items-center gap-1 bg-green-500 text-black px-3 py-1 rounded-lg shrink-0 mt-2">
                        <Star size={12} fill="black" />
                        <span className="text-xs font-black">{album.rating}/10</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Calendar size={14} className="text-green-500" /> {album.year}</div>
                    <div className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Music size={14} className="text-green-500" /> {album.genre}</div>
                    <div className="px-4 py-2 bg-zinc-800 border border-green-500/20 rounded-full text-[10px] font-black uppercase text-green-500">{album.format}</div>
                  </div>
                </div>

                {album.tracks && (
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500"><ListMusic size={14} /><h4 className="text-[10px] font-black uppercase tracking-widest">Tracklist</h4></div>
                    <div className="bg-black/20 rounded-3xl p-6 border border-white/5 text-zinc-400 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{album.tracks}</div>
                  </div>
                )}

                {/* PRZYCISKI Z POPRAWIONYMI LINKAMI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <button 
                    onClick={() => window.open(getSpotifySearchUrl(), '_blank')} 
                    className="py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-green-500 transition-colors shadow-xl active:scale-95 transition-transform"
                  >
                    <Play size={18} fill="black" /> 
                    {album.spotify_url ? 'Open Spotify' : 'Search Spotify'}
                  </button>
                  <button 
                    onClick={() => window.open(getYoutubeSearchUrl(), '_blank')} 
                    className="py-5 bg-zinc-800 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-red-600 transition-all active:scale-95 transition-transform"
                  >
                    <MonitorPlay size={18} /> 
                    {album.youtube_url ? 'Watch YouTube' : 'Search YouTube'}
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
