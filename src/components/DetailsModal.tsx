import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, MonitorPlay, Trash2, Edit3, Save, ImageIcon, 
  Loader2, Calendar, Music, ListMusic, ChevronUp, ChevronDown, 
  Star, Link2, Disc, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

interface DetailsModalProps {
  album: Album;
  onClose: () => void;
  onUpdateSuccess: () => void;
  onArtistClick: (name: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const DetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick, onNext, onPrev }: DetailsModalProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [form, setForm] = useState<Album>({ ...album });
  const [imagePreview, setImagePreview] = useState<string | null>(album.coverUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [direction, setDirection] = useState(0); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm({ ...album });
    setImagePreview(album.coverUrl);
    setIsEdit(false);
    setShowTracks(false);
  }, [album]);

  const renderArtists = (artistString: string) => {
    const exceptions = ["Tyler, The Creator", "Earth, Wind & Fire", "Blood, Sweat & Tears"];
    let tempPath = artistString;
    const placeholder = "##EX##";
    const foundExceptions: string[] = [];

    exceptions.forEach((ex, i) => {
      if (tempPath.includes(ex)) {
        tempPath = tempPath.replace(ex, `${placeholder}${i}`);
        foundExceptions[i] = ex;
      }
    });

    return tempPath.split(',').map((part, index, array) => {
      let finalName = part.trim();
      if (finalName.includes(placeholder)) {
        const id = parseInt(finalName.replace(placeholder, ""));
        finalName = foundExceptions[id];
      }
      if (!finalName) return null;

      return (
        <span key={index} className="inline-flex items-center">
          <button onClick={() => onArtistClick(finalName)} className="hover:text-brand transition-colors cursor-pointer border-b border-transparent hover:border-brand/30">
            {finalName}
          </button>
          {index < array.length - 1 && <span className="mr-2">,</span>}
        </span>
      );
    });
  };

  const getSpotifySearchUrl = () => {
    if (album.spotify_url) return album.spotify_url;
    return `https://open.spotify.com/search/$${encodeURIComponent(album.artist + " " + album.title)}`;
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
      onUpdateSuccess(); 
      setIsEdit(false);
    } catch (err: any) {
      alert(err.message);
    } finally { 
      setLoading(false); 
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${album.title}"? This cannot be undone.`)) {
      setLoading(true);
      try {
        await supabase.from('albums').delete().eq('id', album.id);
        onUpdateSuccess();
        onClose();
      } finally { 
        setLoading(false); 
      }
    }
  };

  const variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 })
  };

  // --- DYNAMICZNY ROZMIAR TYTUŁU ---
  // Analizuje najdłuższe słowo w tytule i skaluje font w dół, aby zapobiec brzydkiemu łamaniu
  const getTitleClass = (title: string) => {
    if (!title) return "text-4xl md:text-6xl";
    const longestWord = Math.max(...title.split(' ').map(w => w.length));
    if (longestWord > 14) return "text-2xl md:text-4xl"; // Np. "Supercalifragilistic..."
    if (longestWord > 10) return "text-3xl md:text-5xl"; // Np. "Balloonerism"
    return "text-4xl md:text-6xl"; // Standard
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      
      {onPrev && !isEdit && (
        <button onClick={(e) => { e.stopPropagation(); setDirection(-1); onPrev(); }} className="hidden md:flex absolute left-10 p-5 text-white/20 hover:text-brand transition-colors"><ChevronLeft size={48} /></button>
      )}
      
      {onNext && !isEdit && (
        <button onClick={(e) => { e.stopPropagation(); setDirection(1); onNext(); }} className="hidden md:flex absolute right-10 p-5 text-white/20 hover:text-brand transition-colors"><ChevronRight size={48} /></button>
      )}

      <motion.div 
        key={album.id}
        custom={direction}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={!isEdit ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2} 
        dragDirectionLock={true} 
        onDragEnd={(_, info) => {
          const isFlick = Math.abs(info.velocity.x) > 500;
          const isLongDrag = Math.abs(info.offset.x) > 150; 
          
          if (isFlick || isLongDrag) {
            if (info.offset.x < 0 && onNext) { setDirection(1); onNext(); }
            else if (info.offset.x > 0 && onPrev) { setDirection(-1); onPrev(); }
          }
        }}
        className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row max-h-[95vh] shadow-2xl relative" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* LEWA STRONA: OKŁADKA / TRACKLISTA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 shrink-0 overflow-hidden">
          
          {!isEdit && album.tracks && (
            <div className="absolute inset-0 bg-zinc-950 p-8 overflow-y-auto no-scrollbar z-0 flex flex-col">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2 text-brand">
                    <ListMusic size={16} />
                    <h4 className="text-[10px] font-black uppercase tracking-widest">Tracklist</h4>
                  </div>
                  <button onClick={() => setShowTracks(false)} className="text-zinc-500 bg-white/5 p-2 rounded-full active:scale-90 transition-transform"><ChevronDown size={16} /></button>
               </div>
               <div className="text-zinc-400 font-mono text-[11px] whitespace-pre-wrap leading-loose">{album.tracks}</div>
            </div>
          )}

          <motion.div 
            className="absolute inset-0 z-10 bg-zinc-800"
            drag={!isEdit && album.tracks ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2} 
            dragDirectionLock={true} 
            onDragEnd={(_, info) => { 
              const isFlickY = Math.abs(info.velocity.y) > 500;
              const isLongDragY = Math.abs(info.offset.y) > 120; 
              
              if (isFlickY || isLongDragY) {
                if (info.offset.y < 0 && album.tracks) setShowTracks(true); 
                else if (info.offset.y > 0) setShowTracks(false); 
              }
            }}
            animate={{ y: showTracks ? '-100%' : '0%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <img src={imagePreview || album.coverUrl} className={`w-full h-full object-cover transition-opacity ${isEdit ? 'opacity-30 blur-sm' : 'opacity-100'}`} alt="" />
            
            {isEdit && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-brand transition-colors shadow-2xl">
                  <ImageIcon size={16} /> Change File
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
                
                <div className="w-full max-w-xs space-y-2 mt-4">
                  <div className="flex gap-2 bg-black/60 p-1 rounded-xl border border-white/10 backdrop-blur-md">
                    <input 
                      className="bg-transparent flex-1 pl-3 text-[10px] font-bold outline-none text-white placeholder:text-zinc-500" 
                      placeholder="Or paste image URL..." 
                      value={form.coverUrl} 
                      onChange={e => { setForm({...form, coverUrl: e.target.value}); setImagePreview(e.target.value); }}
                    />
                  </div>
                </div>
              </div>
            )}

            {!isEdit && album.tracks && !showTracks && (
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-70 animate-bounce pointer-events-none">
                 <ChevronUp size={24} className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" />
                 <span className="text-[8px] font-black uppercase tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mt-1">Tracks</span>
               </div>
            )}

            {!showTracks && (
              <div className="absolute top-6 left-6 flex gap-3 z-20">
                {!isEdit ? (
                  <button onClick={(e) => { e.stopPropagation(); setIsEdit(true); }} className="p-4 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-brand transition-all active:scale-90"><Edit3 size={20} /></button>
                ) : (
                  <div className="bg-brand text-black px-4 py-2 rounded-full text-[10px] font-black uppercase italic shadow-lg shadow-brand/20 animate-pulse">Editing Mode</div>
                )}
              </div>
            )}

            {!showTracks && (
              <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-md rounded-full text-white z-20 active:scale-90 hover:bg-white hover:text-black transition-all"><X size={20} /></button>
            )}
          </motion.div>
        </div>

        {/* PRAWA STRONA: DANE / FORMULARZ */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar text-white text-left bg-zinc-900">
          <AnimatePresence mode="wait">
            
            {/* --- TRYB EDYCJI --- */}
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Artist</label><input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand/50 transition-all" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Title</label><input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand/50 transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Status</label>
                  <div className="grid grid-cols-2 gap-2 bg-black/40 p-1 rounded-xl h-12 border border-white/5">
                    <button type="button" onClick={() => setForm({...form, status: 'MAM'})} className={`rounded-lg text-[9px] font-black uppercase transition-all ${form.status === 'MAM' ? 'bg-brand text-black' : 'text-zinc-600 hover:text-white'}`}>Owned</button>
                    <button type="button" onClick={() => setForm({...form, status: 'SZUKAM'})} className={`rounded-lg text-[9px] font-black uppercase transition-all ${form.status === 'SZUKAM' ? 'bg-orange-500 text-black' : 'text-zinc-600 hover:text-white'}`}>Wanted</button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1 ml-1"><Calendar size={10}/> Year</label><input type="number" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand/50" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} /></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1 ml-1"><Disc size={10}/> Format</label><select className="w-full bg-zinc-800 border border-white/5 rounded-xl px-3 py-3 text-[10px] font-black uppercase outline-none focus:border-brand/50" value={form.format} onChange={e => setForm({...form, format: e.target.value as any})}><option value="FLAC">FLAC</option><option value="MP3">MP3</option><option value="Hi-Res">Hi-Res</option></select></div>
                  <div className="space-y-1"><label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1 ml-1"><Star size={10}/> Rating</label><input type="number" max="10" min="0" className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand/50" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} /></div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-600 uppercase ml-1">Genre</label>
                  <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-brand/50 transition-all" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-600 uppercase flex items-center gap-1 ml-1"><ListMusic size={10}/> Tracklist</label>
                  <textarea className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-[11px] font-mono text-zinc-300 h-32 resize-none no-scrollbar outline-none focus:border-brand/50" value={form.tracks || ''} onChange={e => setForm({...form, tracks: e.target.value})} />
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                   <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 flex items-center gap-1"><Link2 size={10} /> Spotify URL</label>
                    <input className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-mono text-zinc-400 outline-none focus:border-brand/50" value={form.spotify_url || ''} onChange={e => setForm({...form, spotify_url: e.target.value})} placeholder="Leave empty for auto-search" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 flex items-center gap-1"><Link2 size={10} /> YouTube URL</label>
                    <input className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-[10px] font-mono text-zinc-400 outline-none focus:border-brand/50" value={form.youtube_url || ''} onChange={e => setForm({...form, youtube_url: e.target.value})} placeholder="Leave empty for auto-search" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-6">
                  <div className="flex gap-3">
                    <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-700 transition-colors">Discard</button>
                    <button onClick={handleUpdate} disabled={loading} className="flex-[2] py-4 bg-brand text-black rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all">
                      {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
                    </button>
                  </div>
                  <button onClick={handleDelete} className="w-full py-4 border border-red-500/20 bg-red-500/5 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 group">
                    <Trash2 size={14} className="group-hover:scale-110 transition-transform" /> Delete Record Permanently
                  </button>
                </div>
              </motion.div>
            ) : (
              
              /* --- TRYB WIDOKU --- */
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div>
                  {/* ZMIANA: Naturalny tracking-widest dla artystów */}
                  <p className="text-brand font-black uppercase tracking-widest text-[10px] mb-4 italic leading-none flex flex-wrap">
                    {renderArtists(album.artist)}
                  </p>
                  
                  <div className="flex justify-between items-start gap-4">
                    {/* ZMIANA: Dynamiczny rozmiar tekstu + zakaz łamania w pół wyrazu (break-normal) */}
                    <h2 className={`${getTitleClass(album.title)} font-black uppercase tracking-tighter italic leading-[0.9] mb-8 min-w-0 flex-1 break-normal`}>
                      {album.title}
                    </h2>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0 mt-2">
                      {album.rating > 0 && (
                        <div className="flex items-center gap-1 bg-brand text-black px-3 py-1 rounded-lg shadow-lg shadow-brand/20">
                          <Star size={12} fill="black" />
                          <span className="text-xs font-black">{album.rating}/10</span>
                        </div>
                      )}
                      <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${album.status === 'MAM' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                        {album.status === 'MAM' ? 'In Library' : 'On Wishlist'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Calendar size={12} className="text-brand" /> {album.year}
                    </span>
                    <span className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Music size={12} className="text-brand" /> {album.genre}
                    </span>
                    <span className="px-4 py-2 bg-zinc-800 border border-brand/20 rounded-full text-[10px] font-black uppercase text-brand">
                      {album.format}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <button onClick={() => window.open(getSpotifySearchUrl(), '_blank')} className="py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl hover:bg-brand group">
                    <Play size={18} fill="black" className="group-hover:scale-110 transition-transform" /> 
                    {album.spotify_url ? 'Open Spotify' : 'Search Spotify'}
                  </button>
                  <button onClick={() => window.open(getYoutubeSearchUrl(), '_blank')} className="py-5 bg-zinc-800 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-zinc-700">
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