import { useState, useEffect, useMemo } from 'react';
import { Plus, Settings2, Search as SearchIcon, Filter, ArrowUpDown, Disc, BookmarkCheck } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AddAlbumModal } from './components/AddAlbumModal';
import { DetailsModal } from './components/DetailsModal';
import { SettingsModal } from './components/SettingsModal';
import type { Album } from './types/album';

type SortOption = 'recent' | 'artist' | 'album' | 'year';

function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  const [filterFormat, setFilterFormat] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

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

  const processedAlbums = useMemo(() => {
    let result = [...albums];
    if (searchTerm) {
      result = result.filter(a => a.title.toLowerCase().includes(searchTerm.toLowerCase()) || a.artist.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterFormat !== 'ALL') result = result.filter(a => a.format === filterFormat);
    if (filterStatus !== 'ALL') result = result.filter(a => a.status === filterStatus);
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'artist': return a.artist.localeCompare(b.artist);
        case 'album': return a.title.localeCompare(b.title);
        case 'year': return (b.year || 0) - (a.year || 0);
        default: return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
      }
    });
    return result;
  }, [albums, searchTerm, filterFormat, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
    wanted: albums.filter(a => a.status === 'SZUKAM').length
  }), [albums]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      <header className="p-6 pt-12 space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Walkman<span className="text-green-500">.</span></h1>
            <div className="flex gap-4 mt-4 ml-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Total</span>
                <span className="text-xs font-mono font-bold text-zinc-400">{stats.total.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest text-green-500/50">Owned</span>
                <span className="text-xs font-mono font-bold text-green-500">{stats.owned.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowSettings(true)} className="p-4 bg-zinc-900/50 rounded-full border border-white/5 text-zinc-500 hover:text-white transition-all"><Settings2 size={20} /></button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-600"><SearchIcon size={16} /></div>
          <input 
            type="text" placeholder="Search archive..." 
            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all placeholder:text-zinc-700 focus:border-white/10"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3 ml-1 text-zinc-600">
              <BookmarkCheck size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Collection Status</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <DashboardButton label="ALL" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
              <DashboardButton label="OWNED" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} activeClass="bg-green-500 text-black border-green-500" />
              <DashboardButton label="WISH" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} activeClass="bg-orange-500 text-black border-orange-500" />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 ml-1 text-zinc-600">
              <Disc size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Audio Format</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['FLAC', 'MP3', 'HI-RES'].map(f => (
                <DashboardButton 
                  key={f} 
                  label={f} 
                  active={filterFormat === (f === 'HI-RES' ? 'Hi-Res' : f)} 
                  onClick={() => setFilterFormat(filterFormat === (f === 'HI-RES' ? 'Hi-Res' : f) ? 'ALL' : (f === 'HI-RES' ? 'Hi-Res' : f))} 
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3 ml-1 text-zinc-600">
              <ArrowUpDown size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Sort Records</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <SortButton label="RECENTLY ADDED" active={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
              <SortButton label="ARTIST A-Z" active={sortBy === 'artist'} onClick={() => setSortBy('artist')} />
              <SortButton label="ALBUM A-Z" active={sortBy === 'album'} onClick={() => setSortBy('album')} />
              <SortButton label="RELEASE YEAR" active={sortBy === 'year'} onClick={() => setSortBy('year')} />
            </div>
          </section>
        </div>
      </header>

      <main className="px-4">
        <div className={`grid ${gridConfig[cols]} gap-3 transition-all duration-500`}>
          {processedAlbums.map((album) => (
            <div key={album.id} onClick={() => setSelectedAlbum(album)} className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform">
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

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-500 text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-90 transition-transform z-50 border-4 border-[#09090b]"><Plus size={36} strokeWidth={3} /></button>

      {showSettings && <SettingsModal cols={cols} setCols={setCols} onClose={() => setShowSettings(false)} />}
      {showAddModal && <AddAlbumModal onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
      {selectedAlbum && <DetailsModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums} />}
    </div>
  );
}

const DashboardButton = ({ label, active, onClick, activeClass = 'bg-white text-black border-white' }: any) => (
  <button onClick={onClick} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${active ? activeClass : 'bg-zinc-900/50 text-zinc-600 border-white/5 hover:border-white/10'}`}>
    {label}
  </button>
);

const SortButton = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border flex items-center justify-center text-center ${active ? 'bg-zinc-800 text-green-500 border-green-500/50' : 'bg-zinc-900/30 text-zinc-600 border-white/5'}`}>
    {label}
  </button>
);

export default App;
