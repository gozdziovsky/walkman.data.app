import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, MonitorPlay, Trash2, Edit3, Loader2, Calendar, 
  ListMusic, ChevronUp, ChevronDown, Star, ChevronLeft, 
  ChevronRight, Disc 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Album } from '../../../types/album';

export const DigitalDetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick, onNext, onPrev }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [direction, setDirection] = useState(0); 
  const [form, setForm] = useState({ ...album });

  useEffect(() => { setForm({ ...album }); setIsEdit(false); setShowTracks(false); }, [album]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums').update(form).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm(`Permanently delete "${album.title}" from library?`)) {
      setLoading(true);
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess(); onClose();
    }
  };

  const hasTracks = album.tracks && album.tracks.trim().length > 0;
  const paginate = (d: number, action: () => void) => { setDirection(d); action(); };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 lg:p-12" 
      onClick={onClose}
    >
      {/* Desktop Navigation */}
      {!isEdit && (
        <div className="hidden lg:contents">
          {onPrev && <button onClick={(e) => { e.stopPropagation(); paginate(-1, onPrev); }} className="absolute left-8 p-5 text-white/10 hover:text-brand transition-all active:scale-90"><ChevronLeft size={64} /></button>}
          {onNext && <button onClick={(e) => { e.stopPropagation(); paginate(1, onNext); }} className="absolute right-8 p-5 text-white/10 hover:text-brand transition-all active:scale-90"><ChevronRight size={64} /></button>}
        </div>
      )}

      <motion.div 
        key={album.id} custom={direction}
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 400 }}
        drag={!isEdit ? "y" : false} 
        dragConstraints={{ top: 0, bottom: 0 }} 
        dragElastic={0.1}
        onDragEnd={(_, info) => { if (info.offset.y > 150) onClose(); }}
        // STANDARDIZED HEIGHT: h-[92vh] makes it consistent across all albums
        className="bg-[#0e0e10] w-full max-w-7xl h-[92vh] md:h-[85vh] rounded-t-[3rem] overflow-hidden flex flex-col md:flex-row shadow-2xl relative border border-white/5 border-b-0"
        onClick={e => e.stopPropagation()}
      >
        {/* LEFT SIDE: VISUALS (Fixed Square or Stretch) */}
        <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full relative bg-black shrink-0 group border-r border-white/5">
          <AnimatePresence mode="wait">
            {showTracks ? (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-10 overflow-y-auto bg-black/95 z-20 no-scrollbar text-left pb-32">
                <div className="flex items-center justify-between mb-10 sticky top-0 bg-black/10 py-2">
                  <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ListMusic size={14}/> Full Tracklist</h4>
                  <button onClick={() => setShowTracks(false)} className="p-2 bg-white/5 rounded-full hover:bg-brand hover:text-black transition-colors"><ChevronDown size={16}/></button>
                </div>
                <pre className="text-zinc-500 font-mono text-[11px] md:text-[13px] whitespace-pre-wrap leading-relaxed tracking-tight">{album.tracks}</pre>
              </motion.div>
            ) : (
              <motion.div key="c" className="w-full h-full relative" onClick={() => hasTracks && setShowTracks(true)}>
                <img src={album.coverUrl} className="w-full h-full object-cover pointer-events-none select-none" alt="" />
                {!isEdit && (
                  <button onClick={() => setIsEdit(true)} className="absolute bottom-8 left-8 p-5 bg-black/60 backdrop-blur-xl rounded-3xl text-white/40 hover:text-brand hover:bg-black transition-all border border-white/10 active:scale-90 shadow-2xl"><Edit3 size={22} /></button>
                )}
                {hasTracks && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity animate-bounce cursor-pointer"><ChevronUp size={24} /><span className="text-[9px] font-black uppercase tracking-widest">Tracks</span></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={onClose} className="absolute top-8 left-8 p-4 bg-black/40 hover:bg-brand hover:text-black transition-all rounded-full z-30"><X size={20} /></button>
        </div>

        {/* RIGHT SIDE: DATA (Always fills the height) */}
        <div className="p-8 md:p-16 lg:p-20 flex-1 flex flex-col justify-between bg-gradient-to-br from-zinc-900/50 to-black">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 my-auto text-left w-full max-w-lg">
                 <div className="space-y-6">
                    <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                    <FormInput label="Album Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                    <div className="grid grid-cols-2 gap-4">
                       <FormInput label="Release Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                       <FormInput label="Audio Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                    </div>
                 </div>
                 <div className="flex flex-col gap-4 pt-10 border-t border-white/5">
                    <button onClick={handleUpdate} className="w-full py-6 bg-brand text-black rounded-3xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-brand/20">{loading ? 'Updating...' : 'Save Changes'}</button>
                    <div className="flex gap-4">
                      <button onClick={() => setIsEdit(false)} className="flex-1 py-5 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] opacity-50 hover:opacity-100">Cancel</button>
                      <button onClick={handleDelete} className="px-8 py-5 bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20}/></button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-between text-left">
                {/* 1. TOP: Typography */}
                <header className="space-y-4">
                  <button onClick={() => onArtistClick(album.artist)} className="text-brand font-black uppercase text-[13px] tracking-tighter italic hover:text-white transition-colors">{album.artist}</button>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-white line-clamp-4">{album.title}</h2>
                </header>

                {/* 2. BOTTOM: Data Bar + Action Buttons */}
                <div className="space-y-10">
                  <div className="flex flex-wrap gap-3 pb-8 border-b border-white/5">
                    <Badge icon={<Calendar size={14}/>} text={album.year?.toString() || 'N/A'} />
                    <Badge icon={<Disc size={14}/>} text={album.format} brand />
                    {Number(album.rating) > 0 && <Badge icon={<Star size={14} fill="currentColor"/>} text={`${album.rating}/10`} brand />}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ActionButton icon={<Play size={18} fill="black"/>} text="Spotify" primary onClick={() => window.open(`spotify:search:${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                    <ActionButton icon={<MonitorPlay size={18}/>} text="YouTube" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                  </div>
                  
                  <footer className="pt-4 opacity-10 text-[9px] font-black uppercase tracking-[0.5em]">GS Archive // System Protocol 3.0</footer>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Standarized Mini-Components
const Badge = ({ icon, text, brand }: any) => (
  <span className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 ${brand ? 'bg-brand text-black shadow-lg' : 'bg-white/5 text-zinc-500 border border-white/5'}`}>{icon} {text}</span>
);

const ActionButton = ({ icon, text, primary, onClick }: any) => (
  <button onClick={onClick} className={`py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-[0.1em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>{icon} {text}</button>
);

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);