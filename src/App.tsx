import { useState, useEffect, useMemo } from 'react';
import { Plus, Settings2, Search as SearchIcon, Filter, Disc, BookmarkCheck, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { AddAlbumModal } from './components/AddAlbumModal';
import { DetailsModal } from './components/DetailsModal';
import { SettingsModal } from './components/SettingsModal';
import type { Album } from './types/album';

type SortOption = 'recent' | 'artist' | 'album' | 'year';

function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [cols, setCols] = useState<number>(() => {
    const saved = localStorage.getItem('walkman_cols');
    return saved ? parseInt(saved) : 3;
  });

  const [filterFormat, setFilterFormat] = useState<string>(() => localStorage.getItem('walkman_default_format') || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>(() => localStorage.getItem('walkman_default_status') || 'ALL');
  const [sortBy, setSortBy] = useState<SortOption>(() => (localStorage.getItem('walkman_default_sort') as SortOption) || 'recent');

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
  }), [albums]);

  const activeFiltersCount = (filterFormat !== 'ALL' ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (sortBy !== 'recent' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      
      {/* NAGŁÓWEK - REFINED & SYMMETRICAL */}
      <header className="px-8 pt-16 space-y-8">
        <div className="flex justify-between items-center"> {/* items-center dla idealnego wyrównania w pionie */}
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none select-none">
              Walkman<span className="text-green-500">.</span>
            </h1>
            <div className="flex gap-5 mt-4 ml-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-tight">Archive</span>
                <span className="text-sm font-mono font-bold text-zinc-400">{stats.total.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-5">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-tight">Owned</span>
                <span className="text-sm font-mono font-bold text-green-500">{stats.owned.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          
          {/* CONTROL CLUSTER - Tutaj dzieje się magia symetrii */}
          <div className="flex items-center bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-full p-1.5 shadow-2xl">
            <button 
              onClick={() => setShowFilters(true)} 
              className={`p-3.5 rounded-full transition-all active:scale-90 relative group ${activeFiltersCount > 0 ? 'bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'text-zinc-500 hover:text-white'}`}
            >
              <Filter size={18} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white text-black text-[8px] font-black rounded-full flex items-center justify-center border-2 border-[#09090b]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <div className="w-px h-4 bg-white/10 mx-1" /> {/* Subtelny separator */}
            
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-3.5 rounded-full text-zinc-500 hover:text-white transition-all active:scale-90"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR - Bardziej "płaski" i zintegrowany */}
        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600">
            <SearchIcon size={14} />
          </div>
          <input 
            type="text" placeholder="Quick search..." 
            className="w-full bg-zinc-900/30 border border-white/5 rounded-[1.25rem] py-4 pl-12 pr-6 text-sm font-bold outline-none transition-all placeholder:text-zinc-700 focus:bg-zinc-900/60 focus:border-white/10"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* GRID Z ALBUMAMI */}
      <main className="px-6 mt-4">
        {processedAlbums.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">No records found</p>
          </div>
        ) : (
          <div className={`grid ${gridConfig[cols]} gap-4 transition-all duration-500`}>
            {processedAlbums.map((album) => (
              <div 
                key={album.id} 
                onClick={() => setSelectedAlbum(album)} 
                className="group relative aspect-square bg-zinc-900 rounded-[1.5rem] overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                <img src={album.coverUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                
                {cols <= 2 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-5 flex flex-col justify-end">
                    <p className="text-[8px] font-black uppercase text-green-500 tracking-widest leading-none mb-1.5">{album.artist}</p>
                    <p className="text-xs font-bold truncate uppercase tracking-tighter">{album.title}</p>
                  </div>
                )}
                
                <div className={`absolute top-4 right-4 w-1.5 h-1.5 rounded-full ${album.status === 'MAM' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]'}`} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FAB - Bardziej minimalistyczny */}
      <button 
        onClick={() => setShowAddModal(true)} 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-500 text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(34,197,94,0.3)] active:scale-90 transition-transform z-50 border-[6px] border-[#09090b]"
      >
        <Plus size={36} strokeWidth={3} />
      </button>

      {/* MODALE - SZUFLADA FILTRÓW */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[3rem] border-t border-white/10 p-8 pt-10 z-[120] shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
              <div className="space-y-10 max-w-lg mx-auto">
                <section>
                  <FilterLabel icon={<BookmarkCheck size={14} />} title="Status" />
                  <div className="grid grid-cols-3 gap-3">
                    <FilterBtn label="ALL" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                    <FilterBtn label="OWNED" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} activeClass="bg-green-500 text-black" />
                    <FilterBtn label="WISH" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} activeClass="bg-orange-500 text-black" />
                  </div>
                </section>

                <section>
                  <FilterLabel icon={<Disc size={14} />} title="Format" />
                  <div className="grid grid-cols-4 gap-3">
                    <FilterBtn label="ALL" active={filterFormat === 'ALL'} onClick={() => setFilterFormat('ALL')} />
                    {['FLAC', 'MP3', 'Hi-Res'].map(f => (
                      <FilterBtn key={f} label={f} active={filterFormat === f} onClick={() => setFilterFormat(f)} />
                    ))}
                  </div>
                </section>

                <section>
                  <FilterLabel icon={<ArrowUpDown size={14} />} title="Sort by" />
                  <div className="grid grid-cols-2 gap-3">
                    <SortBtn label="RECENTLY ADDED" active={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
                    <SortBtn label="ARTIST A-Z" active={sortBy === 'artist'} onClick={() => setSortBy('artist')} />
                    <SortBtn label="ALBUM A-Z" active={sortBy === 'album'} onClick={() => setSortBy('album')} />
                    <SortBtn label="RELEASE YEAR" active={sortBy === 'year'} onClick={() => setSortBy('year')} />
                  </div>
                </section>

                <button onClick={() => setShowFilters(false)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest mt-4 active:scale-95 transition-transform">Close & Filter</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* POZOSTAŁE MODALE */}
      {showSettings && (
        <SettingsModal 
          cols={cols} setCols={setCols} 
          defaultFormat={filterFormat} setDefaultFormat={setFilterFormat}
          defaultStatus={filterStatus} setDefaultStatus={setFilterStatus}
          defaultSort={sortBy} setDefaultSort={setSortBy}
          onClose={() => setShowSettings(false)} 
        />
      )}
      {showAddModal && <AddAlbumModal onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
      {selectedAlbum && <DetailsModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums} />}
    </div>
  );
}

const FilterBtn = ({ label, active, onClick, activeClass = 'bg-white text-black' }: any) => (
  <button onClick={onClick} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${active ? activeClass + ' border-transparent shadow-lg' : 'bg-zinc-800/30 text-zinc-500 border-white/5'}`}>
    {label}
  </button>
);

const SortBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`py-4 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border flex items-center justify-center text-center ${active ? 'bg-zinc-800 text-green-500 border-green-500/50 shadow-inner' : 'bg-zinc-800/20 text-zinc-600 border-white/5'}`}>
    {label}
  </button>
);

const FilterLabel = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-5 text-zinc-500">
    {icon}
    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{title}</span>
  </div>
);

export default App;
