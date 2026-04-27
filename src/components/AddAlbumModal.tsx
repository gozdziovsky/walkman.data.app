import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image as ImageIcon, Loader2, Star, Calendar, Music, Disc } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

export const AddAlbumModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    artist: '', title: '', coverUrl: '', genre: '',
    year: new Date().getFullYear(), format: 'FLAC', status: 'MAM', rating: 0
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`);
      const data = await res.json();
      setResults(data.results);
    } finally { setSearching(false); }
  };

  const handleSelect = (item: any) => {
    const img = item.artworkUrl100.replace('100x100', '800x800');
    setForm({ ...form, artist: item.artistName, title: item.collectionName, coverUrl: img, genre: item.primaryGenreName, year: new Date(item.releaseDate).getFullYear() });
    setImagePreview(img);
    setResults([]);
    setQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let url = form.coverUrl;
      if (imageFile) {
        const path = `${Date.now()}.jpg`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        url = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      if (!url) return alert('Add cover!');
      await supabase.from('albums').insert([{ ...form, coverUrl: url }]);
      onSuccess(); onClose();
    } catch (err) { alert('Error!'); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 overflow-y-auto max-h-[90vh] border-t md:border border-white/10" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Add <span className="text-green-500">Vibe</span></h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Automatic search or manual entry</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>

        {/* SEARCH BAR */}
        <div className="relative mb-10">
          <div className="flex gap-2 p-2 bg-white/5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all">
            <input className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-bold" placeholder="Magic search..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <button onClick={search} className="px-6 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest">
              {searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
              {results.map(r => (
                <button key={r.collectionId} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left">
                  <img src={r.artworkUrl60} className="w-10 h-10 rounded-lg" />
                  <div className="truncate"><p className="text-xs font-black uppercase truncate">{r.collectionName}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{r.artistName}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-zinc-800 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden group">
            {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="text-zinc-700" size={32} />}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }}} />
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Artist & Title</label>
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500" placeholder="Artist" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Year</label>
                <input type="number" className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-600 uppercase tracking-widest ml-1">Genre</label>
                <input className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold" placeholder="Genre" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
              </div>
            </div>

            <div className="flex gap-2">
              <select className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase" value={form.format} onChange={e => setForm({...form, format: e.target.value})}>
                <option value="FLAC">FLAC</option><option value="CD">CD</option><option value="MP3">MP3</option>
              </select>
              <select className="flex-1 bg-zinc-800 rounded-xl px-4 py-3 text-[10px] font-black uppercase text-green-500" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option value="MAM">Owned</option><option value="SZUKAM">Wishlist</option>
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="md:col-span-2 py-5 bg-green-500 text-black rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-500/10 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm & Save to Cloud'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};