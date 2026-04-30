import { motion } from 'framer-motion';
import { Disc } from 'lucide-react'; // Usunięto 'Music'
import type { Album } from '../types/album';

interface AlbumCardProps {
  album: Album;
  onClick: () => void;
}

export const AlbumCard = ({ album, onClick }: AlbumCardProps) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-zinc-800 mb-3">
        <img 
          src={album.coverUrl} 
          alt={album.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Disc className="text-white" size={32} />
        </div>
        {album.status === 'WANTED' && (
          <div className="absolute top-2 right-2 bg-orange-500 text-black text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
            Wanted
          </div>
        )}
      </div>
      <div className="px-1">
        <h3 className="text-xs font-black uppercase truncate tracking-tight mb-0.5">{album.title}</h3>
        <p className="text-[10px] text-zinc-500 font-bold uppercase truncate tracking-widest">{album.artist}</p>
      </div>
    </motion.div>
  );
};
