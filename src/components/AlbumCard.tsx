import React from 'react';
import { motion } from 'framer-motion';
import { Disc, Music } from 'lucide-react'; // Dodajemy ikonę Music
import type { Album } from '../types/album';

export const AlbumCard = ({ album, onClick }: { album: Album; onClick: () => void }) => {
  // Funkcja, która podmieni zepsuty link na stylowy placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=500&auto=format&fit=cover';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
        <img 
          src={album.coverUrl} 
          alt={album.title}
          onError={handleImageError}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
        />
        
        {/* Reszta kodu bez zmian... */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
        <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-tighter">
          {album.format}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
           <div className="p-4 bg-green-500 rounded-full shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
             <Disc size={24} className="text-black animate-spin-slow" />
           </div>
        </div>
      </div>
      <div className="mt-3 px-1">
        <h3 className="text-sm font-bold truncate uppercase tracking-tight text-white">{album.title || "Unknown Album"}</h3>
        <p className="text-[11px] text-zinc-500 font-bold truncate uppercase tracking-widest">{album.artist || "Unknown Artist"}</p>
      </div>
    </motion.div>
  );
};