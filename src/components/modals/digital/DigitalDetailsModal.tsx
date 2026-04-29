import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, MonitorPlay, Trash2, Edit3, Calendar, ListMusic, 
  ChevronUp, ChevronDown, Star, Disc, BookmarkCheck, Search 
} from 'lucide-react';
import { ModalShell } from '../shared/ModalShell';
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
    setDirection(0);
  }, [album]);

  const artists = useMemo(() => {
    const raw = album.artist || "";
    const exceptions = ["Tyler, The Creator"];
    let temp = raw;
    exceptions.forEach((ex, i) => { temp = temp.split(ex).join(`##EX${i}##`); });
    const parts = temp.split(',').map((p: string) => p.trim()).filter(Boolean);
    return parts.map((p: string) => {
      let restored = p;
      exceptions.forEach((ex, i) => { restored = restored.split(`##EX${i}##`).join(ex); });
      return restored;
    });
  }, [album.artist]);

  const getFontSize = (title: string) => {
    const len = title.length;
    if (len < 12) return 'text-6xl md:text-8xl lg:text-9xl';
    if (len < 25) return 'text-5xl md:text-7xl lg:text-8xl';
    return 'text-4xl md:text-5xl lg:text-6xl';
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums').update(form).eq('id', album.id);
      onUpdateSuccess(); setIsEdit(false);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const hasTracks = album.tracks && album.tracks.trim().length > 0;

  return (
    <ModalShell 
      onClose={onClose} 
      isEdit={isEdit} 
      albumId={album.id} 
      direction={direction}
      onNext={onNext ? () => { setDirection(1); onNext(); } : undefined}
      onPrev={onPrev ? () => { setDirection(-1); onPrev(); } : undefined}
      onSwipeUp={hasTracks ? () => setShowTracks(true) : undefined}
    >
      {/* LEFT: MEDIA SECTION */}
      <div className="w-full md:w-1/2 aspect-square md:h-full relative bg-zinc-950 shrink-0 group border-r border-white/5 overflow-hidden">
        <AnimatePresence mode="wait">
          {showTracks ? (
            <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-8 overflow-y-auto bg-black/95 z-20 no-scrollbar text-left pb-32">
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/10 py-2">
                <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ListMusic size={14}/> Tracks</h4>
                <button onClick={() => setShowTracks(false)} className="p-2 bg-white/5 rounded-full hover:bg-brand transition-colors"><ChevronDown size={16}/></button>
              </div>
              <pre className="text-zinc-500 font-mono text-[11px] md:text-[13px] whitespace-pre-wrap leading-relaxed">{album.tracks}</pre>
            </motion.div>
          ) : (
            <motion.div key="c" className="w-full h-full relative cursor-ns-resize" onClick={() => hasTracks && setShowTracks(true)}>
              <img src={album.coverUrl} className="w-full h-full object-cover select-none" alt="" />
              {!isEdit && (
                <button onClick={(e) => { e.stopPropagation(); setIsEdit(true); }} className="absolute bottom-6 left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white/40 hover:text-brand transition-all border border-white/10 active:scale-90 shadow-2xl z-50">
                  <Edit3 size={18} />
                </button>
              )}
              {hasTracks && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity animate-bounce">
                  <ChevronUp size={20} /><span className="text-[8px] font-black uppercase tracking-widest">Tracks</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: DATA SECTION */}
      <div className="p-8 md:p-14 lg:px-20 lg:pt-20 lg:pb-12 flex-1 flex flex-col justify-between bg-gradient-to-br from-[#0e0e10] to-black min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {isEdit ? (
            <motion.div key="edit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 my-auto text-left w-full max-w-md mx-auto">
              <div className="space-y-4">
                <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                <FormInput label="Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                <div className="grid grid-cols-2 gap-4">
                  <FormInput label="Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                  <FormInput label="Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                <button onClick={handleUpdate} className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-lg">Save Changes</button>
                <div className="flex gap-3">
                  <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] opacity-50">Cancel</button>
                  <button onClick={() => { if(confirm('Delete?')) { supabase.from('albums').delete().eq('id', album.id).then(() => { onUpdateSuccess(); onClose(); })} }} className="px-6 py-4 bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-900/40 transition-all active:scale-95"><Trash2 size={18}/></button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col justify-between text-left">
              <header className="pt-2">
                <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
                  {artists.map((name, i) => (
                    <button key={i} onClick={() => onArtistClick(name)} className="text-brand font-black uppercase text-[12px] tracking-tighter italic hover:text-white transition-colors flex items-center">
                      {name}{i < artists.length - 1 && <span className="text-zinc-700 ml-3 not-italic">/</span>}
                    </button>
                  ))}
                </div>
                <div className="py-2">
                  <h2 className={`${getFontSize(album.title)} font-black uppercase italic tracking-tighter leading-[0.95] text-white line-clamp-4 transition-all duration-300`}>
                    {album.title}
                  </h2>
                </div>
              </header>

              {/* SECTION: DATA & ACTIONS (Anchored to bottom) */}
              <div className="space-y-8">
                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                  <Badge icon={<Calendar size={12}/>} text={album.year?.toString() || '—'} />
                  <Badge icon={<Disc size={12}/>} text={album.format} brand />
                  <Badge 
                    icon={album.status === 'MAM' ? <BookmarkCheck size={12}/> : <Search size={12}/>} 
                    text={album.status === 'MAM' ? 'OWNED' : 'WANTED'} 
                    colorClass={album.status === 'MAM' ? 'bg-brand text-black shadow-brand/20' : 'bg-orange-500 text-black shadow-orange-500/20'}
                  />
                  {Number(album.rating) > 0 && <Badge icon={<Star size={12} fill="currentColor"/>} text={`${album.rating}/10`} brand />}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <ActionButton icon={<Play size={16} fill="black"/>} text="Spotify" primary onClick={() => window.open(`spotify:search:${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                  <ActionButton icon={<MonitorPlay size={16}/>} text="YouTube" onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)}`)} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ModalShell>
  );
};

// MINI COMPONENTS (remain the same)
const Badge = ({ icon, text, brand, colorClass }: any) => (
  <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all
    ${colorClass ? colorClass : (brand ? 'bg-brand text-black shadow-brand/10' : 'bg-white/5 text-zinc-500 border border-white/5 shadow-black/20')}
  `}>
    {icon} {text}
  </span>
);
const ActionButton = ({ icon, text, primary, onClick }: any) => (
  <button onClick={onClick} className={`py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.1em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
    {icon} {text}
  </button>
);
const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1 text-left">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);