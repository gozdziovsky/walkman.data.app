import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Edit3, Save, ImageIcon, Loader2, Calendar, Music, ListMusic, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

interface DetailsModalProps {
  album: Album;
  onClose: () => void;
  onUpdateSuccess: () => void;
  onArtistClick: (name: string) => void; // Nowy prop
}

export const DetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick }: DetailsModalProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Album>({ ...album });
  const [imagePreview, setImagePreview] = useState<string | null>(album.coverUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- LOGIKA PARSOWANIA ARTYSTÓW ---
  const renderArtists = (artistString: string) => {
    const exceptions = ["Tyler, The Creator", "Earth, Wind & Fire", "Blood, Sweat & Tears"];
    
    let tempPath = artistString;
    const placeholder = "##EX##";
    const foundExceptions: string[] = [];

    // 1. Zabezpieczamy wyjątki
    exceptions.forEach((ex, i) => {
      if (tempPath.includes(ex)) {
        tempPath = tempPath.replace(ex, `${placeholder}${i}`);
        foundExceptions[i] = ex;
      }
    });

    // 2. Tniemy po przecinkach i czyścimy spacje
    return tempPath.split(',').map((part, index, array) => {
      let finalName = part.trim();
      
      // 3. Przywracamy wyjątki
      if (finalName.includes(placeholder)) {
        const id = parseInt(finalName.replace(placeholder, ""));
        finalName = foundExceptions[id];
      }

      if (!finalName) return null;

      return (
        <span key={index} className="inline-flex items-center">
          <button 
            onClick={() => onArtistClick(finalName)}
            className="hover:text-green-500 transition-colors cursor-pointer border-b border-transparent hover:border-green-500/30"
          >
            {finalName}
          </button>
          {index < array.length - 1 && <span className="mr-2">,</span>}
        </span>
      );
    });
  };

  const getSpotifySearchUrl = () => {
    if (album.spotify_url) return album.spotify_url;
    return `https://open.spotify.com/search/${encodeURIComponent(album.artist + " " + album.title)}`;
  };

  const getYoutubeSearchUrl = () => {
    if (album.youtube_url) return album.youtube_url;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + " " + album.title + " full album")}`;
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
      await supabase.from('albums').update({ ...form, coverUrl: finalUrl }).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[95vh] shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {/* LEWA STRONA: OKŁADKA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-800 shrink-0">
          <img src={imagePreview || album.coverUrl} className="w-full h-full object-cover" alt="" />
          {!isEdit && (
            <div className="absolute top-6 left-6 flex gap-3">
              <button onClick={() => setIsEdit(true)} className="p-4 bg-black/40 rounded-full text-white"><Edit3 size={20} /></button>
              <button onClick={async () => { if(confirm("Delete?")) { await supabase.from('albums').delete().eq('id', album.id); onUpdateSuccess(); onClose(); } }} className="p-4 bg-red-500/20 rounded-full text-red-500"><Trash2 size={20} /></button>
            </div>
          )}
          <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-black/40 rounded-full text-white"><X size={20} /></button>
        </div>

        {/* PRAWA STRONA: DANE */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar text-white text-left">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                 <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Artists (comma separated)</label>
                  <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-bold" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Album Title</label>
                  <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl text-[10px] font-black uppercase">Cancel</button>
                  <button onClick={handleUpdate} className="flex-[2] py-4 bg-green-500 text-black rounded-2xl font-black text-[10px] uppercase">SAVE CHANGES</button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div>
                  {/* UŻYCIE NOWEJ FUNKCJI RENDERUJĄCEJ */}
                  <p className="text-green-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic leading-none flex flex-wrap">
                    {renderArtists(album.artist)}
                  </p>
                  
                  <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.9] mb-8">{album.title}</h2>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Calendar size={12} className="text-green-500" /> {album.year}
                    </span>
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Music size={12} className="text-green-500" /> {album.genre}
                    </span>
                    <span className="px-4 py-2 bg-zinc-800 border border-green-500/20 rounded-full text-[10px] font-black uppercase text-green-500">
                      {album.format}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <button onClick={() => window.open(getSpotifySearchUrl(), '_blank')} className="py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-xl">
                    <Play size={18} fill="black" /> SEARCH SPOTIFY
                  </button>
                  <button onClick={() => window.open(getYoutubeSearchUrl(), '_blank')} className="py-5 bg-zinc-800 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-transform">
                    <MonitorPlay size={18} /> SEARCH YOUTUBE
                  </button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};