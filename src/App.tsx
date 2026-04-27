import { useState, useEffect, useMemo } from 'react';
import { Plus, Settings2, Search as SearchIcon } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AddAlbumModal } from './components/AddAlbumModal';
import { DetailsModal } from './components/DetailsModal';
import { SettingsModal } from './components/SettingsModal';
import type { Album } from './types/album';

function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  const [cols, setCols] = useState<number>(() => {
    const saved = localStorage.getItem('walkman_cols');
    return saved ? parseInt(saved) : 3;
  });

  const gridConfig: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  useEffect(() => { fetchAlbums(); }, []);
  useEffect(() => { localStorage.setItem('walkman_cols', cols.toString()); }, [cols]);

  const fetchAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data);
  };

  // LOGIKA STATYSTYK
  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
    wanted: albums.filter(a => a.status === 'SZUKAM').length
  }), [albums]);

  // LOGIKA WYSZUKIWANIA
  const filteredAlbums = useMemo(() => {
    return albums.filter(a => 
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.artist.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [albums, searchTerm]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      <header className="p-8 pt-16 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Walkman<span className="text-green-500">.</span></h1>
            {/* STATYSTYKI - "Digital Display" style */}
            <div className="flex gap-4 mt-4 ml-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Total</span>
                <span className="text-xs font-mono font-bold text-zinc-400">{stats.total.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest text-green-500/50">Owned</span>
                <span className="text-xs font-mono font-bold text-green-500">{stats.owned.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest text-orange-500/50">Wanted</span>
                <span className="text-xs font-mono font-bold text-orange-500">{stats.wanted.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          
          <button onClick={() => setShowSettings(true)} className="p-4 bg-zinc-900/50 rounded-full border border-white/5 text-zinc-500 hover:text-white transition-all active:scale-90"><Settings2 size={20} /></button>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-600 group-focus-within:text-green-500 transition-colors">
            <SearchIcon size={16} />
          </div>
          <input 
            type="text"
            placeholder="Search your collection..."
            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:border-white/10 transition-all placeholder:text-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <main className="px-4">
        <div className={`grid ${gridConfig[cols]} gap-3 transition-all duration-500`}>
          {filteredAlbums.map((album) => (
            <div 
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
            >
              <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
              {cols <= 2 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end">
                  <p className="text-[9px] font-black uppercase text-green-500 italic">{album.artist}</p>
                  <p className="text-xs font-bold truncate uppercase tracking-tighter">{album.title}</p>
                </div>
              )}
              <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${album.status === 'MAM' ? 'bg-green-500' : 'bg-orange-500'} shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
            </div>
          ))}
        </div>
      </main>

      {/* FAB */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-500 text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-90 transition-transform z-50 border-4 border-[#09090b]"><Plus size={36} strokeWidth={3} /></button>

      {showSettings && <SettingsModal cols={cols} setCols={setCols} onClose={() => setShowSettings(false)} />}
      {showAddModal && <AddAlbumModal onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
      {selectedAlbum && <DetailsModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums} />}
    </div>
  );
}

export default App;
