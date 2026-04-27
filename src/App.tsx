import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, Settings2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AddAlbumModal } from './components/AddAlbumModal';
import { DetailsModal } from './components/DetailsModal';
import type { Album } from './types/album';

function App() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  
  // Stan dla kolumn (domyślnie 3)
  const [cols, setCols] = useState<number>(() => {
    const saved = localStorage.getItem('walkman_cols');
    return saved ? parseInt(saved) : 3;
  });

  // Mapowanie kolumn na klasy Tailwinda
  const gridConfig: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    localStorage.setItem('walkman_cols', cols.toString());
  }, [cols]);

  const fetchAlbums = async () => {
    const { data } = await supabase
      .from('albums')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setAlbums(data);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pb-24">
      {/* HEADER */}
      <header className="p-6 pt-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            Walkman<span className="text-green-500">.</span>Cloud
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
            Digital Audio Archive v4.0
          </p>
        </div>

        {/* PRZEŁĄCZNIK SIATKI */}
        <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          {[1, 2, 3, 4].map((num) => (
            <button
              key={num}
              onClick={() => setCols(num)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${
                cols === num ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </header>

      {/* GRID Z ALBUMAMI */}
      <main className="px-4">
        <div className={`grid ${gridConfig[cols]} gap-3 transition-all duration-300`}>
          {albums.map((album) => (
            <div 
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className="group relative aspect-square bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
            >
              <img 
                src={album.coverUrl} 
                className="w-full h-full object-cover transition-opacity group-hover:opacity-80" 
                alt={album.title} 
              />
              
              {/* Overlay dla 1 i 2 kolumn (czytelniejszy) */}
              {cols <= 2 && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-4 flex flex-col justify-end">
                  <p className="text-[10px] font-black uppercase text-green-500 truncate">{album.artist}</p>
                  <p className="text-xs font-bold truncate">{album.title}</p>
                </div>
              )}

              {/* Status Badge */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${album.status === 'MAM' ? 'bg-green-500' : 'bg-orange-500'} shadow-lg`} />
            </div>
          ))}
        </div>
      </main>

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-green-500 text-black rounded-full flex items-center justify-center shadow-2xl shadow-green-500/20 active:scale-90 transition-transform z-50"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {/* MODALE */}
      {showAddModal && (
        <AddAlbumModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchAlbums} 
        />
      )}

      {selectedAlbum && (
        <DetailsModal 
          album={selectedAlbum} 
          onClose={() => setSelectedAlbum(null)} 
          onUpdateSuccess={fetchAlbums} 
        />
      )}
    </div>
  );
}

export default App;
