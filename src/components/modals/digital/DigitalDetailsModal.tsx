import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, MonitorPlay, Trash2, Edit3, Calendar, ListMusic, 
  ChevronUp, ChevronDown, Star, Disc, BookmarkCheck, Search, ImageIcon,
  ChevronLeft, ChevronRight, X
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
    setDirection(0);
  }, [album]);

  const artists = useMemo(() => {
    const raw = album.artist || "";
    const exceptions = ["Tyler, The Creator", "Earth, Wind & Fire"];
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
    const len = title?.length || 0;
    if (len < 12) return 'text-6xl md:text-8xl lg:text-9xl';
    if (len < 25) return 'text-5xl md:text-7xl lg:text-8xl';
    if (len < 45) return 'text-4xl md:text-5xl lg:text-6xl';
    return 'text-3xl md:text-4xl lg:text-5xl';
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums').update(form).eq('id', album.id);
      onUpdateSuccess(); 
      setIsEdit(false);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const hasTracks = album.tracks && album.tracks.trim().length > 0;

  return (
    // Tło Modala (identyczne jak w Settings, z blur-em)
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex items-end md:items-center justify-center p-0 md:p-6"
    >
      {/* Kontener Modala (Drawer na mobile, wyśrodkowany panel na desktopie) */}
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0e0e10] w-full max-w-5xl h-[92vh] md:h-[85vh] rounded-t-[2.5rem] md:rounded-[3.5rem] flex flex-col md:flex-row overflow-hidden relative transform-gpu will-change-transform shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 md:border-b shadow-[0_0_80px_rgba(0,0,0,0.8)]"
      >
        
        {/* LEWITUJĄCA NAWIGACJA (Next/Prev/Close) */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] flex items-center gap-2">
          {!isEdit && onPrev && (
            <button onClick={() => { setDirection(-1); onPrev(); }} className="p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all border border-white/5 active:scale-90">
              <ChevronLeft size={18} />
            </button>
          )}
          {!isEdit && onNext && (
            <button onClick={() => { setDirection(1); onNext(); }} className="p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white hover:bg-black/80 transition-all border border-white/5 active:scale-90">
              <ChevronRight size={18} />
            </button>
          )}
          <button onClick={onClose} className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-brand hover:text-black transition-all border border-white/10 active:scale-90 ml-2">
            <X size={18} />
          </button>
        </div>

        {/* ZAWARTOŚĆ Z ANIMACJĄ PRZEJŚCIA MIĘDZY ALBUMAMI */}
        <AnimatePresence mode="wait">
          <motion.div
            key={album.id + (isEdit ? '-edit' : '-view')}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col md:flex-row w-full h-full"
          >
            
            {/* LEFT: MEDIA SECTION (Tylko w trybie podglądu) */}
            {!isEdit && (
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full relative bg-zinc-950 shrink-0 group border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
                <AnimatePresence mode="wait">
                  {showTracks ? (
                    <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 p-8 overflow-y-auto bg-black/95 z-20 no-scrollbar text-left pb-32">
                      <div className="flex items-center justify-between mb-8 sticky top-0 bg-black/10 py-2 backdrop-blur-sm">
                        <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><ListMusic size={14}/> Tracks</h4>
                        <button onClick={() => setShowTracks(false)} className="p-2 bg-white/5 rounded-full hover:bg-brand hover:text-black transition-colors"><ChevronDown size={16}/></button>
                      </div>
                      <pre className="text-zinc-500 font-mono text-[11px] md:text-[13px] whitespace-pre-wrap leading-relaxed">{album.tracks}</pre>
                    </motion.div>
                  ) : (
                    <motion.div key="c" className="w-full h-full relative cursor-pointer" onClick={() => hasTracks && setShowTracks(true)}>
                      <img src={album.coverUrl} className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105" alt="" />
                      {/* PRZYCISK EDYCJI: W Lewym Dolnym Rogu Okładki */}
                      <button onClick={(e) => { e.stopPropagation(); setIsEdit(true); }} className="absolute bottom-4 left-4 md:bottom-6 md:left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white/50 hover:text-brand transition-all border border-white/10 active:scale-90 shadow-2xl z-50 hover:border-brand/30">
                        <Edit3 size={18} />
                      </button>
                      {hasTracks && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity animate-bounce">
                          <ChevronUp size={24} className="drop-shadow-lg" /><span className="text-[9px] font-black uppercase tracking-widest drop-shadow-lg">Tracks</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* RIGHT: DATA & EDIT SECTION */}
            <div className={`flex-1 flex flex-col min-h-0 bg-gradient-to-br from-[#0e0e10] to-black relative ${isEdit ? 'w-full' : ''}`}>
              
              {isEdit ? (
                /* ========================================== */
                /* EDIT MODE PANEL (Identyczny jak w Settings) */
                /* ========================================== */
                <div className="flex flex-col w-full h-full">
                  <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-12 lg:px-24 no-scrollbar space-y-12 md:space-y-16" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <header className="flex items-center justify-between pb-6 border-b border-white/5 pt-2 pr-16 md:pr-0">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-brand flex items-center gap-3"><Edit3 size={24}/> Edit Archive Data</h3>
                    </header>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Disc size={14}/> Core Information</label>
                      <div className="space-y-4">
                        <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                        <FormInput label="Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                      </div>
                    </section>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Calendar size={14}/> Metadata</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FormInput label="Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                        <FormInput label="Genre" value={form.genre || ''} onChange={(v:any) => setForm({...form, genre: v})} />
                        <FormInput label="Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                        <FormInput label="Rating (0-10)" type="number" value={form.rating || 0} onChange={(v:any) => setForm({...form, rating: parseInt(v)})} />
                      </div>
                    </section>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><BookmarkCheck size={14}/> Library Status</label>
                      <div className="flex gap-2 p-1.5 bg-zinc-950/50 rounded-[1.5rem] border border-white/5">
                        <button onClick={() => setForm({...form, status: 'MAM'})} className={`flex-1 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'MAM' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600 hover:text-white'}`}>Owned (MAM)</button>
                        <button onClick={() => setForm({...form, status: 'SZUKAM'})} className={`flex-1 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'SZUKAM' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-zinc-600 hover:text-white'}`}>Wanted (SZUKAM)</button>
                      </div>
                    </section>

                    <section className="space-y-6 pb-12">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><ImageIcon size={14}/> Media Assets</label>
                      <FormInput label="Cover Image URL" value={form.coverUrl} onChange={(v:any) => setForm({...form, coverUrl: v})} />
                      <div className="pt-4 space-y-2 text-left">
                        <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Tracklist (Raw Text)</label>
                        <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-zinc-400 outline-none focus:border-brand/50 transition-all h-40 resize-none no-scrollbar shadow-inner" value={form.tracks} onChange={e => setForm({...form, tracks: e.target.value})} />
                      </div>
                    </section>
                  </div>

                  <div className="shrink-0 p-6 md:p-12 pt-6 bg-[#0e0e10] border-t border-white/5 z-30 relative">
                    <button onClick={handleUpdate} disabled={loading} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--brand-rgb),0.15)] flex items-center justify-center gap-2">
                      {loading ? <span className="animate-pulse">Saving Changes...</span> : 'Commit Changes'}
                    </button>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setIsEdit(false)} className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                      <button onClick={() => { if(confirm('Purge this record from the archive?')) { supabase.from('albums').delete().eq('id', album.id).then(() => { onUpdateSuccess(); onClose(); })} }} className="px-8 py-5 bg-red-900/10 border border-red-900/20 text-red-500 rounded-[1.5rem] hover:bg-red-900/30 transition-all active:scale-95 flex items-center justify-center">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (

                /* ========================================== */
                /* VIEW MODE PANEL (SZTYWNY SCHEMAT PRZYKLEJONY DO DOŁU) */
                /* ========================================== */
                <div className="flex-1 flex flex-col justify-end gap-10 md:gap-14 no-scrollbar p-8 md:p-14 lg:p-20 text-left relative">
                  
                  {/* Tytuł i Artyści - Spychani do góry w razie potrzeby, ale trzymający strukturę */}
                  <header className="shrink-0 pr-12 md:pr-0">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6">
                      {artists.map((name, i) => (
                        <button key={i} onClick={() => onArtistClick(name)} className="text-brand font-black uppercase text-[11px] md:text-[12px] tracking-tighter italic hover:text-white transition-colors flex items-center shrink-0">
                          {name}{i < artists.length - 1 && <span className="text-zinc-700 ml-3 not-italic">/</span>}
                        </button>
                      ))}
                    </div>
                    <div className="py-2">
                      <h2 className={`${getFontSize(album.title)} font-black uppercase italic tracking-tighter leading-[0.95] text-white transition-all duration-300 break-words`}>
                        {album.title}
                      </h2>
                    </div>
                  </header>

                  {/* Sztywny Dół - Budowany OD SPODU do góry */}
                  <div className="flex flex-col gap-6 md:gap-8 border-t border-white/5 pt-6 shrink-0">
                    
                    {/* Poziom 3: Rok wydania i Gatunek */}
                    <div className="flex flex-wrap gap-2">
                      <Badge icon={<Calendar size={12}/>} text={album.year?.toString() || '—'} />
                      {album.genre && <Badge icon={<Disc size={12}/>} text={album.genre} />}
                      {Number(album.rating) > 0 && <Badge icon={<Star size={12} fill="currentColor"/>} text={`${album.rating}/10`} brand />}
                    </div>

                    {/* Poziom 2: Status i Format */}
                    <div className="flex flex-wrap gap-2">
                      <Badge icon={<Search size={12}/>} text={album.format} brand />
                      <Badge 
                        icon={album.status === 'MAM' ? <BookmarkCheck size={12}/> : <Search size={12}/>} 
                        text={album.status === 'MAM' ? 'OWNED' : 'WANTED'} 
                        colorClass={album.status === 'MAM' ? 'bg-brand text-black shadow-brand/20' : 'bg-orange-500 text-black shadow-orange-500/20'}
                      />
                    </div>
                    
                    {/* Poziom 1 (NA SAMYM DOLE): Linki Spotify i YouTube */}
                    <div className="grid grid-cols-2 gap-3 pb-4 md:pb-0">
                      <ActionButton 
                        icon={<Play size={16} fill="black"/>} text="Spotify" primary 
                        onClick={() => { window.location.href = `spotify:search:${encodeURIComponent(album.artist + ' ' + album.title)}`; }} 
                      />
                      <ActionButton 
                        icon={<MonitorPlay size={16}/>} text="YouTube" 
                        onClick={() => { window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(album.artist + ' ' + album.title)}`, '_blank', 'noopener,noreferrer'); }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// MINI COMPONENTS (Zachowane bez zmian)
const Badge = ({ icon, text, brand, colorClass }: any) => (
  <span className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all shrink-0
    ${colorClass ? colorClass : (brand ? 'bg-brand text-black shadow-brand/10' : 'bg-white/5 text-zinc-500 border border-white/5 shadow-black/20')}
  `}>
    {icon} {text}
  </span>
);

const ActionButton = ({ icon, text, primary, onClick }: any) => (
  <button onClick={onClick} className={`py-4 md:py-5 rounded-[1.5rem] font-black uppercase text-[10px] md:text-[11px] tracking-[0.1em] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl ${primary ? 'bg-white text-black hover:bg-brand' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}>
    {icon} {text}
  </button>
);

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1 text-left flex-1">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-5 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all shadow-inner" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);