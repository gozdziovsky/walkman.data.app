import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Play, MonitorPlay, Trash2, Edit3, Calendar, ListMusic, 
  ChevronUp, ChevronDown, Disc, BookmarkCheck, Search, ImageIcon,
  ChevronLeft, ChevronRight, X, Activity, FileText, Fingerprint
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const VinylDetailsModal = ({ album, onClose, onUpdateSuccess, onArtistClick, onNext, onPrev }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTracks, setShowTracks] = useState(false);
  const [direction, setDirection] = useState(0);
  const [form, setForm] = useState({ ...album });

  const isOwned = ['OWNED', 'MAM'].includes(String(album.status).trim().toUpperCase());
  const displayStatus = isOwned ? 'OWNED' : 'WANTED';

  useEffect(() => {
    setForm({ ...album, status: displayStatus });
    setIsEdit(false);
    setShowTracks(false);
    setDirection(0);
  }, [album, displayStatus]);

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
    if (len < 12) return 'text-4xl md:text-8xl lg:text-9xl';
    if (len < 25) return 'text-3xl md:text-7xl lg:text-8xl';
    if (len < 45) return 'text-2xl md:text-5xl lg:text-6xl';
    return 'text-xl md:text-4xl lg:text-5xl';
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('vinyls').update(form).eq('id', album.id);
      onUpdateSuccess(); 
      setIsEdit(false);
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  const hasTracks = album.tracks && album.tracks.trim().length > 0;

  const parsedTracks = useMemo(() => {
    if (!album.tracks) return [];
    const lines = album.tracks.split('\n').filter((t: string) => t.trim() !== '');
    let autoNum = 1;

    return lines.map((line: string) => {
      if (/^(Side [A-Z]|CD \d+|Vinyl \d+|Strona [A-Z]|A:|B:|C:|D:)/i.test(line.trim())) {
        return { isHeader: true, title: line.replace(':', '').trim() };
      }
      const durationMatch = line.match(/\s*(?:- )?(?:\(|\[)?(\d{1,2}:\d{2})(?:\)|\])?\s*$/);
      let duration = '';
      let cleanLine = line;
      if (durationMatch) {
        duration = durationMatch[1];
        cleanLine = line.slice(0, durationMatch.index).trim();
      }
      const numMatch = cleanLine.match(/^([A-D]?\d+)[\.\-\s]+(.*)$/i);
      let num = '';
      let title = cleanLine;

      if (numMatch) {
        num = numMatch[1];
        title = numMatch[2].trim();
      } else {
        num = autoNum.toString();
        title = cleanLine.trim();
      }
      autoNum++;
      return { isHeader: false, num, title, duration };
    });
  }, [album.tracks]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      onClick={onClose}
      className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-2xl flex items-end md:items-center justify-center p-0 md:p-6"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0e0e10] w-full max-w-5xl h-[92vh] md:h-[85vh] rounded-t-[2.5rem] md:rounded-[3.5rem] flex flex-col md:flex-row overflow-hidden relative transform-gpu will-change-transform shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5 md:border-b"
      >
        
        {/* UPPER NAVIGATION */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-[100] flex items-center gap-2">
          {!isEdit && onPrev && (
            <button onClick={() => { setDirection(-1); onPrev(); }} className="p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white hover:bg-orange-500 transition-all border border-white/5 active:scale-90">
              <ChevronLeft size={18} />
            </button>
          )}
          {!isEdit && onNext && (
            <button onClick={() => { setDirection(1); onNext(); }} className="p-3 md:p-4 bg-black/50 backdrop-blur-md rounded-full text-white/50 hover:text-white hover:bg-orange-500 transition-all border border-white/5 active:scale-90">
              <ChevronRight size={18} />
            </button>
          )}
          <button onClick={onClose} className="p-3 md:p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-orange-500 hover:text-black transition-all border border-white/10 active:scale-90 ml-2">
            <X size={18} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={album.id + (isEdit ? '-edit' : '-view')}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            drag={!isEdit ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -60 && onNext) { setDirection(1); onNext(); }
              else if (offset.x > 60 && onPrev) { setDirection(-1); onPrev(); }
            }}
            className="flex flex-col md:flex-row w-full h-full relative"
          >
            
            {/* TRACKLIST OVERLAY */}
            <AnimatePresence>
              {showTracks && !isEdit && (
                <motion.div 
                  initial={{ opacity: 0, y: "10%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "10%" }} 
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} 
                  drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
                  onDragEnd={(e, { offset }) => { if (offset.y > 60) setShowTracks(false); }}
                  className="absolute inset-0 md:right-auto md:w-1/2 p-6 md:p-8 overflow-y-auto bg-black/80 backdrop-blur-3xl z-[80] no-scrollbar text-left pb-32 border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between mb-6 sticky top-0 bg-transparent py-2 z-30">
                    <h4 className="text-brand text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 drop-shadow-md"><ListMusic size={14}/> Tracks</h4>
                    <button onClick={() => setShowTracks(false)} className="p-2 bg-white/10 rounded-full hover:bg-orange-500 hover:text-black transition-colors backdrop-blur-md"><ChevronDown size={16}/></button>
                  </div>
                  
                  <div className="space-y-0.5 pb-6">
                    {parsedTracks.map((track: any, idx: number) => {
                      if (track.isHeader) {
                        return (
                          <div key={idx} className="mt-8 mb-4 first:mt-0 px-2 flex items-center gap-3">
                            <div className="p-1.5 bg-orange-500/10 rounded-lg">
                              <Disc size={12} className="text-orange-500"/>
                            </div>
                            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">{track.title}</span>
                            <div className="flex-1 h-px bg-gradient-to-r from-orange-500/20 to-transparent ml-2 rounded-full"></div>
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors group cursor-default">
                          <div className="w-5 relative flex justify-end shrink-0">
                            <span className="text-[10px] md:text-[11px] font-black text-zinc-500 group-hover:opacity-0 transition-opacity tabular-nums">{track.num}</span>
                            <Play size={10} className="absolute opacity-0 group-hover:opacity-100 text-orange-500 top-1/2 -translate-y-1/2 right-0 transition-opacity" fill="currentColor" />
                          </div>
                          <span className="text-[11px] md:text-[12px] font-bold text-zinc-200 group-hover:text-white transition-colors truncate flex-1">{track.title}</span>
                          {track.duration && <span className="text-[9px] md:text-[10px] font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors shrink-0">{track.duration}</span>}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* LEFT: COVER SECTION */}
            {!isEdit && (
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:h-full relative bg-zinc-950 shrink-0 group border-b md:border-b-0 md:border-r border-white/5 overflow-hidden">
                <motion.div 
                  className="w-full h-full relative cursor-pointer" 
                  onClick={() => hasTracks && setShowTracks(true)}
                  drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.2}
                  onDragEnd={(e, { offset }) => { if (offset.y < -40 && hasTracks) setShowTracks(true); }}
                >
                  <img src={album.coverUrl || album.cover_url} className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-500 group-hover:scale-105" alt="" />
                  <button onClick={(e) => { e.stopPropagation(); setIsEdit(true); }} className="absolute bottom-4 left-4 md:bottom-6 md:left-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl text-white/50 hover:text-orange-500 transition-all border border-white/10 active:scale-90 shadow-2xl z-50 hover:border-orange-500/30">
                    <Edit3 size={18} />
                  </button>
                  {hasTracks && !showTracks && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-50 group-hover:opacity-100 transition-opacity animate-bounce">
                      <ChevronUp size={24} className="drop-shadow-lg" /><span className="text-[9px] font-black uppercase tracking-widest drop-shadow-lg">Tracks</span>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* RIGHT: DATA & EDIT SECTION */}
            <div className={`flex-1 flex flex-col min-h-0 bg-gradient-to-br from-[#0e0e10] to-black relative ${isEdit ? 'w-full' : ''}`}>
              
              {isEdit ? (
                <div className="flex flex-col w-full h-full">
                  <div className="flex-1 overflow-y-auto overscroll-contain p-6 md:p-12 lg:px-24 no-scrollbar space-y-12 md:space-y-16" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <header className="flex items-center justify-between pb-6 border-b border-white/5 pt-2 pr-16 md:pr-0">
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest text-brand flex items-center gap-3"><Edit3 size={24}/> Edit Physical Data</h3>
                    </header>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Disc size={14}/> Core Information</label>
                      <div className="space-y-4">
                        <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
                        <FormInput label="Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
                        <div className="grid grid-cols-2 gap-4">
                           <FormInput label="Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                           <FormInput label="Genre" value={form.genre || ''} onChange={(v:any) => setForm({...form, genre: v})} />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Fingerprint size={14}/> Physical Specifications</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput label="Format" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
                        <FormInput label="Variant / Color" value={form.variant || ''} onChange={(v:any) => setForm({...form, variant: v})} />
                        <FormInput label="Label / Pressing" value={form.label || ''} onChange={(v:any) => setForm({...form, label: v})} />
                        <FormInput label="Matrix Number" value={form.matrix_number || ''} onChange={(v:any) => setForm({...form, matrix_number: v})} />
                      </div>
                    </section>

                    <section className="space-y-6">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Activity size={14}/> Grading & Status</label>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <FormSelect label="Media Condition" value={form.condition_media} onChange={(v:any) => setForm({...form, condition_media: v})} options={['M', 'NM', 'VG+', 'VG', 'G', 'P']} />
                        <FormSelect label="Sleeve Condition" value={form.condition_sleeve} onChange={(v:any) => setForm({...form, condition_sleeve: v})} options={['M', 'NM', 'VG+', 'VG', 'G', 'P', 'Generic']} />
                      </div>
                      <div className="flex gap-2 p-1.5 bg-zinc-950/50 rounded-[1.5rem] border border-white/5">
                        <button onClick={() => setForm({...form, status: 'OWNED'})} className={`flex-1 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'OWNED' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600 hover:text-white'}`}>Owned</button>
                        <button onClick={() => setForm({...form, status: 'WANTED'})} className={`flex-1 py-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'WANTED' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-zinc-600 hover:text-white'}`}>Wanted</button>
                      </div>
                    </section>

                    <section className="space-y-6 pb-12">
                      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><FileText size={14}/> Notes & Media</label>
                      <FormInput label="Cover Image URL" value={form.coverUrl || form.cover_url} onChange={(v:any) => setForm({...form, cover_url: v})} />
                      <div className="pt-4 space-y-4 text-left">
                        <div>
                          <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Collector Notes</label>
                          <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-300 outline-none focus:border-brand/50 transition-all h-24 resize-none shadow-inner mt-1" value={form.notes || ''} placeholder="Bought in Tokyo, 2024..." onChange={e => setForm({...form, notes: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Tracklist (Raw Text)</label>
                          <textarea className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs font-mono text-zinc-400 outline-none focus:border-brand/50 transition-all h-32 resize-none no-scrollbar shadow-inner mt-1" value={form.tracks} placeholder="Np. Side A&#10;A1. Intro" onChange={e => setForm({...form, tracks: e.target.value})} />
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="shrink-0 p-6 md:p-12 pt-6 bg-[#0e0e10] border-t border-white/5 z-30 relative">
                    <button onClick={handleUpdate} disabled={loading} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-[0_0_20px_rgba(var(--brand-rgb),0.15)] flex items-center justify-center gap-2">
                      {loading ? <span className="animate-pulse">Saving Changes...</span> : 'Commit Changes'}
                    </button>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setIsEdit(false)} className="flex-1 py-5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all">Cancel</button>
                      <button onClick={() => { if(confirm('Purge this record from the archive?')) { supabase.from('vinyls').delete().eq('id', album.id).then(() => { onUpdateSuccess(); onClose(); })} }} className="px-8 py-5 bg-red-900/10 border border-red-900/20 text-red-500 rounded-[1.5rem] hover:bg-red-900/30 transition-all active:scale-95 flex items-center justify-center">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between no-scrollbar p-6 md:p-14 lg:p-20 pt-10 md:pt-14 text-left relative min-h-0">
                  
                  {/* BADGES: Wyróżnienie fizyczne na górze */}
                  <div className="flex flex-wrap gap-3 mb-6 z-50">
                    <Badge icon={<Disc size={12}/>} text={album.format} brand className="shadow-xl" />
                    <Badge 
                      icon={displayStatus === 'OWNED' ? <BookmarkCheck size={12}/> : <Search size={12}/>} 
                      text={displayStatus} 
                      colorClass={displayStatus === 'OWNED' ? 'bg-brand text-black' : 'bg-orange-500 text-black'}
                      className="shadow-xl"
                    />
                    {isOwned && (
                      <Badge 
                        icon={<Activity size={12}/>} 
                        text={`Media: ${album.condition_media || 'NM'} / Sleeve: ${album.condition_sleeve || 'NM'}`} 
                        className="shadow-xl bg-zinc-800 text-white" 
                      />
                    )}
                  </div>

                  <header className="flex-1 flex flex-col justify-center pr-12 md:pr-0 min-h-0">
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mb-2">
                      {artists.map((name, i) => (
                        <button key={i} onClick={() => onArtistClick(name)} className="text-brand font-black uppercase text-[10px] md:text-[12px] tracking-tighter italic hover:text-white transition-colors flex items-center shrink-0">
                          {name}{i < artists.length - 1 && <span className="text-zinc-700 ml-2 md:ml-3 not-italic">/</span>}
                        </button>
                      ))}
                    </div>
                    <div className="py-1 min-h-0">
                      <h2 className={`${getFontSize(album.title)} font-black uppercase italic tracking-tighter leading-[0.85] text-white break-words line-clamp-3 md:line-clamp-none transition-all duration-300`}>
                        {album.title}
                      </h2>
                    </div>
                  </header>

                  <div className="shrink-0 flex flex-col gap-4 border-t border-white/5 pt-5 cursor-default mt-4">
                    
                    {/* Informacje Tłoczenia */}
                    <div className="flex flex-col gap-2">
                      {(album.variant || album.label) && (
                         <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                           {album.variant && <span className="text-brand">{album.variant}</span>}
                           {album.variant && album.label && <span className="text-zinc-700">•</span>}
                           {album.label && <span>{album.label}</span>}
                         </div>
                      )}
                      {album.matrix_number && (
                        <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Fingerprint size={10} /> {album.matrix_number}
                        </div>
                      )}
                    </div>

                    {/* Notatki Kolekcjonerskie */}
                    {album.notes && (
                      <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 mt-2">
                        <div className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5"><FileText size={10}/> Collector Notes</div>
                        <p className="text-xs text-zinc-300 italic leading-relaxed">{album.notes}</p>
                      </div>
                    )}

                    {/* Wiersz z rokiem i gatunkiem */}
                    <div className="flex flex-wrap gap-2 w-full mt-2">
                      <Badge icon={<Calendar size={12}/>} text={album.year?.toString() || '—'} />
                      {album.genre && <Badge icon={<Disc size={12}/>} text={album.genre} className="ml-auto" />}
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

// MINI COMPONENTS 
const Badge = ({ icon, text, brand, colorClass, className = '' }: any) => (
  <span className={`px-3 py-1.5 md:px-4 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-lg transition-all shrink-0
    ${colorClass ? colorClass : (brand ? 'bg-brand text-black shadow-brand/10' : 'bg-white/5 text-zinc-500 border border-white/5 shadow-black/20')}
    ${className}
  `}>
    {icon} {text}
  </span>
);

const FormInput = ({ label, value, onChange, type = "text", placeholder="" }: any) => (
  <div className="space-y-1 text-left flex-1">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all shadow-inner placeholder:text-zinc-800" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const FormSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1 text-left flex-1">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <select className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all cursor-pointer appearance-none shadow-inner" value={value} onChange={e => onChange(e.target.value)}>
      {options.map((opt:string) => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
    </select>
  </div>
);