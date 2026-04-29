import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Play, MonitorPlay, Trash2, Edit3, Loader2, Calendar, Music, ListMusic, 
  ChevronUp, ChevronDown, Star, ChevronLeft, ChevronRight, Disc 
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const DigitalDetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick, onNext, onPrev }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [direction, setDirection] = useState(0); 
  const [form, setForm] = useState({ ...album });

  useEffect(() => {
    setForm({ ...album });
    setIsEdit(false);
    setShowTracks(false);
  }, [album]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums').update(form).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm(`Usunąć "${album.title}"?`)) {
      setLoading(true);
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess(); onClose();
    }
  };

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 500 : -500, opacity: 0 }),
    center: { x: 0, y: 0, opacity: 1 },
    exit: (d: number) => ({ x: d < 0 ? 500 : -500, opacity: 0 })
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-6" onClick={onClose}>
      {!isEdit && onPrev && <button onClick={(e) => { e.stopPropagation(); setDirection(-1); onPrev(); }} className="hidden md:flex absolute left-8 p-5 text-white/20 hover:text-brand transition-all"><ChevronLeft size={60} /></button>}
      {!isEdit && onNext && <button onClick={(e) => { e.stopPropagation(); setDirection(1); onNext(); }} className="hidden md:flex absolute right-8 p-5 text-white/20 hover:text-brand transition-all"><ChevronRight size={60} /></button>}

      <motion.div 
        key={album.id} custom={direction} variants={variants}
        initial="enter" animate="center" exit="exit"
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        drag={!isEdit ? true : false}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.05} // Minimalne ugięcie dla feeling-u, ale brak pływania
        onDragEnd={(_, info) => {
          const { x, y } = info.offset;
          const threshold = 100;
          if (Math.abs(x) > Math.abs(y)) {
            if (x < -threshold && onNext) { setDirection(1); onNext(); }
            else if (x > threshold && onPrev) { setDirection(-1); onPrev(); }
          } else {
            if (y < -threshold && album.tracks) { setShowTracks(true); } 
            else if (y > threshold) { onClose(); } 
          }
        }}
        className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto shadow-2xl relative border border-white/5"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 shrink-0 group">
          <AnimatePresence mode="wait">
            {showTracks ? (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 overflow-y-auto bg-zinc-950/90 backdrop-blur-md z-20 no-scrollbar">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950/10 py-2">
                  <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ListMusic size={14}/> Tracklist</h4>
                  <button onClick={() => setShowTracks(false)} className="p-2 bg-white/5 rounded-full"><ChevronDown size={16}/></button>
                </div>
                <pre className="text-zinc-400 font-mono text-[12px] whitespace-pre-wrap leading-loose">{album.tracks}</pre>
              </motion.div>
            ) : (
              <motion.div key="c" className={`w-full h-full relative ${album.tracks ? 'cursor-ns-resize' : 'cursor-default'}`} onClick={() => album.tracks && setShowTracks(true)}>
                <img src={album.coverUrl} className="w-full h-full object-cover pointer-events-none select-none" alt="" />
                {album.tracks && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity animate-bounce">
                    <ChevronUp size={20} /><span className="text-[8px] font-black uppercase tracking-widest">Tracks</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={onClose} className="absolute top-6 left-6 p-4 bg-black/40 hover:bg-white hover:text-black transition-all rounded-full z-30"><X size={20} /></button>
        </div>

        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar text-left bg-gradient-to-br from-zinc-900 to-black">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" className="space-y-6">
                 <div className="space-y-4">
                    <FormInput label="Wykonawca" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                    <FormInput label="Tytuł" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                    <div className="grid grid-cols-2 gap-4">
                       <FormInput label="Rok" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                       <FormInput label="Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button onClick={handleUpdate} className="flex-[2] py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest">{loading ? 'Saving...' : 'Zapisz zmiany'}</button>
                    <button onClick={() => setIsEdit(false)} className="flex-1 py-5 bg-zinc-800 rounded-2xl font-black uppercase text-[10px] tracking-widest">Anuluj</button>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="view" className="space-y-10">
                <header>
                  <button onClick={() => onArtistClick(album.artist)} className="text-brand font-black uppercase text-[11px] tracking-[0.4em] italic mb-3 hover:opacity-70 transition-opacity">{album.artist}</button>
                  <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-[0.9] mb-8 break-words text-white">{album.title}</h2>
                  <div className="flex flex-wrap gap-3">
                    <Badge icon={<Calendar size={12}/>} text={album.year?.toString() || 'N/A'} />
                    <Badge icon={<Disc size={12}/>} text={album.format} brand />
                    {album.rating && <Badge icon={<Star size={12} fill="currentColor"/>} text={`${album.rating}/10`} brand />}
                  </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionButton icon={<Play size={18} fill="black"/>} text="Spotify" primary onClick={() => window.open(album.spotify_url || `http://google.com/search?q=spotify+${album.artist}+${album.title}`)} />
                  <ActionButton icon={<MonitorPlay size={18}/>} text="YouTube" onClick={() => window.open(album.youtube_url || `https://www.youtube.com/results?search_query=${album.artist} ${album.title}`)} />
                </div>
                <footer className="pt-10 border-t border-white/5 flex gap-6">
                    <button onClick={() => setIsEdit(true)} className="text-zinc-600 hover:text-brand transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><Edit3 size={18}/> Edytuj</button>
                    <button onClick={handleDelete} className="text-zinc-600 hover:text-red-500 transition-colors flex items-center gap-2 font-black uppercase text-[10px] tracking-widest"><Trash2 size={18}/> Usuń</button>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Badge = ({ icon, text, brand }: any) => (
  <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${brand ? 'bg-brand text-black shadow-lg shadow-brand/10' : 'bg-white/5 text-zinc-400 border border-white/5'}`}>{icon} {text}</span>
);
const ActionButton = ({ icon, text, primary, onClick }: any) => (
  <button onClick={onClick} className={`py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>{icon} {text}</button>
);
const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1 text-left">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-zinc-800 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);