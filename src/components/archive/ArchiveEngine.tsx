import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Plus, Settings2, Search as SearchIcon, Filter, Disc,
  BookmarkCheck, X, ListMusic, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { SettingsModal } from '../SettingsModal';
import type { Album } from '../../types/album';

const getCoverUrl = (album: Album): string => {
  return (album as any).coverUrl || (album as any).cover_url || '';
};

const getOptimizedCover = (album: Album, quality: 'grid' | 'full'): string => {
  const url = getCoverUrl(album);
  if (!url) return '';
  if (quality === 'full') return url;
  if (url.includes('mzstatic.com')) return url.replace('800x800', '300x300');
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=400&h=400&fit=cover&output=webp&q=80`;
};

const getGridStyle = (cols: number): React.CSSProperties => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
  gap: '1rem',
});

const getSavedState = (key: string, defaultValue: string, tableName: string) => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`${tableName}_${key}`);
    if (saved !== null) return saved;
  }
  return defaultValue;
};

export const ArchiveEngine = ({
  tableName,
  archiveTitle,
  themeColor,
  logo,
  formats,
  AddModal,
  DetailsModal,
}: any) => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filterFormat, setFilterFormat] = useState(() => getSavedState('filterFormat', 'ALL', tableName));
  const [filterStatus, setFilterStatus] = useState(() => getSavedState('filterStatus', 'ALL', tableName));
  const [sortBy, setSortBy] = useState(() => getSavedState('sortBy', 'recent', tableName));

  useEffect(() => {
    localStorage.setItem(`${tableName}_filterFormat`, filterFormat);
    localStorage.setItem(`${tableName}_filterStatus`, filterStatus);
    localStorage.setItem(`${tableName}_sortBy`, sortBy);
  }, [filterFormat, filterStatus, sortBy, tableName]);

  const [cols, setCols] = useState(() => parseInt(localStorage.getItem('walkman_cols') || '3'));
  const [showNav, setShowNav] = useState(() => localStorage.getItem('show_nav') !== 'false');
  const [discogsToken, setDiscogsToken] = useState(() => localStorage.getItem('discogs_token') || '');

  useEffect(() => {
    const syncSettings = () => {
      setCols(parseInt(localStorage.getItem('walkman_cols') || '3'));
      setShowNav(localStorage.getItem('show_nav') !== 'false');
      setDiscogsToken(localStorage.getItem('discogs_token') || '');
    };
    window.addEventListener('storage_update', syncSettings);
    return () => window.removeEventListener('storage_update', syncSettings);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', themeColor);
  }, [themeColor]);

  const fetchAlbums = async () => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`[ArchiveEngine] Failed to fetch from ${tableName}:`, error.message);
      return;
    }
    if (data) setAlbums(data as Album[]);
  };

  useEffect(() => {
    fetchAlbums();
  }, [tableName]);

  const processedAlbums = useMemo(() => {
    let result = [...albums];

    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (a) => a.title.toLowerCase().includes(s) || a.artist.toLowerCase().includes(s)
      );
    }

    if (filterFormat !== 'ALL') result = result.filter((a) => a.format === filterFormat);
    if (filterStatus !== 'ALL') result = result.filter((a) => a.status === filterStatus);

    switch (sortBy) {
      case 'artist_asc':
        result.sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
        break;
      case 'artist_desc':
        result.sort((a, b) => b.artist.localeCompare(a.artist) || b.title.localeCompare(a.title));
        break;
      case 'title_asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'recent':
      default:
        break;
    }

    return result;
  }, [albums, searchTerm, filterFormat, filterStatus, sortBy]);

  const [visibleCount, setVisibleCount] = useState(40);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastAlbumRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && visibleCount < processedAlbums.length) {
          setVisibleCount((prev) => prev + 40);
        }
      });
      if (node) observer.current.observe(node);
    },
    [visibleCount, processedAlbums.length]
  );

  useEffect(() => {
    setVisibleCount(40);
  }, [searchTerm, filterFormat, filterStatus, sortBy, tableName]);

  const currentIndex = useMemo(
    () => processedAlbums.findIndex((a) => a.id === selectedAlbum?.id),
    [processedAlbums, selectedAlbum]
  );

  const stats = useMemo(
    () => ({
      total: albums.length,
      owned: albums.filter((a) => a.status === 'OWNED').length,
      wanted: albums.filter((a) => a.status === 'WANTED').length,
    }),
    [albums]
  );

  const hasActiveFilters = filterFormat !== 'ALL' || filterStatus !== 'ALL' || sortBy !== 'recent';

  // Skrócona etykieta aktywnego sortowania wyświetlana przy ikonie filtra
  const sortHint: Record<string, string> = {
    artist_asc:  'A–Z',
    artist_desc: 'Z–A',
    title_asc:   'Title ↑',
    title_desc:  'Title ↓',
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      <style>{`:root { --brand-color: ${themeColor}; } .text-brand { color: var(--brand-color) !important; } .bg-brand { background-color: var(--brand-color) !important; } .border-brand { border-color: var(--brand-color) !important; }`}</style>

      <header
        className={`px-6 space-y-6 max-w-[1800px] mx-auto w-full transition-all duration-500 ease-out ${
          showNav ? 'pt-2' : 'pt-10 md:pt-12'
        }`}
      >
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center">
          <img
            src={logo}
            alt="Logo"
            className="w-full max-w-[320px] md:max-w-[480px] h-auto object-contain select-none"
          />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mt-1 italic opacity-40">
            {archiveTitle}
          </p>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 pl-4 shadow-2xl">
          <div className="flex gap-1 overflow-x-auto no-scrollbar items-center">
            <StatBox label="Total"  val={stats.total}  active={filterStatus === 'ALL'}    onClick={() => setFilterStatus('ALL')} />
            <StatBox label="Owned"  val={stats.owned}  colorClass="text-brand"            active={filterStatus === 'OWNED'}  onClick={() => setFilterStatus('OWNED')} />
            <StatBox label="Wanted" val={stats.wanted} colorClass="text-orange-500"       active={filterStatus === 'WANTED'} onClick={() => setFilterStatus('WANTED')} />
          </div>

          <div className="flex items-center gap-1 mr-2 shrink-0">
            {/* Filter button — pokazuje hint aktywnego sortu + dot aktywnych filtrów */}
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90"
            >
              <Filter size={16} />
              {sortHint[sortBy] && (
                <span className="text-[9px] font-black uppercase tracking-widest text-brand leading-none">
                  {sortHint[sortBy]}
                </span>
              )}
              {(filterFormat !== 'ALL' || filterStatus !== 'ALL') && (
                <span className="w-2 h-2 bg-brand rounded-full border-2 border-[#09090b] shrink-0" />
              )}
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90"
            >
              <Settings2 size={18} />
            </button>
          </div>
        </div>

        {/* SEARCH — czysty, bez sortera */}
        <div className="relative group">
          <SearchIcon
            className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-brand transition-colors"
            size={14}
          />
          <input
            type="text"
            placeholder="Search collection..."
            className="w-full bg-zinc-900/30 border border-white/5 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-bold outline-none focus:bg-zinc-900/60 focus:border-brand/30 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={16} strokeWidth={3} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* GRID */}
      <main className="px-6 mt-10 max-w-[1800px] mx-auto w-full overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={tableName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={getGridStyle(cols)}
            className="md:!grid md:![grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]"
          >
            {processedAlbums.slice(0, visibleCount).map((album, idx) => (
              <motion.div
                key={album.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: Math.min(idx * 0.01, 0.2) }}
                ref={idx === visibleCount - 1 ? lastAlbumRef : null}
                onClick={() => setSelectedAlbum(album)}
                className="group relative z-0 aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-xl active:scale-95 transition-transform"
              >
                <img
                  src={getOptimizedCover(album, 'grid')}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt=""
                />
                {album.tracks && (
                  <div
                    className="absolute top-0 left-0 w-8 h-8 bg-black/60 backdrop-blur-md z-10"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
                  >
                    <ListMusic size={10} className="absolute top-1.5 left-1.5 text-white/90" />
                  </div>
                )}
                <div
                  className={`absolute top-0 right-0 w-7 h-7 z-10 ${
                    album.status === 'OWNED' ? 'bg-brand' : 'bg-orange-500'
                  }`}
                  style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl z-50 border-[6px] border-[#09090b] active:scale-90 transition-transform"
      >
        <Plus size={36} strokeWidth={3} />
      </button>

      {/* FILTER DRAWER */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[210]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 left-0 right-0 bg-zinc-900 rounded-t-[3rem] border-t border-white/10 p-8 pt-10 z-[220] shadow-2xl text-left transform-gpu will-change-transform max-h-[85vh] overflow-y-auto no-scrollbar"
            >
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-10" />

              {/* SORT */}
              <section className="mb-10 max-w-lg mx-auto">
                <FilterLabel icon={<ArrowUpDown size={14} />} title="Sort By" />
                <div className="grid grid-cols-2 gap-3 px-4">
                  {[
                    { value: 'recent',      label: 'Recently Added' },
                    { value: 'artist_asc',  label: 'Artist: A–Z' },
                    { value: 'artist_desc', label: 'Artist: Z–A' },
                    { value: 'title_asc',   label: 'Title: A–Z' },
                    { value: 'title_desc',  label: 'Title: Z–A' },
                  ].map(({ value, label }) => (
                    <FilterBtn
                      key={value}
                      label={label}
                      active={sortBy === value}
                      onClick={() => setSortBy(value)}
                    />
                  ))}
                </div>
              </section>

              {/* STATUS */}
              <section className="mb-10 max-w-lg mx-auto">
                <FilterLabel icon={<BookmarkCheck size={14} />} title="Library Status" />
                <div className="grid grid-cols-3 gap-3 px-4">
                  <FilterBtn label="ALL"   active={filterStatus === 'ALL'}    onClick={() => setFilterStatus('ALL')} />
                  <FilterBtn label="OWNED" active={filterStatus === 'OWNED'}  onClick={() => setFilterStatus('OWNED')}  activeClass="bg-brand text-black border-brand" />
                  <FilterBtn label="WISH"  active={filterStatus === 'WANTED'} onClick={() => setFilterStatus('WANTED')} activeClass="bg-orange-500 text-black border-orange-500" />
                </div>
              </section>

              {/* FORMAT */}
              <section className="mb-10 max-w-lg mx-auto">
                <FilterLabel icon={<Disc size={14} />} title="Media Format" />
                <div className="grid grid-cols-4 gap-2 px-4">
                  <FilterBtn label="ALL" active={filterFormat === 'ALL'} onClick={() => setFilterFormat('ALL')} />
                  {formats.map((f: any) => (
                    <FilterBtn key={f} label={f} active={filterFormat === f} onClick={() => setFilterFormat(f)} />
                  ))}
                </div>
              </section>

              {/* RESET + APPLY */}
              <div className="flex gap-3 max-w-lg mx-auto mb-6">
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setSortBy('recent');
                      setFilterStatus('ALL');
                      setFilterFormat('ALL');
                    }}
                    className="py-5 px-6 bg-zinc-800 text-zinc-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-700 transition-all active:scale-95 shrink-0"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showAddModal && (
          <AddModal
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchAlbums}
            discogsToken={discogsToken}
          />
        )}
        {selectedAlbum && (
          <DetailsModal
            album={selectedAlbum}
            onClose={() => setSelectedAlbum(null)}
            onUpdateSuccess={fetchAlbums}
            onNext={
              currentIndex < processedAlbums.length - 1
                ? () => setSelectedAlbum(processedAlbums[currentIndex + 1])
                : undefined
            }
            onPrev={
              currentIndex > 0
                ? () => setSelectedAlbum(processedAlbums[currentIndex - 1])
                : undefined
            }
            onArtistClick={(n: string) => {
              setSearchTerm(n);
              setSelectedAlbum(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            cols={cols}
            setCols={(n: any) => {
              setCols(n);
              localStorage.setItem('walkman_cols', n.toString());
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MINI COMPONENTS ─────────────────────────────────────────────────────────

const StatBox = ({ label, val, colorClass, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex flex-col px-3 py-2 rounded-xl border transition-all ${
      active ? 'bg-zinc-800 border-white/10 shadow-lg' : 'border-transparent opacity-60'
    }`}
  >
    <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">
      {label}
    </span>
    <span className={`text-sm font-mono font-bold ${colorClass || 'text-zinc-300'}`}>
      {val.toString().padStart(2, '0')}
    </span>
  </button>
);

const FilterBtn = ({ label, active, onClick, activeClass = 'bg-white text-black border-white' }: any) => (
  <button
    onClick={onClick}
    className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center text-center ${
      active ? activeClass : 'bg-white/5 text-zinc-500 border-white/5 hover:bg-white/10'
    }`}
  >
    {label}
  </button>
);

const FilterLabel = ({ icon, title }: any) => (
  <div className="flex items-center gap-2 mb-5 text-zinc-500 border-b border-white/5 pb-2 ml-4">
    {icon}
    <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">{title}</span>
  </div>
);