import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, MonitorPlay, Trash2, Edit3, Save, ImageIcon, 
  Loader2, Calendar, Music, ListMusic, ChevronUp, ChevronDown, 
  Star, Link2, Disc 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

export const DetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [form, setForm] = useState<Album>({ ...album });
  const [imagePreview, setImagePreview] = useState<string | null>(album.coverUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderArtists = (artistString: string) => {
    const exceptions = ["Tyler, The Creator", "Earth, Wind & Fire", "Blood, Sweat & Tears"];
    let tempPath = artistString;
    const placeholder = "##EX##";
    const foundExceptions: string[] = [];
    exceptions.forEach((ex, i) => {
      if (tempPath.includes(ex)) { tempPath = tempPath.replace(ex, `${placeholder}${i}`); foundExceptions[i] = ex; }
    });
    return tempPath.split(',').map((part, index, array) => {
      let finalName = part.trim();
      if (finalName.includes(placeholder)) { finalName = foundExceptions[parseInt(finalName.replace(placeholder, ""))]; }
      if (!finalName) return null;
      return (
        <span key={index} className="inline-flex items-center">
          <button onClick={() => onArtistClick(finalName)} className="hover:text-brand transition-colors cursor-pointer border-b border-transparent hover:border-brand/30">{finalName}</button>
          {index < array.length - 1 && <span className="mr-2">,</span>}
        </span>
      );
    });
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

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${album.title}"? This cannot be undone.`)) {
      setLoading(true);
      try {
        await supabase.from('albums').delete().eq('id', album.id);
        onUpdateSuccess();
        onClose();
      } finally { setLoading(false); }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[95vh] shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {/* LEWA STRONA: OKŁADKA / TRACKLISTA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 shrink-0 overflow-hidden">
          {!isEdit && album.tracks && (
            <div className="absolute inset-0 bg-zinc-950 p-8 overflow-y-auto no-scrollbar z-0 flex flex-col">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 text-brand"><ListMusic size={16} /><h4 className="text-[10px] font-black uppercase tracking-widest">Tracklist</h4></div>
                  <button onClick={() => setShowTracks(false)} className="text-zinc-500 bg-white/5 p-2 rounded-full active:scale-90 transition-transform"><ChevronDown size={16} /></button>
               </div>
               <div className="text-zinc-400 font-mono text-[11px] whitespace-pre-wrap leading-loose">{album.tracks}</div>
            </div>
          )}

          <motion.div 
            className="absolute inset-0 z-10 bg-zinc-800"
            drag={!isEdit && album.tracks ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => { if (info.offset.y < -50 && album.tracks) setShowTracks(true); if (info.offset.y > 50) setShowTracks(false); }}
            animate={{ y: showTracks ? '-100%' : '0%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <img src={imagePreview || album.coverUrl} className={`w-full h-full object-cover transition-opacity ${isEdit ? 'opacity-30 blur-sm' : 'opacity-100'}`} alt="" />
            {isEdit && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand transition-colors shadow-2xl"><ImageIcon size={16} /> Change Cover</button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
              </div>
            )}
            {!isEdit && album.tracks && !showTracks && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70 animate-bounce pointer-events-none"><ChevronUp size={24} className="text-white" /><span className="text-[8px] font-black uppercase text-white mt-1">Tracks</span></div>
            )}
            {!showTracks && (
              <div className="absolute top-6 left-6 flex gap-3 z-20">
                {!isEdit ? (
                  <button onClick={() => setIsEdit(true)} className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-brand transition-all active:scale-90"><Edit3 size={20} /></button>
                ) : (
                  <div className="bg-brand text-black px-4 py-2 rounded-full text-[10px] font-black uppercase italic shadow-lg shadow-brand/20 animate-pulse">Editing Mode</div>
                )}
              </div>
            )}
            {!showTracks && <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-full text-white z-20 active:scale-90 hover:bg-white hover:text-black transition-all"><X size={20} /></button>}
          </motion.div>
        </div>

        {/* PRAWA STRONA: DANE / FORMULARZ */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar text-white text-left">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase">Artist</label><input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase">Title</label><input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-600 uppercase">Status</label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl h-12 border border-white/5">
                    <button type="button" onClick={() => setForm({...form, status: 'MAM'})} className={`rounded-lg text-[9px] font-black uppercase transition-all ${form.status === 'MAM' ? 'bg-brand text-black' : 'text-zinc-600'}`}>Owned</button>
                    <button type="button" onClick={() => setForm({...form, status: 'SZUKAM'})} className={`rounded-lg text-[9px] font-black uppercase transition-all ${form.status === 'SZUKAM' ? 'bg-orange-500 text-black' : 'text-zinc-600'}`}>Wanted</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1"><Calendar size={10}/> Year</label><input type="number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1"><Disc size={10}/> Format</label><select className="w-full bg-zinc-800 border border-white/5 rounded-xl px-3 py-3 text-[10px] font-black uppercase text-white outline-none" value={form.format} onChange={e => setForm({...form, format: e.target.value as any})}><option value="FLAC">FLAC</option><option value="MP3">MP3</option><option value="Hi-Res">Hi-Res</option></select></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1"><Star size={10}/> Rating</label><input type="number" max="10" min="0" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} /></div>
                </div>

                <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1"><ListMusic size={10}/> Tracklist</label><textarea className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-mono text-zinc-300 h-32 resize-none no-scrollbar" value={form.tracks || ''} onChange={e => setForm({...form, tracks: e.target.value})} /></div>

                {/* PRZYCISKI AKCJI W EDYCJI */}
                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex gap-3">
                    <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">Discard</button>
                    <button onClick={handleUpdate} disabled={loading} className="flex-[2] py-4 bg-brand text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                    </button>
                  </div>
                  {/* PRZYCISK USUWANIA (TERAZ TUTAJ) */}
                  <button 
                    onClick={handleDelete} 
                    className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group"
                  >
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> Delete Record Permanently
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                <div>
                  <p className="text-brand font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic leading-none">{renderArtists(album.artist)}</p>
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-[0.9] mb-8">{album.title}</h2>
                    <div className="flex flex-col items-end gap-2 shrink-0 mt-2">
                      {album.rating > 0 && <div className="flex items-center gap-1 bg-brand text-black px-3 py-1 rounded-lg shadow-lg shadow-brand/20"><Star size={12} fill="black" /><span className="text-xs font-black">{album.rating}/10</span></div>}
                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${album.status === 'MAM' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>{album.status === 'MAM' ? 'In Library' : 'On Wishlist'}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Calendar size={12} className="text-brand" /> {album.year}</span>
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2"><Music size={12} className="text-brand" /> {album.genre}</span>
                    <span className="px-4 py-2 bg-zinc-800 border border-brand/20 rounded-full text-[10px] font-black uppercase text-brand">{album.format}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <button onClick={() => window.open(`https://open.spotify.com/search/$${encodeURIComponent(album.artist + " " + album.title)}`, '_blank')} className="py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-brand">
                    <Play size={18} fill="black" /> {form.spotify_url ? 'Open Spotify' : 'Search Spotify'}
                  </button>
                  <button onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + " " + album.title + " full album")}`, '_blank')} className="py-5 bg-zinc-800 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-zinc-700">
                    <MonitorPlay size={18} /> {form.youtube_url ? 'Watch YouTube' : 'Search YouTube'}
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