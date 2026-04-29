import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, Settings2, Search as SearchIcon, Filter, Disc, 
  BookmarkCheck, ArrowUpDown, X, ListMusic, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { SettingsModal } from '../SettingsModal';
import type { Album } from '../../types/album';

interface ArchiveEngineProps {
  tableName: string;
  archiveTitle: string;
  themeColor: string;
  logo: string;
  formats: string[]; // Formaty specyficzne dla danego archiwum
  AddModal: React.ComponentType<any>;
  DetailsModal: React.ComponentType<any>;
}

// Logika optymalizacji okładek z oryginału
const getOptimizedCover = (url: string, quality: 'grid' | 'full') => {
  if (!url) return '';
  if (quality === 'full') return url;
  if (url.includes('mzstatic.com')) return url.replace('800x800', '300x300');
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&output=webp&q=80`;
};

export const ArchiveEngine = ({ 
  tableName, archiveTitle, themeColor, logo, formats, AddModal, DetailsModal 
}: ArchiveEngineProps) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtry i sortowanie
  const [filterFormat, setFilterFormat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'artist' | 'album' | 'year'>('recent');
  
  // Ustawienia widoku
  const [cols, setCols] = useState(() => parseInt(localStorage.getItem('walkman_cols') || '3'));
  const gridConfig: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  // Synchronizacja koloru motywu
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', themeColor);
  }, [themeColor]);

  // Blokada scrolla przy modalach
  useEffect(() => {
    const isAnyModalOpen = showAddModal || showSettings || showFilters || !!selectedAlbum;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
  }, [showAddModal, showSettings, showFilters, selectedAlbum]);

  const fetchAlbums = async () => {
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data as Album[]);
  };

  useEffect(() => { fetchAlbums(); }, [tableName]);

  // Logika przetwarzania danych (Filtry + Sort)
  const processedAlbums = useMemo(() => {
    let result = [...albums];
    if (searchTerm) {
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  // Infinite Scroll (Intersection Observer)
  const [visibleCount, setVisibleCount] = useState(40);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastAlbumRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < processedAlbums.length) {
        setVisibleCount(prev => prev + 40);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, processedAlbums.length]);

  useEffect(() => { setVisibleCount(40); }, [searchTerm, filterFormat, filterStatus, sortBy]);

  // Statystyki
  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
    wanted: albums.filter(a => a.status === 'SZUKAM').length,
  }), [albums]);

  // Nawigacja wewnątrz DetailsModal (Prev/Next)
  const currentIndex = useMemo(() => 
    processedAlbums.findIndex(a => a.id === selectedAlbum?.id),
    [processedAlbums, selectedAlbum]
  );

  const activeFiltersCount = (filterFormat !== 'ALL' ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32 selection-brand">
      <style>{`
        :root { --brand-color: ${themeColor}; }
        .text-brand { color: var(--brand-color) !important; }
        .bg-brand { background-color: var(--brand-color) !important; }
        .border-brand { border-color: var(--brand-color) !important; }
        .selection-brand::selection { background-color: var(--brand-color); color: black; }
      `}</style>

      <header className="px-6 pt-safe mt-6 space-y-6 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col items-center justify-center pt-2 pb-4"> 
          <img src={logo} alt="Logo" className="w-full max-w-[320px] md:max-w-[480px] h-auto object-contain select-none" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mt-2 italic">{archiveTitle}</p>
        </div>

        {/* Stats & Tools Bar */}
        <div className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 pl-4 shadow-2xl">
          <div className="flex gap-1 overflow-x-auto no-scrollbar items-center">
            <StatBox label="Total" val={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
            <StatBox label="Owned" val={stats.owned} colorClass="text-brand" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} />
            <StatBox label="Wanted" val={stats.wanted} colorClass="text-orange-500" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} />
          </div>

          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => setShowFilters(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90 relative">
              <Filter size={18} />
              {activeFiltersCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-[#09090b]" />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90">
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input 
            type="text" placeholder={`Search in ${archiveTitle}...`}
            className="w-full bg-zinc-900/30 border border-white/5 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-bold outline-none transition-all placeholder:text-zinc-700 focus:bg-zinc-900/60 focus:border-brand/30" 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-5 flex items-center text-zinc-600 hover:text-brand transition-colors">
                <X size={16} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Grid Utama */}
      <main className="px-6 mt-4 max-w-[1800px] mx-auto w-full">
        {processedAlbums.length === 0 ? (
          <div className="py-24 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No records found</p></div>
        ) : (
          <div className={`grid ${gridConfig[cols]} md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 transition-all duration-500`}>
            {processedAlbums.slice(0, visibleCount).map((album, idx) => (
              <motion.div 
                key={album.id} 
                layoutId={album.id}
                ref={idx === visibleCount - 1 ? lastAlbumRef : null}
                onClick={() => setSelectedAlbum(album)} 
                className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-xl"
              >
                <img src={getOptimizedCover(album.coverUrl, 'grid')} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={album.title} />
                
                {album.tracks && (
                  <div className="absolute top-0 left-0 w-9 h-9 bg-black/60 backdrop-blur-md z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
                    <ListMusic size={11} className="absolute top-1.5 left-1.5 text-white/90" />
                  </div>
                )}

                <div className={`absolute top-0 right-0 w-7 h-7 z-10 ${album.status === 'MAM' ? 'bg-brand' : 'bg-orange-500'}`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent p-5 flex flex-col justify-end text-left opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-black uppercase text-brand italic mb-1.5">{album.artist}</p>
                  <p className="text-xs font-bold truncate uppercase tracking-tighter leading-none">{album.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {visibleCount < processedAlbums.length && (
          <div className="w-full h-24 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-600" size={24} /></div>
        )}
      </main>

      {/* Floating Add Button */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl z-50 border-[6px] border-[#09090b] active:scale-90 transition-transform">
        <Plus size={36} strokeWidth={3} />
      </button>

      {/* Drawer Filtry */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[3rem] border-t border-white/10 p-8 pt-10 z-[120] shadow-2xl">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />
              <div className="space-y-10 max-w-lg mx-auto pb-6 text-left">
                <section>
                  <FilterLabel icon={<BookmarkCheck size={14} />} title="Status" />
                  <div className="grid grid-cols-3 gap-3">
                    <FilterBtn label="ALL" active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
                    <FilterBtn label="OWNED" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} activeClass="bg-brand text-black" />
                    <FilterBtn label="WISH" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} activeClass="bg-orange-500 text-black border-orange-500" />
                  </div>
                </section>
                <section>
                  <FilterLabel icon={<Disc size={14} />} title="Format" />
                  <div className="grid grid-cols-4 gap-2">
                    <FilterBtn label="ALL" active={filterFormat === 'ALL'} onClick={() => setFilterFormat('ALL')} />
                    {formats.map(f => <FilterBtn key={f} label={f} active={filterFormat === f} onClick={() => setFilterFormat(f)} />)}
                  </div>
                </section>
                <section>
                  <FilterLabel icon={<ArrowUpDown size={14} />} title="Sort by" />
                  <div className="grid grid-cols-2 gap-3">
                    <SortBtn label="RECENT" active={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
                    <SortBtn label="ARTIST" active={sortBy === 'artist'} onClick={() => setSortBy('artist')} />
                    <SortBtn label="ALBUM" active={sortBy === 'album'} onClick={() => setSortBy('album')} />
                    <SortBtn label="YEAR" active={sortBy === 'year'} onClick={() => setSortBy('year')} />
                  </div>
                </section>
                <button onClick={() => setShowFilters(false)} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest mt-4">Done</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modale */}
      <AnimatePresence>
        {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
        {selectedAlbum && (
          <DetailsModal 
            album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums}
            onArtistClick={(n:string)=>{setSearchTerm(n);setSelectedAlbum(null);}}
            onNext={currentIndex < processedAlbums.length - 1 ? () => setSelectedAlbum(processedAlbums[currentIndex + 1]) : undefined}
            onPrev={currentIndex > 0 ? () => setSelectedAlbum(processedAlbums[currentIndex - 1]) : undefined}
          />
        )}
      </AnimatePresence>

      {showSettings && (
        <SettingsModal 
          cols={cols} setCols={(n: number) => { setCols(n); localStorage.setItem('walkman_cols', n.toString()); }}
          themeColor={themeColor} setThemeColor={() => {}} // Kolor sterowany przez stronę
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
};

// Komponenty pomocnicze UI
const StatBox = ({ label, val, colorClass = "text-zinc-300", active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col shrink-0 text-left transition-all px-3 py-2 rounded-xl border ${active ? 'bg-zinc-800 border-white/10 shadow-lg' : 'border-transparent opacity-70'}`}>
    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">{label}</span>
    <span className={`text-sm font-mono font-bold ${colorClass}`}>{val.toString().padStart(2, '0')}</span>
  </button>
);

const FilterBtn = ({ label, active, onClick, activeClass = 'bg-white text-black' }: any) => (
  <button onClick={onClick} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${active ? activeClass : 'bg-zinc-800/30 text-zinc-500 border-white/5'}`}>{label}</button>
);

const SortBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`py-4 rounded-xl text-[9px] font-black uppercase transition-all border ${active ? 'bg-zinc-800 text-brand border-brand/50 shadow-inner' : 'bg-zinc-800/20 text-zinc-600 border-white/5'}`}>{label}</button>
);

const FilterLabel = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-5 text-zinc-500 border-b border-white/5 pb-2">{icon}<span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{title}</span></div>
);