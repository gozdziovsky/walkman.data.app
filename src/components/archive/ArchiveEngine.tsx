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
  formats: string[];
  AddModal: React.ComponentType<any>;
  DetailsModal: React.ComponentType<any>;
}

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

  const [filterFormat, setFilterFormat] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'recent' | 'artist' | 'album' | 'year'>('recent');
  const [cols, setCols] = useState(() => parseInt(localStorage.getItem('walkman_cols') || '3'));

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-color', themeColor);
  }, [themeColor]);

  useEffect(() => {
    const isAnyModalOpen = showAddModal || showSettings || showFilters || !!selectedAlbum;
    document.body.style.overflow = isAnyModalOpen ? 'hidden' : 'unset';
  }, [showAddModal, showSettings, showFilters, selectedAlbum]);

  const fetchAlbums = async () => {
    const { data } = await supabase.from(tableName).select('*').order('created_at', { ascending: false });
    if (data) setAlbums(data as Album[]);
  };

  useEffect(() => { fetchAlbums(); }, [tableName]);

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
      if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
      if (sortBy === 'album') return a.title.localeCompare(b.title);
      if (sortBy === 'year') return (b.year || 0) - (a.year || 0);
      return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
    });
    return result;
  }, [albums, searchTerm, filterFormat, filterStatus, sortBy]);

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

  const currentIndex = useMemo(() => 
    processedAlbums.findIndex(a => a.id === selectedAlbum?.id),
    [processedAlbums, selectedAlbum]
  );

  const stats = useMemo(() => ({
    total: albums.length,
    owned: albums.filter(a => a.status === 'MAM').length,
    wanted: albums.filter(a => a.status === 'SZUKAM').length,
  }), [albums]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-32">
      <style>{`:root { --brand-color: ${themeColor}; } .text-brand { color: var(--brand-color) !important; } .bg-brand { background-color: var(--brand-color) !important; } .border-brand { border-color: var(--brand-color) !important; }`}</style>
      
      <header className="px-6 mt-2 space-y-6 max-w-[1800px] mx-auto w-full">
        <div className="flex flex-col items-center justify-center py-2"> 
          <img src={logo} alt="Logo" className="w-full max-w-[320px] md:max-w-[480px] h-auto object-contain select-none" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand mt-1 italic opacity-40">{archiveTitle}</p>
        </div>

        <div className="flex items-center justify-between bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[2rem] p-2 pl-4 shadow-2xl">
          <div className="flex gap-1 overflow-x-auto no-scrollbar items-center">
            <StatBox label="Total" val={stats.total} active={filterStatus === 'ALL'} onClick={() => setFilterStatus('ALL')} />
            <StatBox label="Owned" val={stats.owned} colorClass="text-brand" active={filterStatus === 'MAM'} onClick={() => setFilterStatus('MAM')} />
            <StatBox label="Wanted" val={stats.wanted} colorClass="text-orange-500" active={filterStatus === 'SZUKAM'} onClick={() => setFilterStatus('SZUKAM')} />
          </div>
          <div className="flex items-center gap-1 mr-2">
            <button onClick={() => setShowFilters(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90 relative"><Filter size={18} />{(filterFormat !== 'ALL' || filterStatus !== 'ALL') && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-[#09090b]" />}</button>
            <button onClick={() => setShowSettings(true)} className="p-3 rounded-full bg-zinc-900/50 text-zinc-500 hover:text-white transition-all active:scale-90"><Settings2 size={18} /></button>
          </div>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
          <input type="text" placeholder={`Szukaj w kolekcji...`} className="w-full bg-zinc-900/30 border border-white/5 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-bold outline-none focus:bg-zinc-900/60 focus:border-brand/30 transition-all" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </header>

      <main className="px-6 mt-10 max-w-[1800px] mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tableName}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`grid grid-cols-${cols} md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4`}
          >
            {processedAlbums.slice(0, visibleCount).map((album, idx) => (
              <motion.div 
                key={album.id} layoutId={album.id}
                ref={idx === visibleCount - 1 ? lastAlbumRef : null}
                onClick={() => setSelectedAlbum(album)} 
                className="group relative aspect-square bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-xl active:scale-95 transition-transform"
              >
                <img src={getOptimizedCover(album.coverUrl, 'grid')} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                {album.tracks && <div className="absolute top-0 left-0 w-9 h-9 bg-black/60 backdrop-blur-md z-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}><ListMusic size={11} className="absolute top-1.5 left-1.5 text-white/90" /></div>}
                <div className={`absolute top-0 right-0 w-7 h-7 z-10 ${album.status === 'MAM' ? 'bg-brand' : 'bg-orange-500'}`} style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
        {visibleCount < processedAlbums.length && <div className="w-full h-24 flex items-center justify-center"><Loader2 className="animate-spin text-zinc-600" size={24} /></div>}
      </main>

      <button onClick={() => setShowAddModal(true)} className="fixed bottom-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-brand text-black rounded-full flex items-center justify-center shadow-2xl z-50 border-[6px] border-[#09090b] active:scale-90 transition-transform"><Plus size={36} strokeWidth={3} /></button>

      <AnimatePresence>
        {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onSuccess={fetchAlbums} />}
        {selectedAlbum && <DetailsModal album={selectedAlbum} onClose={() => setSelectedAlbum(null)} onUpdateSuccess={fetchAlbums} onNext={currentIndex < processedAlbums.length - 1 ? () => setSelectedAlbum(processedAlbums[currentIndex + 1]) : undefined} onPrev={currentIndex > 0 ? () => setSelectedAlbum(processedAlbums[currentIndex - 1]) : undefined} onArtistClick={(n:string)=>{setSearchTerm(n);setSelectedAlbum(null);}} />}
      </AnimatePresence>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} cols={cols} setCols={(n:any)=>{setCols(n); localStorage.setItem('walkman_cols', n.toString())}} />}
    </div>
  );
};

const StatBox = ({ label, val, colorClass, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col px-3 py-2 rounded-xl border transition-all ${active ? 'bg-zinc-800 border-white/10 shadow-lg' : 'border-transparent opacity-60'}`}><span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest mb-1 leading-none">{label}</span><span className={`text-sm font-mono font-bold ${colorClass || 'text-zinc-300'}`}>{val.toString().padStart(2, '0')}</span></button>
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