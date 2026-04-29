import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Album } from '../../../types/album';

export const VinylAddModal = ({ onClose, onSuccess, discogsToken }: any) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    artist: '', title: '', coverUrl: '', genre: '',
    year: new Date().getFullYear(), format: '12" LP', 
    status: 'MAM' as 'MAM' | 'SZUKAM', 
    tracks: '', record_condition: 'VG+' // Pole specyficzne dla Winyli
  });

  const search = async () => {
    if (!query || !discogsToken) return;
    setSearching(true);
    try {
      const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=10&token=${discogsToken}`);
      const data = await res.json();
      setResults(data.results.map((r: any) => ({
        title: r.title.split(' - ')[1] || r.title,
        artist: r.title.split(' - ')[0] || 'Unknown',
        coverUrl: r.cover_image,
        year: r.year || '',
        genre: r.genre?.[0] || ''
      })));
    } finally { setSearching(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `covers/vinyl/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      // WAŻNE: celujemy w tabelę vinyl
      await supabase.from('albums_vinyl').insert([{ ...form, coverUrl: finalUrl }]);
      onSuccess(); 
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3.5rem] p-8 overflow-y-auto max-h-[95vh] relative shadow-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic text-white">Add <span className="text-brand">Vinyl</span></h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>

        {/* Wyszukiwarka Discogs */}
        <div className="flex gap-2 mb-8">
          <input className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 text-sm font-bold" placeholder="Search Discogs..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} className="px-6 py-3 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest">
            {searching ? <Loader2 className="animate-spin" size={16} /> : 'Find'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {results.map((r, i) => (
              <button key={i} onClick={() => { setForm({...form, artist: r.artist, title: r.title, coverUrl: r.coverUrl, genre: r.genre}); setImagePreview(r.coverUrl); setResults([]); }} className="p-2 bg-white/5 hover:bg-brand/20 rounded-lg flex items-center gap-3 text-left">
                <img src={r.coverUrl} className="w-10 h-10 rounded object-cover" />
                <span className="text-[10px] font-bold uppercase truncate">{r.artist} - {r.title}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <input required placeholder="Artist" className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
             <input required placeholder="Title" className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand/20">
            {loading ? 'Saving...' : 'Add to Collection'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};