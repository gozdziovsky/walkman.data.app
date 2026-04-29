import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Trash2, Edit3, Save, Play, MonitorPlay } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Album } from '../../../types/album';

export const VinylDetailsModal = ({ album, onClose, onUpdateSuccess }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<Album>(album);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await supabase.from('albums_vinyl').update(form).eq('id', album.id);
      onUpdateSuccess();
      setIsEdit(false);
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (confirm("Delete this vinyl?")) {
      await supabase.from('albums_vinyl').delete().eq('id', album.id);
      onUpdateSuccess();
      onClose();
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <motion.div className="bg-zinc-900 w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-800">
          <img src={album.coverUrl} className="w-full h-full object-cover" alt="" />
          <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-black/40 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="p-8 md:p-12 flex-1 text-left">
          <p className="text-brand font-black uppercase text-[10px] mb-2 tracking-widest italic">{album.artist}</p>
          <h2 className="text-4xl font-black uppercase italic leading-none mb-6">{album.title}</h2>
          
          <div className="flex gap-2 mb-8">
             <span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-black uppercase tracking-tighter">Year: {album.year}</span>
             <span className="px-3 py-1 bg-zinc-800 border border-brand/30 rounded-full text-[10px] font-black uppercase text-brand">Format: Vinyl</span>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => setIsEdit(!isEdit)} className="w-full py-4 border border-white/10 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
              <Edit3 size={14} /> {isEdit ? 'Cancel Edit' : 'Edit Record'}
            </button>
            <button onClick={handleDelete} className="w-full py-4 text-red-500/50 hover:text-red-500 transition-colors text-[10px] font-black uppercase flex items-center justify-center gap-2">
              <Trash2 size={14} /> Delete Permanently
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};