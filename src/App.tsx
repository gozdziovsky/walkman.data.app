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
  // --- STANY DANYCH ---
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  // --- STANY MODALI ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // --- KONFIGURACJA STARTOWA (Z LOCALSTORAGE) ---
  const [cols, setCols] = useState<number>(() => {
    const saved = localStorage.getItem('walkman_cols');
    return saved ? parseInt(saved) : 3;
  });

  const [filterFormat, setFilterFormat] = useState<string>(() => 
    localStorage.getItem('walkman_default_format') || 'ALL'
  );

  const [filterStatus, setFilterStatus] = useState<string>(() => 
    localStorage.getItem('walkman_default_status') || 'ALL'
  );

  const [sortBy, setSortBy] = useState<SortOption>(() => 
    (localStorage.getItem('walkman_default_sort') as SortOption) || 'recent'
  );

  // Mapowanie kolumn na klasy Tailwind 4
  const gridConfig: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  // --- EFEKTY ---
  useEffect(() => { fetchAlbums(); }, []);
  
  // Zapisywanie kolumn przy zmianie
  useEffect(() => { 
    localStorage.setItem('walkman_cols', cols.toString()); 
  }, [cols]);

  const fetchAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data);
  };

  // --- LOGIKA PRZETWARZANIA LISTY (Filtry + Sortowanie) ---
  const processedAlbums = useMemo(() => {
    let result = [...albums];

    // 1. Wyszukiwarka
    if (searchTerm) {
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 2. Filtry
    if (filterFormat !== 'ALL') result = result.filter(a => a.format === filterFormat);
    if (filterStatus !== 'ALL') result = result.filter(a => a.status === filterStatus);

    // 3. Sortowanie
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

  // Statystyki dla nagłówka
  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
  }), [albums]);

  const activeFiltersCount = (filterFormat !== 'ALL' ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (sortBy !== 'recent' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      
      {/* NAGŁÓWEK */}
      <header className="p-6 pt-16 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Walkman<span className="text-green-500">.</span></h1>
            <div className="flex gap-4 mt-4 ml-1">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-tight">Archive</span>
                <span className="text-xs font-mono font-bold text-zinc-400">{stats.total.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex flex-col border-l border-white/5 pl-4">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-tight">Owned</span>
                <span className="text-xs font-mono font-bold text-green-500">{stats.owned.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {/* Przycisk Filtrowania */}
            <button 
              onClick={() => setShowFilters(true)} 
              className={`p-4 rounded-full border transition-all active:scale-90 relative ${activeFiltersCount > 0 ? 'bg-green-500 border-green-500 text-black shadow-lg shadow-green-500/20' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}
            >
              <Filter size={20} />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#09090b]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button onClick={() => setShowSettings(true)} className="p-4 bg-zinc-900/50 rounded-full border border-white/5 text-zinc-500 active:scale-90">
              <Settings2 size={20} />
            </button>
          </div>
        </div>

        {/* Wyszukiwarka */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center text-zinc-600"><SearchIcon size={16} /></div>
          <input 
            type="text" placeholder="Search your collection..." 
            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none transition-all placeholder:text-zinc-700 focus:border-white/10"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {/* GŁÓWNY GRID */}
      <main className="px-4">
        {processedAlbums.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] italic italic">No matching records found</p>
          </div>
        ) : (
          <div className={`grid ${gridConfig[cols]} gap-3 transition-all duration-500`}>
            {processedAlbums.map((album) => (
              <div 
                key={album.id} 
                onClick={() => setSelectedAlbum(album)} 
                className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
                
                {cols <= 2 && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end">
                    <p className="text-[9px] font-black uppercase text-green-500 italic leading-none mb-1">{album.artist}</p>
                    <p className="text-[11px] font-bold truncate uppercase tracking-tighter">{album.title}</p>
                  </div>
                )}
                
                <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${album.status === 'MAM' ? 'bg-green-500' : 'bg-orange-500'} shadow-[0_0_10px_rgba(34,197,94,0.5)]`} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* PRZYCISK DODAWANIA (FAB) */}
      <button 
        onClick={() => setShowAddModal(true)} 
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-green-500 text-black rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(34,197,94,0.3)] active:scale-90 transition-transform z-50 border-4 border-[#09090b]"
      >
        <Plus size={36} strokeWidth={3} />
      </button>

      {/* SZUFLADA FILTRÓW (BOTTOM SHEET) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[3rem] border-t border-white/10 p-8 pt-10 z-[120] shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
              <div className="space-y-8 max-w-lg mx-auto">
                <section>
                  <FilterLabel icon={<BookmarkCheck size={14} />} title="Status" />
                  <div className="grid grid-cols-3 gap-2">
                    <FilterBtn label="ALL" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                    <FilterBtn label="OWNED" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} activeClass="bg-green-500 text-black" />
                    <FilterBtn label="WISH" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} activeClass="bg-orange-500 text-black" />
                  </div>
                </section>

                <section>
                  <FilterLabel icon={<Disc size={14} />} title="Format" />
                  <div className="grid grid-cols-4 gap-2">
                    <FilterBtn label="ALL" active={filterFormat === 'ALL'} onClick={() => setFilterFormat('ALL')} />
                    {['FLAC', 'MP3', 'Hi-Res'].map(f => (
                      <FilterBtn key={f} label={f} active={filterFormat === f} onClick={() => setFilterFormat(f)} />
                    ))}
                  </div>
                </section>

                <section>
                  <FilterLabel icon={<ArrowUpDown size={14} />} title="Sort by" />
                  <div className="grid grid-cols-2 gap-2">
                    <SortBtn label="RECENTLY ADDED" active={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
                    <SortBtn label="ARTIST A-Z" active={sortBy === 'artist'} onClick={() => setSortBy('artist')} />
                    <SortBtn label="ALBUM A-Z" active={sortBy === 'album'} onClick={() => setSortBy('album')} />
                    <SortBtn label="RELEASE YEAR" active={sortBy === 'year'} onClick={() => setSortBy('year')} />
                  </div>
                </section>

                <button onClick={() => setShowFilters(false)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-[11px] tracking-widest mt-4 active:scale-95 transition-transform">Show Results</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODALE KONFIGURACYJNE */}
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

// POMOCNICZE KOMPONENTY UI
const FilterBtn = ({ label, active, onClick, activeClass = 'bg-white text-black' }: any) => (
  <button onClick={onClick} className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${active ? activeClass + ' border-transparent' : 'bg-zinc-900/50 text-zinc-600 border-white/5'}`}>
    {label}
  </button>
);

const SortBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`py-3 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border flex items-center justify-center text-center ${active ? 'bg-zinc-800 text-green-500 border-green-500/50' : 'bg-zinc-900/30 text-zinc-600 border-white/5'}`}>
    {label}
  </button>
);

const FilterLabel = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-4 text-zinc-500">
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{title}</span>
  </div>
);

export default App;
