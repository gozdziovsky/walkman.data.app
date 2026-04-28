import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  Plus, 
  Settings2, 
  Search as SearchIcon, 
  Filter, 
  Disc, 
  BookmarkCheck, 
  ArrowUpDown, 
  X, 
  ListMusic,
  Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './lib/supabase';
import { AddAlbumModal } from './components/AddAlbumModal';
import { DetailsModal } from './components/DetailsModal';
import { SettingsModal } from './components/SettingsModal';
import type { Album } from './types/album';

type SortOption = 'recent' | 'artist' | 'album' | 'year';

const getOptimizedCover = (url: string, quality: 'grid' | 'full') => {
  if (!url) return '';
  if (quality === 'full') return url;
  if (url.includes('mzstatic.com')) {
    return url.replace('800x800', '300x300');
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&output=webp&q=80`;
};

function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [themeColor, setThemeColor] = useState<string>(() => localStorage.getItem('walkman_theme_color') || '#22c55e');

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', themeColor);
    localStorage.setItem('walkman_theme_color', themeColor);
  }, [themeColor]);

  const [filterFormat, setFilterFormat] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const [defaultFormat, setDefaultFormat] = useState<string>(() => localStorage.getItem('walkman_default_format') || 'ALL');
  const [defaultStatus, setDefaultStatus] = useState<string>(() => localStorage.getItem('walkman_default_status') || 'ALL');
  const [defaultSort, setDefaultSort] = useState<SortOption>(() => (localStorage.getItem('walkman_default_sort') as SortOption) || 'recent');

  const [cols, setCols] = useState<number>(() => parseInt(localStorage.getItem('walkman_cols') || '3'));
  const [searchSource, setSearchSource] = useState<'itunes' | 'discogs'>(() => (localStorage.getItem('walkman_search_source') as 'itunes' | 'discogs') || 'itunes');
  const [discogsToken, setDiscogsToken] = useState<string>(() => localStorage.getItem('walkman_discogs_token') || '');

  const gridConfig: Record<number, string> = { 1: 'grid-cols-1', 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' };

  useEffect(() => {
    const isAnyModalOpen = showAddModal || showSettings || showFilters || !!selectedAlbum;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
    document.body.style.height = isAnyModalOpen ? '100vh' : 'unset';
  }, [showAddModal, showSettings, showFilters, selectedAlbum]);

  useEffect(() => {
    fetchAlbums();
    setFilterFormat(defaultFormat);
    setFilterStatus(defaultStatus);
    setSortBy(defaultSort);
  }, []);

  const fetchAlbums = async () => {
    const { data } = await supabase.from('albums').select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data);
  };

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

  const [visibleCount, setVisibleCount] = useState(40);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setVisibleCount(40);
  }, [searchTerm, filterFormat, filterStatus, sortBy]);

  const lastAlbumElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < processedAlbums.length) {
        setVisibleCount(prev => prev + 40);
      }
    });
    if (node) observer.current.observe(node);
  }, [visibleCount, processedAlbums.length]);

  const visibleAlbums = processedAlbums.slice(0, visibleCount);

  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
    wanted: albums.filter(a => a.status === 'SZUKAM').length,
  }), [albums]);

  const currentIndex = useMemo(() => 
    processedAlbums.findIndex(a => a.id === selectedAlbum?.id),
    [processedAlbums, selectedAlbum]
  );

  const activeFiltersCount = (filterFormat !== 'ALL' ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (sortBy !== defaultSort ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32 selection-brand">
      <style>{`
        :root { --brand-color: ${themeColor}; }
        .text-brand { color: var(--brand-color) !important; }
        .bg-brand { background-color: var(--brand-color) !important; }
        .border-brand { border-color: var(--brand-color) !important; }
        .shadow-brand { --tw-shadow-color: var(--brand-color); }
        .selection-brand::selection { background-color: var(--brand-color); color: black; }
      `}</style>

      {/* ZMIANA: Dodano max-w-[1800px] i mx-auto w-full, żeby kontrolować szerokość na dużych monitorach */}
      <header className="px-6 pt-12 space-y-6 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col items-center justify-center pt-4">
          <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none select-none">
            Walkman<span className="text-brand">.</span>
          </h1>
          <p className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.5em] mt-3 leading-none">Digital Audio Archive</p>
        </div>

        <div className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 pl-4 shadow-2xl">
          <div className="flex gap-1 text-left overflow-x-auto no-scrollbar items-center">
            <StatBox label="Total" val={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
            <StatBox label="Owned" val={stats.owned} colorClass="text-brand" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} />
            <StatBox label="Wanted" val={stats.wanted} colorClass="text-orange-500" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} />
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2 mr-2">
            <button onClick={() => setShowFilters(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90 relative">
              <Filter size={18} />
              {activeFiltersCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-[#09090b]" />}
            </button>
            <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90">
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-5 flex items-center text-zinc-600"><SearchIcon size={14} /></div>
          <input 
            type="text" placeholder="Search archive..." 
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

      {/* ZMIANA: Max szerokość i hybrydowa siatka md:grid-cols-... */}
      <main className="px-6 mt-4 max-w-[1800px] mx-auto w-full">
        {processedAlbums.length === 0 ? (
          <div className="py-24 text-center opacity-20"><p className="text-[10px] font-black uppercase tracking-[0.4em] italic">No records found</p></div>
        ) : (
          <div className={`grid ${gridConfig[cols]} md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 transition-all duration-500`} style={{ contentVisibility: 'auto' }}>
            {visibleAlbums.map((album, idx) => (
              <div 
                key={album.id} 
                ref={idx === visibleAlbums.length - 1 ? lastAlbumElementRef : null}
                onClick={() => setSelectedAlbum(album)} 
                className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform transform-gpu shadow-xl"
              >
                <img 
                  src={getOptimizedCover(album.coverUrl, 'grid')} 
                  loading="lazy" 
                  decoding="async" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  alt={album.title} 
                />
                
                {/* Tracklista (Lewy Górny Róg) */}
                {album.tracks && (
                  <div 
                    className="absolute top-0 left-0 w-9 h-9 bg-black/60 backdrop-blur-md z-10 pointer-events-none" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                  >
                    <ListMusic size={11} className="absolute top-1.5 left-1.5 text-white/90" />
                  </div>
                )}

                {/* Status (Prawy Górny Róg) */}
                <div 
                  className={`absolute top-0 right-0 w-7 h-7 z-10 pointer-events-none opacity-95 transition-colors duration-300 ${album.status === 'MAM' ? 'bg-brand' : 'bg-orange-500'}`} 
                  style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                />

                {/* Info Overlay: zawsze na PC (hover), a na telefonach tylko jeśli kolumn jest <= 2 */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent p-5 flex flex-col justify-end text-left pointer-events-none transition-opacity duration-300 ${cols <= 2 ? 'opacity-100 md:opacity-0 md:group-hover:opacity-100' : 'opacity-0 md:group-hover:opacity-100'}`}>
                  <p className="text-[8px] font-black uppercase text-brand italic mb-1.5 leading-none">{album.artist}</p>
                  <p className="text-xs font-bold truncate uppercase tracking-tighter leading-none">{album.title}</p>
                </div>
              </div>
            ))}
            
            {visibleCount < processedAlbums.length && (
              <div className="w-full h-20 col-span-full flex items-center justify-center">
                <Loader2 className="animate-spin text-zinc-600" size={24} />
              </div>
            )}
          </div>
        )}
      </main>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl shadow-brand/30 active:scale-90 transition-transform z-50 border-[6px] border-[#09090b]">
        <Plus size={36} strokeWidth={3} />
      </button>

      {/* SZUFLADA FILTRÓW */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowFilters(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[3rem] border-t border-white/10 p-8 pt-10 z-[120] shadow-2xl transform-gpu will-change-transform">
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
                  <div className="grid grid-cols-4 gap-3">
                    <FilterBtn label="ALL" active={filterFormat === 'ALL'} onClick={() => setFilterFormat('ALL')} />
                    {['FLAC', 'MP3', 'Hi-Res'].map(f => <FilterBtn key={f} label={f} active={filterFormat === f} onClick={() => setFilterFormat(f)} />)}
                  </div>
                </section>
                <section>
                  <FilterLabel icon={<ArrowUpDown size={14} />} title="Sort by" />
                  <div className="grid grid-cols-2 gap-3">
                    <SortBtn label="RECENTLY" active={sortBy === 'recent'} onClick={() => setSortBy('recent')} />
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

      {showSettings && (
        <SettingsModal 
          cols={cols} setCols={setCols} 
          themeColor={themeColor} setThemeColor={setThemeColor}
          defaultFormat={defaultFormat} setDefaultFormat={(v: string) => { localStorage.setItem('walkman_default_format', v); setDefaultFormat(v); }}
          defaultStatus={defaultStatus} setDefaultStatus={(v: string) => { localStorage.setItem('walkman_default_status', v); setDefaultStatus(v); }}
          defaultSort={defaultSort} setDefaultSort={(v: any) => { localStorage.setItem('walkman_default_sort', v); setDefaultSort(v); }}
          searchSource={searchSource} setSearchSource={setSearchSource}
          discogsToken={discogsToken} setDiscogsToken={setDiscogsToken}
          onClose={() => setShowSettings(false)} 
        />
      )}

      {showAddModal && <AddAlbumModal searchSource={searchSource} discogsToken={discogsToken} onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
      
      <AnimatePresence>
        {selectedAlbum && (
          <DetailsModal 
            album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums}
            onArtistClick={(n:string)=>{setSearchTerm(n);setSelectedAlbum(null);}}
            onNext={currentIndex < processedAlbums.length - 1 ? () => setSelectedAlbum(processedAlbums[currentIndex + 1]) : undefined}
            onPrev={currentIndex > 0 ? () => setSelectedAlbum(processedAlbums[currentIndex - 1]) : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const StatBox = ({ label, val, colorClass = "text-zinc-300", active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col shrink-0 text-left transition-all active:scale-95 px-3 py-2 rounded-xl border ${active ? 'bg-zinc-800/80 border-white/10 shadow-lg' : 'border-transparent hover:bg-zinc-800/40 opacity-70 hover:opacity-100'}`}
  >
    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">{label}</span>
    <span className={`text-sm font-mono font-bold ${colorClass}`}>{val.toString().padStart(2, '0')}</span>
  </button>
);

const FilterBtn = ({ label, active, onClick, activeClass = 'bg-white text-black' }: any) => (
  <button onClick={onClick} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${active ? activeClass + ' border-transparent' : 'bg-zinc-800/30 text-zinc-500 border-white/5'}`}>{label}</button>
);

const SortBtn = ({ label, active, onClick }: any) => (
  <button onClick={onClick} className={`py-4 px-4 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all border flex items-center justify-center text-center ${active ? 'bg-zinc-800 text-brand border-brand/50 shadow-inner' : 'bg-zinc-800/20 text-zinc-600 border-white/5'}`}>{label}</button>
);

const FilterLabel = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-5 text-zinc-500 border-b border-white/5 pb-2">{icon}<span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{title}</span></div>
);

export default App;