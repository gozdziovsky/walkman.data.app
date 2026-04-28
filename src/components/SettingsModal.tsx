import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LayoutGrid, Zap, ChevronDown, Key, Palette, 
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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
  { name: 'Pink', color: '#ec4899' }
];

export const SettingsModal = ({ 
  onClose, cols, setCols, themeColor, setThemeColor, 
  defaultFormat, setDefaultFormat, defaultStatus, setDefaultStatus, 
  defaultSort, setDefaultSort, searchSource, setSearchSource, 
  discogsToken, setDiscogsToken 
}: any) => {
  
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isStartupOpen, setIsStartupOpen] = useState(false);
  
  // Stany połączeń
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [discogsConnected, setDiscogsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    checkConnections();
  }, [discogsToken]);

  const checkConnections = async () => {
    try {
      const { error } = await supabase.from('albums').select('id').limit(1);
      setDbConnected(!error);
    } catch {
      setDbConnected(false);
    }

    if (!discogsToken) {
      setDiscogsConnected(false);
    } else {
      try {
        const res = await fetch(`https://api.discogs.com/database/search?q=test&token=${discogsToken}`);
        setDiscogsConnected(res.ok);
      } catch {
        setDiscogsConnected(false);
      }
    }
  };

  const handleForceRefresh = () => {
    window.location.reload();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar relative" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-center mb-10 text-left">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">System <span className="text-brand">Config</span></h3>
            <p className="text-[9px] font-black text-zinc-500 uppercase mt-2">Personalize your archive</p>
          </div>
          <button type="button" onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        <div className="space-y-4 text-left">
          
          {/* Theme Selector */}
          <section className="space-y-2">
            <button type="button" onClick={() => setIsThemeOpen(!isThemeOpen)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isThemeOpen ? 'bg-brand text-black' : 'bg-zinc-800 text-zinc-500'}`}><Palette size={14} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Interface Theme</h4>
              </div>
              <motion.div animate={{ rotate: isThemeOpen ? 180 : 0 }} className="text-zinc-500"><ChevronDown size={18} /></motion.div>
            </button>
            <AnimatePresence>
              {isThemeOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-2xl p-5">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {themes.map(t => (
                      <button key={t.color} type="button" onClick={() => setThemeColor(t.color)} className={`w-8 h-8 rounded-full transition-all ${themeColor === t.color ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-100'}`} style={{ backgroundColor: t.color }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Grid Layout */}
          <section className="bg-black/40 p-1.5 rounded-2xl border border-white/5 flex items-center">
            <div className="px-4 text-zinc-600"><LayoutGrid size={12}/></div>
            <div className="flex-1 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map(n => (
                <button key={n} type="button" onClick={() => setCols(n)} className={`py-2.5 rounded-xl text-xs font-black transition-all ${cols === n ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>{n}</button>
              ))}
            </div>
          </section>

          {/* Search Engine */}
          <section className="bg-black/40 p-1.5 rounded-2xl border border-white/5 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setSearchSource('itunes')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'itunes' ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}>iTunes</button>
            <button type="button" onClick={() => setSearchSource('discogs')} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all ${searchSource === 'discogs' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600 hover:text-white'}`}>Discogs</button>
          </section>

          {/* Discogs Token */}
          <section className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-zinc-500"><Key size={12}/><span className="text-[9px] font-black uppercase tracking-widest">Discogs API Token</span></div>
            <input type="password" placeholder="Paste Token..." className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-4 text-[10px] text-white outline-none focus:border-brand/50 transition-colors" value={discogsToken} onChange={e => setDiscogsToken(e.target.value)} />
          </section>

          {/* Startup Defaults */}
          <section className="space-y-2">
            <button type="button" onClick={() => setIsStartupOpen(!isStartupOpen)} className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isStartupOpen ? 'bg-brand text-black' : 'bg-zinc-800 text-zinc-500'}`}><Zap size={14} /></div>
                <h4 className="text-[11px] font-black uppercase tracking-widest">Startup Defaults</h4>
              </div>
              <motion.div animate={{ rotate: isStartupOpen ? 180 : 0 }} className="text-zinc-500"><ChevronDown size={18} /></motion.div>
            </button>
            <AnimatePresence>
              {isStartupOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20 rounded-2xl p-5 space-y-6">
                  
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-zinc-600 mb-2">Default Status</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['ALL', 'MAM', 'SZUKAM'].map(s => (
                        <button key={s} type="button" onClick={() => setDefaultStatus(s)} className={`py-2.5 rounded-lg text-[9px] font-black border transition-all ${defaultStatus === s ? 'border-brand text-brand bg-brand/5' : 'border-white/5 text-zinc-600 hover:text-white'}`}>{s === 'SZUKAM' ? 'WISH' : s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-zinc-600 mb-2">Default Format</p>
                    <div className="grid grid-cols-4 gap-2">
                      {['ALL', 'FLAC', 'MP3', 'Hi-Res'].map(f => (
                        <button key={f} type="button" onClick={() => setDefaultFormat(f)} className={`py-2.5 rounded-lg text-[9px] font-black border transition-all ${defaultFormat === f ? 'border-brand text-brand bg-brand/5' : 'border-white/5 text-zinc-600 hover:text-white'}`}>{f}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase text-zinc-600 mb-2">Default Sort Order</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[{id:'recent', l:'RECENT'}, {id:'artist', l:'ARTIST A-Z'}, {id:'album', l:'ALBUM A-Z'}, {id:'year', l:'YEAR'}].map(opt => (
                        <button key={opt.id} type="button" onClick={() => setDefaultSort(opt.id as any)} className={`py-3 rounded-lg text-[9px] font-black uppercase border transition-all ${defaultSort === opt.id ? 'border-brand text-brand bg-brand/5' : 'border-white/5 text-zinc-600 hover:text-white'}`}>{opt.l}</button>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* --- SYSTEM HEALTH & REFRESH (Pancerny układ pionowy) --- */}
          <section className="pt-6 border-t border-white/5 mt-6 flex flex-col gap-3">
            <div className="flex items-center justify-around bg-black/40 p-4 rounded-2xl border border-white/5">
              
              <div className="flex items-center gap-3">
                <StatusDot active={dbConnected} />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Database</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase leading-none ${dbConnected ? 'text-green-500' : 'text-red-500'}`}>{dbConnected ? 'Online' : 'Offline'}</span>
                </div>
              </div>

              <div className="w-px h-8 bg-white/10" />

              <div className="flex items-center gap-3">
                <StatusDot active={discogsConnected} />
                <div className="flex flex-col text-right">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">Discogs API</span>
                  <span className={`text-[10px] font-bold mt-1 uppercase leading-none ${discogsConnected ? 'text-green-500' : 'text-red-500'}`}>{discogsConnected ? 'Online' : 'No Token'}</span>
                </div>
              </div>

            </div>

            <button 
              onClick={handleForceRefresh}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-brand hover:text-black text-zinc-500 py-4 rounded-2xl border border-white/5 transition-all active:scale-95 group"
            >
              <RefreshCw size={14} className="group-hover:animate-spin transition-colors" />
              <span className="text-[10px] font-black uppercase tracking-widest">Force App Refresh</span>
            </button>
          </section>

        </div>

        <footer className="pt-8 opacity-20 text-[8px] font-black uppercase tracking-[0.3em] text-center text-zinc-500">
          Encrypted Local Storage Sync
        </footer>
      </motion.div>
    </motion.div>
  );
};

// Pomocniczy komponent dla pulsującej diody
const StatusDot = ({ active }: { active: boolean | null }) => (
  <div className="relative flex h-2.5 w-2.5 shrink-0">
    {active && (
      <motion.span 
        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${active ? 'bg-green-500' : 'bg-red-500'}`}
      />
    )}
    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${active === null ? 'bg-zinc-700' : active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`} />
  </div>
);