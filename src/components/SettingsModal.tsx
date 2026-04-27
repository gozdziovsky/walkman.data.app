import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Zap, BookmarkCheck, Disc, ArrowUpDown, ChevronDown, Search, Key } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  cols: number;
  setCols: (cols: number) => void;
  defaultFormat: string;
  setDefaultFormat: (f: string) => void;
  defaultStatus: string;
  setDefaultStatus: (s: string) => void;
  defaultSort: string;
  setDefaultSort: (s: any) => void;
  searchSource: 'itunes' | 'discogs';
  setSearchSource: (s: 'itunes' | 'discogs') => void;
  discogsToken: string;
  setDiscogsToken: (t: string) => void;
}

export const SettingsModal = ({ 
  onClose, cols, setCols, 
  defaultFormat, setDefaultFormat,
  defaultStatus, setDefaultStatus,
  defaultSort, setDefaultSort,
  searchSource, setSearchSource,
  discogsToken, setDiscogsToken
}: SettingsModalProps) => {

  const [isStartupOpen, setIsStartupOpen] = useState(false);

  const updateDefault = (key: string, value: string, setter: (v: string) => void) => {
    localStorage.setItem(key, value);
    setter(value);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">System <span className="text-green-500">Config</span></h3>
            <p className="text-[9px] font-black text-zinc-500 uppercase mt-2">Personalize your archive</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-400"><X size={20} /></button>
        </header>

        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500"><LayoutGrid size={12} /><span className="text-[9px] font-black uppercase">Grid Viewport</span></div>
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[1, 2, 3, 4].map((num) => (
                <button key={num} onClick={() => { localStorage.setItem('walkman_cols', num.toString()); setCols(num); }} className={`py-3 rounded-xl text-xs font-black transition-all ${cols === num ? 'bg-white text-black' : 'text-zinc-600'}`}>{num}</button>
              ))}
            </div>
          </section>

          <hr className="border-white/5" />

          {/* SEARCH ENGINE SWITCH */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500"><Search size={12} /><span className="text-[9px] font-black uppercase">Search Engine</span></div>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => { localStorage.setItem('walkman_search_source', 'itunes'); setSearchSource('itunes'); }} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'itunes' ? 'bg-white text-black' : 'text-zinc-600'}`}>iTunes</button>
              <button onClick={() => { localStorage.setItem('walkman_search_source', 'discogs'); setSearchSource('discogs'); }} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'discogs' ? 'bg-blue-500 text-white shadow-lg' : 'text-zinc-600'}`}>Discogs</button>
            </div>
          </section>

          {/* DISCOGS TOKEN INPUT */}
          <section className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-zinc-500"><Key size={12} /><span className="text-[9px] font-black uppercase">Discogs API Token</span></div>
            <input type="password" placeholder="Paste Personal Token..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-mono outline-none focus:border-blue-500/50" value={discogsToken} onChange={(e) => { localStorage.setItem('walkman_discogs_token', e.target.value); setDiscogsToken(e.target.value); }} />
          </section>

          {/* STARTUP DEFAULTS (COLLAPSIBLE) */}
          <div className="space-y-4">
            <button onClick={() => setIsStartupOpen(!isStartupOpen)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isStartupOpen ? 'bg-green-500 text-black' : 'bg-green-500/10 text-green-500'}`}><Zap size={14} fill={isStartupOpen ? "currentColor" : "none"} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.1em]">Startup Defaults</h4>
              </div>
              <motion.div animate={{ rotate: isStartupOpen ? 180 : 0 }} className="text-zinc-500"><ChevronDown size={18} /></motion.div>
            </button>

            <AnimatePresence>
              {isStartupOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-2xl p-4 space-y-6">
                  <section>
                    <Label title="Default Status" /><div className="grid grid-cols-3 gap-2">{['ALL', 'MAM', 'SZUKAM'].map(s => <button key={s} onClick={() => updateDefault('walkman_default_status', s, setDefaultStatus)} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${defaultStatus === s ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-zinc-600'}`}>{s === 'SZUKAM' ? 'WISH' : s}</button>)}</div>
                  </section>
                  <section>
                    <Label title="Default Format" /><div className="grid grid-cols-4 gap-2">{['ALL', 'FLAC', 'MP3', 'Hi-Res'].map(f => <button key={f} onClick={() => updateDefault('walkman_default_format', f, setDefaultFormat)} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${defaultFormat === f ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-zinc-600'}`}>{f}</button>)}</div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Label = ({ title }: { title: string }) => <div className="text-[9px] font-black uppercase text-zinc-600 mb-2">{title}</div>;
