import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, LayoutGrid, Key, Info, Home, EyeOff, RefreshCw, Database, Radio } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SettingsModal = ({ onClose, cols, setCols }: any) => {
  const [token, setToken] = useState(() => localStorage.getItem('discogs_token') || '');
  const [defaultTab, setDefaultTab] = useState(() => localStorage.getItem('default_archive') || 'digital');
  const [showNav, setShowNav] = useState(() => localStorage.getItem('show_nav') !== 'false');
  
  const [dbStatus, setDbStatus] = useState<'loading' | 'ok' | 'err'>('loading');
  const [dgStatus, setDgStatus] = useState<'loading' | 'ok' | 'err'>('loading');

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
        className="bg-[#0e0e10] w-full max-w-2xl h-[92vh] md:h-[85vh] rounded-t-[2.5rem] md:rounded-[3.5rem] flex flex-col border border-white/10 border-b-0 md:border-b shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative"
      >
        {/* HEADER */}
        <header className="shrink-0 p-8 md:p-14 pb-6 flex justify-between items-start bg-[#0e0e10] z-10 border-b border-white/5">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
              System <span className="text-brand">Protocol</span>
            </h2>
            <div className="flex gap-3 mt-5">
              <StatusLamp label="Supabase" status={dbStatus} icon={<Database size={12}/>} />
              <StatusLamp label="Discogs" status={dgStatus} icon={<Radio size={12}/>} />
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all active:scale-90">
            <X size={24} />
          </button>
        </header>

        {/* CONTENT (SCROLLABLE) - ZWIĘKSZONE ODSTĘPY: space-y-20 md:space-y-24 */}
        <div className="flex-1 overflow-y-auto px-8 md:px-14 py-12 no-scrollbar space-y-20 md:space-y-24">
          
          <section className="space-y-6">
            <div className="flex items-center gap-3 text-zinc-500">
              <Home size={18} />
              <label className="text-[11px] font-black uppercase tracking-[0.2em]">Default Boot Archive</label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['digital', 'vinyl', 'cd'].map(tab => (
                <button 
                  key={tab} onClick={() => { setDefaultTab(tab); saveSetting('default_archive', tab); }}
                  className={`py-5 rounded-2xl text-[10px] md:text-[12px] font-black uppercase transition-all border
                    ${defaultTab === tab ? 'bg-brand text-black border-brand shadow-[0_0_20px_rgba(var(--brand-rgb),0.15)]' : 'bg-zinc-900/50 text-zinc-500 border-white/5 hover:border-white/10'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </section>

          <section className="flex items-center justify-between p-6 md:p-8 bg-zinc-900/30 rounded-[2rem] border border-white/5">
            <div className="flex items-center gap-5">
              <EyeOff size={20} className="text-zinc-500" />
              <div className="flex flex-col">
                <span className="text-[11px] md:text-[13px] font-black uppercase tracking-widest text-zinc-300 leading-none">Navigation Bar</span>
                <span className="text-[9px] md:text-[10px] font-bold text-zinc-600 uppercase mt-2">Show/Hide Top Header</span>
              </div>
            </div>
            <button 
              onClick={() => { setShowNav(!showNav); saveSetting('show_nav', !showNav); }}
              className={`w-16 h-8 rounded-full transition-all relative p-1.5 ${showNav ? 'bg-brand' : 'bg-zinc-800'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-all shadow-md ${showNav ? 'translate-x-8' : 'translate-x-0'}`} />
            </button>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-zinc-500">
              <LayoutGrid size={18} />
              <label className="text-[11px] font-black uppercase tracking-[0.2em]">Global Grid Density</label>
            </div>
            <div className="flex gap-2 md:gap-3">
              {[2, 3, 4, 5, 6].map(n => (
                <button 
                  key={n} onClick={() => { setCols(n); saveSetting('walkman_cols', n); }}
                  className={`flex-1 py-5 md:py-6 rounded-2xl font-mono text-lg md:text-xl font-black border transition-all
                    ${cols === n ? 'bg-brand text-black border-brand shadow-[0_0_20px_rgba(var(--brand-rgb),0.15)]' : 'bg-zinc-900/50 text-zinc-600 border-white/5 hover:border-white/10'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 text-zinc-500">
              <Key size={18} />
              <label className="text-[11px] font-black uppercase tracking-[0.2em]">Discogs Integration</label>
            </div>
            <div className="space-y-3">
              <input 
                type="password" placeholder="Personal Access Token..."
                value={token} onChange={(e) => { setToken(e.target.value); saveSetting('discogs_token', e.target.value); }}
                className="w-full bg-black border border-white/10 rounded-2xl px-6 py-6 text-sm md:text-base font-mono text-zinc-400 outline-none focus:border-brand/50 transition-all shadow-inner"
              />
            </div>
          </section>

          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-6 bg-red-900/10 hover:bg-red-900/30 text-red-500 rounded-2xl border border-red-900/20 flex items-center justify-center gap-3 text-[11px] md:text-[13px] font-black uppercase tracking-widest transition-all active:scale-95 group"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" /> 
            Force System Refresh
          </button>

          <div className="pt-8 border-t border-white/5 flex items-center justify-between opacity-30 pb-4">
            <div className="flex items-center gap-3">
              <Info size={14} />
              <span className="text-[9px] font-black uppercase tracking-widest text-white">Kernel Structure</span>
            </div>
            <span className="text-[10px] font-mono font-bold italic text-white uppercase tracking-tighter">v3.1.0-STABLE</span>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="shrink-0 p-8 md:p-14 pt-6 bg-[#0e0e10] z-10 border-t border-white/5">
          <button 
            onClick={onClose} 
            className="w-full py-6 md:py-7 bg-white text-black rounded-[2rem] font-black uppercase text-xs md:text-sm tracking-[0.2em] active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:bg-brand"
          >
            Initialize Protocol
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