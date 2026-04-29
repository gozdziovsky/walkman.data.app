import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, LayoutGrid, Key, Info, Home, EyeOff, RefreshCw, 
  Database, Radio, ChevronDown, Settings2, Disc 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SettingsModal = ({ onClose, cols, setCols }: any) => {
  const [token, setToken] = useState(() => localStorage.getItem('discogs_token') || '');
  const [defaultTab, setDefaultTab] = useState(() => localStorage.getItem('default_archive') || 'digital');
  const [showNav, setShowNav] = useState(() => localStorage.getItem('show_nav') !== 'false');
  
  const [dbStatus, setDbStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [dgStatus, setDgStatus] = useState<'loading' | 'ok' | 'err'>('loading');

  // Akordeony (Zakładki)
  const [isGlobalOpen, setIsGlobalOpen] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);

  useEffect(() => {
    supabase.from('albums').select('id', { count: 'exact', head: true }).limit(1)
      .then(({ error }) => setDbStatus(error ? 'err' : 'ok'));

    if (!token) setDgStatus('err');
    else {
      fetch('https://api.discogs.com/database/search?q=test', {
        headers: { 'Authorization': `Discogs token=${token}` }
      }).then(res => setDgStatus(res.ok ? 'ok' : 'err')).catch(() => setDgStatus('err'));
    }
  }, [token]);

  const saveSetting = (key: string, val: any) => {
    localStorage.setItem(key, val.toString());
    window.dispatchEvent(new Event('storage_update'));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
      onClick={onClose}
      className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-2xl flex items-end md:items-center justify-center p-0 md:p-6"
    >
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 35, stiffness: 400 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#0e0e10] w-full max-w-2xl h-[92vh] md:h-auto md:max-h-[85vh] rounded-t-[2.5rem] md:rounded-[3.5rem] flex flex-col border border-white/10 border-b-0 md:border-b shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative"
      >
        {/* HEADER */}
        <header className="shrink-0 p-8 md:p-12 pb-6 flex justify-between items-start bg-[#0e0e10] z-10 border-b border-white/5">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
              System <span className="text-brand">Protocol</span>
            </h2>
            <div className="flex gap-3 mt-5">
              <StatusLamp label="Supabase" status={dbStatus} icon={<Database size={12}/>} />
              <StatusLamp label="Discogs" status={dgStatus} icon={<Radio size={12}/>} />
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-brand hover:text-black transition-all active:scale-90">
            <X size={20} />
          </button>
        </header>

        {/* CONTENT (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 no-scrollbar space-y-4">
          
          {/* ACCORDION 1: GLOBAL SETTINGS */}
          <div className="bg-zinc-900/30 border border-white/5 rounded-[2rem] overflow-hidden">
            <button 
              onClick={() => setIsGlobalOpen(!isGlobalOpen)}
              className="w-full flex items-center justify-between p-6 md:p-8 bg-black/20 hover:bg-black/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <Settings2 size={20} className="text-brand" />
                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-white">Global Preferences</span>
              </div>
              <motion.div animate={{ rotate: isGlobalOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown size={20} className="text-zinc-500" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {isGlobalOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-6 md:p-8 pt-2 space-y-10">
                    
                    <section className="space-y-4">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Home size={16} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em]">Default Boot Archive</label>
                      </div>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {['digital', 'vinyl', 'cd'].map(tab => (
                          <button 
                            key={tab} onClick={() => { setDefaultTab(tab); saveSetting('default_archive', tab); }}
                            className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all border
                              ${defaultTab === tab ? 'bg-brand text-black border-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.15)]' : 'bg-zinc-950 text-zinc-500 border-white/5 hover:border-white/10'}`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="flex items-center justify-between p-5 bg-zinc-950 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <EyeOff size={18} className="text-zinc-500" />
                        <div className="flex flex-col text-left">
                          <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-zinc-300 leading-none">Navigation Bar</span>
                          <span className="text-[8px] font-bold text-zinc-600 uppercase mt-2">Show/Hide Top Header</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { setShowNav(!showNav); saveSetting('show_nav', !showNav); }}
                        className={`w-14 h-7 rounded-full transition-all relative p-1 ${showNav ? 'bg-brand' : 'bg-zinc-800'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${showNav ? 'translate-x-7' : 'translate-x-0'}`} />
                      </button>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <LayoutGrid size={16} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em]">Global Grid Density</label>
                      </div>
                      <div className="flex gap-2">
                        {/* ZMIENIONE NA 1-4 ZGODNIE Z PROŚBĄ */}
                        {[1, 2, 3, 4].map(n => (
                          <button 
                            key={n} onClick={() => { setCols(n); saveSetting('walkman_cols', n); }}
                            className={`flex-1 py-4 rounded-xl font-mono text-base md:text-lg font-black border transition-all
                              ${cols === n ? 'bg-brand text-black border-brand shadow-[0_0_15px_rgba(var(--brand-rgb),0.15)]' : 'bg-zinc-950 text-zinc-600 border-white/5 hover:border-white/10'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-4">
                      <div className="flex items-center gap-3 text-zinc-500">
                        <Key size={16} />
                        <label className="text-[10px] font-black uppercase tracking-[0.2em]">Discogs API Key</label>
                      </div>
                      <input 
                        type="password" placeholder="Paste Access Token..."
                        value={token} onChange={(e) => { setToken(e.target.value); saveSetting('discogs_token', e.target.value); }}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-5 py-5 text-sm font-mono text-zinc-400 outline-none focus:border-brand/50 transition-all shadow-inner"
                      />
                    </section>

                    <button 
                      onClick={() => window.location.reload()} 
                      className="w-full py-5 bg-red-900/10 hover:bg-red-900/30 text-red-500 rounded-xl border border-red-900/20 flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 group"
                    >
                      <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-700" /> 
                      Force System Refresh
                    </button>

                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ACCORDION 2: ARCHIVE SPECIFIC (PLACEHOLDER) */}
          <div className="bg-zinc-900/10 border border-white/5 rounded-[2rem] overflow-hidden opacity-50">
            <button 
              className="w-full flex items-center justify-between p-6 md:p-8 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <Disc size={20} className="text-zinc-600" />
                <span className="text-[11px] md:text-[12px] font-black uppercase tracking-[0.2em] text-zinc-600">Archive Specific Settings</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full text-zinc-500">Locked</span>
            </button>
          </div>

          <div className="pt-8 pb-4 flex items-center justify-between opacity-30 px-2">
            <div className="flex items-center gap-3">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Kernel Structure</span>
            </div>
            <span className="text-[10px] font-mono font-bold italic text-white uppercase tracking-tighter">v3.2.0-STABLE</span>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="shrink-0 p-8 md:p-12 pt-4 bg-[#0e0e10] z-10 border-t border-white/5">
          <button 
            onClick={onClose} 
            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-brand"
          >
            Apply & Close
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
};

const StatusLamp = ({ label, status, icon }: any) => (
  <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-full border border-white/5">
    {icon}
    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] ${
      status === 'ok' ? 'bg-green-500 shadow-green-500/50' : 
      status === 'err' ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-500 animate-pulse'
    }`} />
  </div>
);