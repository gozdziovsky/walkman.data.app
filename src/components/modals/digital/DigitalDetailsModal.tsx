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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6 lg:p-12" onClick={onClose}>
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
        className="bg-[#111113] w-full max-w-6xl rounded-t-[2.5rem] md:rounded-[3.5rem] overflow-hidden flex flex-col md:flex-row h-[95vh] md:h-auto max-h-[92vh] md:max-h-[85vh] shadow-2xl relative border border-white/5 border-b-0 md:border-b"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-950 shrink-0 group">
          <AnimatePresence mode="wait">
            {showTracks ? (
              <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 overflow-y-auto bg-black/95 z-20 no-scrollbar text-left pb-24 border-r border-white/5">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/10 py-2">
                  <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ListMusic size={14}/> Tracks</h4>
                  <button onClick={() => setShowTracks(false)} className="p-2 bg-white/5 rounded-full hover:bg-brand hover:text-black transition-colors"><ChevronDown size={16}/></button>
                </div>
                <pre className="text-zinc-500 font-mono text-[11px] md:text-[12px] whitespace-pre-wrap leading-relaxed">{album.tracks}</pre>
              </motion.div>
            ) : (
              <motion.div key="c" className="w-full h-full relative" onClick={() => hasTracks && setShowTracks(true)}>
                <img src={album.coverUrl} className="w-full h-full object-cover pointer-events-none select-none" alt="" />
                {!isEdit && (
                  <button onClick={() => setIsEdit(true)} className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white/40 hover:text-brand hover:bg-black transition-all border border-white/10 shadow-2xl"><Edit3 size={18} /></button>
                )}
                {hasTracks && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity animate-bounce cursor-pointer"><ChevronUp size={20} /><span className="text-[8px] font-black uppercase tracking-widest">Tracks</span></div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={onClose} className="absolute top-6 left-6 p-4 bg-black/40 hover:bg-white hover:text-black transition-all rounded-full z-30"><X size={20} /></button>
        </div>

        <div className="p-8 md:p-14 flex-1 flex flex-col bg-zinc-900/50 min-h-0">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 my-auto text-left w-full">
                 <div className="space-y-4">
                    <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                    <FormInput label="Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                    <div className="grid grid-cols-2 gap-4">
                       <FormInput label="Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                       <FormInput label="Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                    </div>
                 </div>
                 <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                    <button onClick={handleUpdate} className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all">{loading ? 'Saving...' : 'Save Changes'}</button>
                    <div className="flex gap-3">
                      <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] opacity-50">Cancel</button>
                      <button onClick={handleDelete} className="px-6 py-4 bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-900/40 transition-all"><Trash2 size={18}/></button>
                    </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-between text-left overflow-hidden">
                <header className="space-y-1">
                  <button onClick={() => onArtistClick(album.artist)} className="text-brand font-black uppercase text-[12px] tracking-tighter italic hover:text-white transition-colors">{album.artist}</button>
                  <h2 className="text-4xl md:text-7xl font-black uppercase italic tracking-tighter leading-[0.85] text-white line-clamp-3 md:line-clamp-4">{album.title}</h2>
                </header>

                <div className="space-y-10">
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Badge icon={<Calendar size={12}/>} text={album.year?.toString() || '—'} />
                    <Badge icon={<Disc size={12}/>} text={album.format} brand />
                    {Number(album.rating) > 0 && <Badge icon={<Star size={12} fill="currentColor"/>} text={`${album.rating}/10`} brand />}
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <ActionButton icon={<Play size={18} fill="black"/>} text="Play on Spotify" primary onClick={() => window.open(`spotify:search:${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                    <ActionButton icon={<MonitorPlay size={18}/>} text="YouTube Search" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                  </div>
                </div>
                <footer className="pt-8 opacity-10 text-[8px] font-black uppercase tracking-[0.4em] mt-auto">GS ARCHIVE SYSTEM</footer>
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
  <button onClick={onClick} className={`py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.1em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>{icon} {text}</button>
);
const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1 text-left">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);