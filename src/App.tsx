import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Settings, Library, Loader2, X, Clock, SortAsc } from 'lucide-react';

import { AlbumCard } from './components/AlbumCard';
import { DetailsModal } from './components/DetailsModal';
import { AddAlbumModal } from './components/AddAlbumModal';
import { SettingsModal } from './components/SettingsModal';
import { supabase } from './lib/supabase';
import type { Album } from './types/album';

export default function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [appName, setAppName] = useState(() => localStorage.getItem('walkman_cloud_name') || 'Walkman');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'MAM' | 'SZUKAM'>('ALL');
  const [sortBy, setSortBy] = useState<'DATE' | 'ALPHA'>('DATE');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('albums').select('*');
      if (error) throw error;
      if (data) setAlbums(data as Album[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlbums(); }, []);

  const filteredAlbums = albums
    .filter(album => {
      const matchesSearch = 
        album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (album.genre && album.genre.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFilter = filterStatus === 'ALL' || album.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'ALPHA') return a.artist.localeCompare(b.artist);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-green-500/30">
      
      {/* HEADER SECTION */}
      <header className="pt-16 pb-8 px-6 max-w-7xl mx-auto flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic text-center leading-tight">
            {appName} <span className="text-green-500 not-italic">Cloud</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-[1px] w-8 bg-zinc-800" />
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Audio Archive</p>
            <div className="h-[1px] w-8 bg-zinc-800" />
          </div>
        </motion.div>

        {/* STATS STRIP */}
        <div className="flex gap-4 mt-10 w-full max-w-sm">
          <div className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Library</p>
            <p className="text-2xl font-black tabular-nums">{loading ? '..' : albums.filter(a => a.status === 'MAM').length}</p>
          </div>
          <div className="flex-1 bg-zinc-900/50 border border-white/5 p-4 rounded-2xl text-center">
            <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mb-1">Wanted</p>
            <p className="text-2xl font-black text-orange-500 tabular-nums">{loading ? '..' : albums.filter(a => a.status === 'SZUKAM').length}</p>
          </div>
        </div>
      </header>

      {/* FILTER CONTROLS */}
      <nav className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-white/[0.03] py-4 mb-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
            {['ALL', 'MAM', 'SZUKAM'].map((s) => (
              <button 
                key={s} 
                onClick={() => setFilterStatus(s as any)}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === s ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                {s === 'ALL' ? 'Everything' : s === 'MAM' ? 'Owned' : 'Wishlist'}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setSortBy(sortBy === 'DATE' ? 'ALPHA' : 'DATE')}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-green-500 transition-colors"
          >
            {sortBy === 'DATE' ? <Clock size={14} /> : <SortAsc size={14} />}
            {sortBy === 'DATE' ? 'Recent First' : 'A-Z Artist'}
          </button>
        </div>
      </nav>

      {/* GRID */}
      <main className="px-6 max-w-7xl mx-auto pb-40">
        {loading ? (
          <div className="flex justify-center py-20 opacity-20"><Loader2 className="animate-spin w-8 h-8" /></div>
        ) : (
          <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-10">
            <AnimatePresence mode="popLayout">
              {filteredAlbums.map((album) => (
                <AlbumCard key={album.id} album={album} onClick={() => setSelectedAlbum(album)} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* MODALS */}
      <AnimatePresence>
        {isAddModalOpen && <AddAlbumModal onClose={() => setIsAddModalOpen(false)} onSuccess={fetchAlbums} />}
        {selectedAlbum && <DetailsModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums} />}
        {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} appName={appName} onSave={(val) => { setAppName(val); localStorage.setItem('walkman_cloud_name', val); }} />}
      </AnimatePresence>

      {/* BOTTOM NAV */}
      <motion.nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-full flex items-center gap-2 shadow-2xl z-50">
        {!isSearchOpen ? (
          <>
            <button className="p-4 bg-white text-black rounded-full transition-transform active:scale-90"><Library size={20} strokeWidth={2.5} /></button>
            <button onClick={() => setIsSearchOpen(true)} className="p-4 text-zinc-400 hover:text-white"><Search size={20} /></button>
            <button onClick={() => setIsAddModalOpen(true)} className="p-4 text-zinc-400 hover:text-white"><Plus size={20} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-4 text-zinc-400 hover:text-white"><Settings size={20} /></button>
          </>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 min-w-[280px]">
            <Search size={18} className="text-zinc-500" />
            <input autoFocus type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent border-none outline-none text-sm font-bold flex-1 text-white" />
            <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-1 text-zinc-500"><X size={18} /></button>
          </div>
        )}
      </motion.nav>
    </div>
  );
}