import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
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
    year: new Date().getFullYear(), format: 'FLAC' as Album['format'], 
    status: 'MAM' as Album['status'], rating: 0,
    spotify_url: '', youtube_url: '', tracks: ''
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`);
      const data = await res.json();
      setResults(data.results || []);
    } finally { setSearching(false); }
  };

  const handleSelect = (item: any) => {
    const img = item.artworkUrl100.replace('100x100', '800x800');
    setForm({ 
      ...form, 
      artist: item.artistName, 
      title: item.collectionName, 
      coverUrl: img, 
      genre: item.primaryGenreName, 
      year: new Date(item.releaseDate).getFullYear(),
      spotify_url: item.collectionViewUrl
    });
    setImagePreview(img);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `${Date.now()}.jpg`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from('albums').insert([{ ...form, coverUrl: finalUrl }]);
      if (error) throw error;
      onSuccess(); onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2rem] md:rounded-[2.5rem] p-8 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic">New <span className="text-green-500">Record</span></h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full"><X size={20} /></button>
        </header>

        <div className="flex gap-2 mb-6">
          <input className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none" placeholder="Search iTunes..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          <button onClick={search} className="px-4 bg-white text-black rounded-xl font-bold text-xs uppercase">{searching ? <Loader2 className="animate-spin" /> : 'Find'}</button>
        </div>

        {results.length > 0 && (
          <div className="mb-6 bg-zinc-800 rounded-xl overflow-hidden">
            {results.map(r => (
              <button key={r.collectionId} onClick={() => handleSelect(r)} className="w-full p-3 flex items-center gap-3 hover:bg-white/5 border-b border-white/5 text-left">
                <img src={r.artworkUrl60} className="w-10 h-10 rounded shadow" alt="" />
                <div className="truncate"><p className="text-xs font-bold truncate">{r.collectionName}</p><p className="text-[10px] text-zinc-500 uppercase">{r.artistName}</p></div>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-zinc-800 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer overflow-hidden shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-zinc-600" />}
              <input type="file" ref={fileInputRef} className="hidden" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }}} />
            </div>
            <div className="flex-1 space-y-3">
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" placeholder="Artist" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
              <input required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
          </div>
          <button disabled={loading} className="w-full py-4 bg-green-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest">{loading ? 'Saving...' : 'Add to Cloud'}</button>
        </form>
      </motion.div>
    </motion.div>
  );
};
