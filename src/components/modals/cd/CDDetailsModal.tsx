import { motion } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const CDDetailsModal = ({ album, onClose, onUpdateSuccess }: any) => {
  const handleDelete = async () => {
    if (confirm("Delete this CD from archive?")) {
      await supabase.from('albums_cd').delete().eq('id', album.id);
      onUpdateSuccess();
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div className="bg-zinc-900 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row border border-white/5" onClick={e => e.stopPropagation()}>
        <div className="w-full md:w-1/2 aspect-square bg-zinc-800">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="p-10 flex-1 text-left relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-800 rounded-full"><X size={18} /></button>
          <p className="text-brand font-black uppercase text-[10px] tracking-widest mb-2 italic">{album.artist}</p>
          <h2 className="text-4xl font-black uppercase italic leading-none mb-8">{album.title}</h2>
          <button onClick={handleDelete} className="flex items-center gap-2 text-red-500/50 hover:text-red-500 transition-colors text-[10px] font-black uppercase tracking-widest">
            <Trash2 size={14} /> Delete CD
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};