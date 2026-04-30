import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const CDAddModal = ({ onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    artist: '', title: '', coverUrl: '', genre: '',
    year: new Date().getFullYear(), format: 'CD', status: 'OWNED'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('albums_cd').insert([form]);
      onSuccess(); 
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-xl rounded-[2.5rem] p-8 border border-white/10" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase italic">Add <span className="text-brand">CD</span></h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Artist" className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
          <input required placeholder="Title" className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <button type="submit" disabled={loading} className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/20">
            {loading ? 'Saving CD...' : 'Save to CD Archive'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};