import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutGrid, Zap, BookmarkCheck, Disc, ArrowUpDown, ChevronDown, Search, Key, Palette } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  cols: number;
  setCols: (cols: number) => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
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

const themes = [
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Lime', color: '#84cc16' },
  { name: 'Pink', color: '#ec4899' },
];

export const SettingsModal = ({ 
  onClose, cols, setCols, themeColor, setThemeColor,
  defaultFormat, setDefaultFormat, defaultStatus, setDefaultStatus, defaultSort, setDefaultSort,
  searchSource, setSearchSource, discogsToken, setDiscogsToken
}: SettingsModalProps) => {

  const [isStartupOpen, setIsStartupOpen] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">System <span className="text-brand">Config</span></h3>
            <p className="text-[9px] font-black text-zinc-500 uppercase mt-2">Personalize your archive</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        <div className="space-y-8 text-left">
          {/* THEME SELECTOR */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <Palette size={12} />
              <span className="text-[9px] font-black uppercase tracking-widest leading-none">Interface Theme</span>
            </div>
            <div className="flex flex-wrap gap-3 bg-black/40 p-4 rounded-2xl border border-white/5 justify-center">
              {themes.map((t) => (
                <button
                  key={t.color}
                  onClick={() => setThemeColor(t.color)}
                  className={`w-8 h-8 rounded-full transition-all active:scale-75 ${
                    themeColor === t.color 
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110' 
                      : 'opacity-40 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.color }}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500"><LayoutGrid size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Grid Viewport</span></div>
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[1, 2, 3, 4].map((num) => (
                <button key={num} onClick={() => setCols(num)} className={`py-3 rounded-xl text-xs font-black transition-all ${cols === num ? 'bg-white text-black shadow-lg' : 'text-zinc-600'}`}>{num}</button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500"><Search size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Search Engine</span></div>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              <button onClick={() => setSearchSource('itunes')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'itunes' ? 'bg-white text-black' : 'text-zinc-600'}`}>iTunes</button>
              <button onClick={() => setSearchSource('discogs')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'discogs' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600'}`}>Discogs</button>
            </div>
          </section>

          <section className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-zinc-500"><Key size={12} /><span className="text-[9px] font-black uppercase tracking-widest leading-none">Discogs API Token</span></div>
            <input type="password" placeholder="Paste Token..." className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-[10px] font-mono outline-none focus:border-brand/50 text-white" value={discogsToken} onChange={(e) => setDiscogsToken(e.target.value)} />
          </section>

          <div className="space-y-4">
            <button onClick={() => setIsStartupOpen(!isStartupOpen)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${isStartupOpen ? 'bg-brand text-black' : 'bg-brand/10 text-brand'}`}><Zap size={14} fill={isStartupOpen ? "currentColor" : "none"} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.1em]">Startup Defaults</h4>
              </div>
              <motion.div animate={{ rotate: isStartupOpen ? 180 : 0 }} className="text-zinc-500"><ChevronDown size={18} /></motion.div>
            </button>

            <AnimatePresence>
              {isStartupOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-2xl p-5 space-y-8">
                  <section>
                    <Label title="Default Status" />
                    <div className="grid grid-cols-3 gap-2">
                      {['ALL', 'MAM', 'SZUKAM'].map(s => <button key={s} onClick={() => setDefaultStatus(s)} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${localStorage.getItem('walkman_default_status') === s ? 'border-brand text-brand bg-brand/5' : 'border-white/5 text-zinc-600'}`}>{s === 'SZUKAM' ? 'WISH' : s}</button>)}
                    </div>
                  </section>
                  <section>
                    <Label title="Default Format" />
                    <div className="grid grid-cols-4 gap-2">
                      {['ALL', 'FLAC', 'MP3', 'Hi-Res'].map(f => <button key={f} onClick={() => setDefaultFormat(f)} className={`py-2.5 rounded-lg text-[9px] font-black uppercase border transition-all ${localStorage.getItem('walkman_default_format') === f ? 'border-brand text-brand bg-brand/5' : 'border-white/5 text-zinc-600'}`}>{f}</button>)}
                    </div>
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