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
    if (confirm(`Permanently delete "${album.title}"?`)) {
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
          {onPrev && <button onClick={(e) => { e.stopPropagation(); paginate(-1, onPrev); }} className="absolute left-8 p-5 text-white/5 hover:text-brand transition-all active:scale-90"><ChevronLeft size={64} /></button>}
          {onNext && <button onClick={(e) => { e.stopPropagation(); paginate(1, onNext); }} className="absolute right-8 p-5 text-white/5 hover:text-brand transition-all active:scale-90"><ChevronRight size={64} /></button>}
        </div>
      )}

      <motion.div 
        key={album.id} custom={direction}
        initial={{ x: direction > 0 ? 500 : (direction < 0 ? -500 : 0), y: direction === 0 ? 100 : 0, opacity: 0 }}
        animate={{ x: 0, y: 0, opacity: 1 }}
        exit={{ x: direction < 0 ? 500 : (direction > 0 ? -500 : 0), opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        drag={!isEdit ? true : false} dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }} dragElastic={0.02}
        onDragEnd={(_, info) => {
          const { offset, velocity } = info;
          if (Math.abs(offset.x) > Math.abs(offset.y)) {
            if ((offset.x < -100 || velocity.x < -500) && onNext) paginate(1, onNext);
            else if ((offset.x > 100 || velocity.x > 500) && onPrev) paginate(-1, onPrev);
          } else {
            if (offset.y < -100 && hasTracks) setShowTracks(true);
            else if (offset.y > 100 || velocity.y > 500) onClose();
          }
        }}
        className="bg-[#0c0c0e] w-full max-w-6xl rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row h-auto max-h-[92vh] md:max-h-[85vh] shadow-2xl relative border border-white/5 border-b-0 md:border-b"
        onClick={e => e.stopPropagation()}
      >
        {/* LEWA STRONA: MULTIMEDIA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 shrink-0 group border-r border-white/5">
          <AnimatePresence mode="wait">
            {showTracks ? (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-10 overflow-y-auto bg-black/95 z-20 no-scrollbar text-left pb-24">
                <div className="flex items-center justify-between mb-10 sticky top-0 bg-black/10 py-2">
                  <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3"><ListMusic size={16}/> Full Tracklist</h4>
                  <button onClick={() => setShowTracks(false)} className="p-3 bg-white/5 rounded-full hover:bg-brand hover:text-black transition-colors"><ChevronDown size={18}/></button>
                </div>
                <pre className="text-zinc-400 font-mono text-[12px] md:text-[13px] whitespace-pre-wrap leading-loose tracking-wide">{album.tracks}</pre>
              </motion.div>
            ) : (
              <motion.div key="c" className="w-full h-full relative" onClick={() => hasTracks && setShowTracks(true)}>
                <img src={album.coverUrl} className="w-full h-full object-cover pointer-events-none select-none" alt="" />
                {!isEdit && (
                  <button onClick={() => setIsEdit(true)} className="absolute bottom-8 left-8 p-5 bg-black/60 backdrop-blur-xl rounded-3xl text-white/40 hover:text-brand hover:bg-black transition-all border border-white/10 active:scale-90 shadow-2xl">
                    <Edit3 size={20} />
                  </button>
                )}
                {hasTracks && (
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity animate-bounce cursor-pointer">
                    <ChevronUp size={24} /><span className="text-[9px] font-black uppercase tracking-[0.2em]">View Tracks</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={onClose} className="absolute top-8 left-8 p-4 bg-black/40 hover:bg-brand hover:text-black transition-all rounded-full z-30"><X size={20} /></button>
        </div>

        {/* PRAWA STRONA: DANE - OPTYMALNY LAYOUT */}
        <div className="p-10 md:p-16 flex-1 flex flex-col bg-gradient-to-br from-[#0c0c0e] to-black min-h-0">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 my-auto text-left w-full max-w-md mx-auto">
                 <div className="space-y-6">
                    <FormInput label="Artist Name" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                    <FormInput label="Album Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                    <div className="grid grid-cols-2 gap-6">
                       <FormInput label="Release Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                       <FormInput label="Audio Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                    </div>
                 </div>
                 <div className="flex flex-col gap-4 pt-8 border-t border-white/5">
                    <button onClick={handleUpdate} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-brand/10">
                      {loading ? 'Processing...' : 'Confirm Changes'}
                    </button>
                    <div className="flex gap-4">
                      <button onClick={() => setIsEdit(false)} className="flex-1 py-5 bg-zinc-900 text-white rounded-[1.5rem] font-black uppercase text-[10px] opacity-60 hover:opacity-100 transition-all">Cancel</button>
                      <button onClick={handleDelete} className="px-8 py-5 bg-red-950/20 text-red-500 rounded-[1.5rem] border border-red-900/20 hover:bg-red-900/40 transition-all active:scale-95"><Trash2 size={20}/></button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col text-left overflow-hidden">
                
                {/* 1. HEADER SECTION */}
                <header className="space-y-4">
                  <div className="inline-block px-4 py-1.5 bg-brand/5 border border-brand/20 rounded-full">
                    <button onClick={() => onArtistClick(album.artist)} className="text-brand font-black uppercase text-[11px] tracking-tighter italic hover:text-white transition-colors">{album.artist}</button>
                  </div>
                  <h2 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-white line-clamp-3">
                    {album.title}
                  </h2>
                </header>

                {/* 2. INFO BAR */}
                <div className="flex flex-wrap gap-3 mt-12 mb-12 border-y border-white/5 py-8">
                  <Badge icon={<Calendar size={14}/>} text={album.year?.toString() || '—'} />
                  <Badge icon={<Disc size={14}/>} text={album.format} brand />
                  {Number(album.rating) > 0 && (
                    <Badge icon={<Star size={14} fill="currentColor"/>} text={`${album.rating}/10 Rating`} brand />
                  )}
                </div>

                {/* 3. ACTION SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ActionButton icon={<Play size={20} fill="black"/>} text="Play Spotify" primary onClick={() => window.open(`spotify:search:${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                  <ActionButton icon={<MonitorPlay size={20}/>} text="Watch YouTube" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                </div>
                
                {/* 4. FOOTER */}
                <footer className="mt-auto pt-10 flex items-center justify-between opacity-20 text-[9px] font-black uppercase tracking-[0.4em]">
                  <span>Archive v3.0</span>
                  <div className="h-[1px] flex-1 mx-4 bg-white/10" />
                  <span>Secure-Library</span>
                </footer>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

// MINI COMPONENTS
const Badge = ({ icon, text, brand }: any) => (
  <span className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 ${brand ? 'bg-brand text-black shadow-lg shadow-brand/10' : 'bg-white/5 text-zinc-400 border border-white/5'}`}>
    {icon} {text}
  </span>
);

const ActionButton = ({ icon, text, primary, onClick }: any) => (
  <button onClick={onClick} className={`py-6 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.1em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-white/5'}`}>
    {icon} {text}
  </button>
);

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[10px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all shadow-inner" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);