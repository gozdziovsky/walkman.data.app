import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Link as LinkIcon, Music } from 'lucide-react';
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
      setResults(data.results);
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
      spotify_url: item.collectionViewUrl // iTunes link jako backup lub punkt wyjścia
    });
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
        const path = `covers/${Date.now()}.jpg`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        url = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from('albums').insert([{ ...form, coverUrl: url }]);
      if (error) throw error;
      onSuccess(); onClose();
    } catch (err) { 
      alert('Error saving. Make sure SQL columns exist!'); 
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 overflow-y-auto max-h-[92vh] border-t md:border border-white/10" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">New <span className="text-green-500">Entry</span></h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>

        {/* SEARCH SECTION */}
        <div className="relative mb-8">
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all">
            <input className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-bold" placeholder="Auto-fill via iTunes..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), search())} />
            <button type="button" onClick={search} className="px-5 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-transform">
              {searching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
            </button>
          </div>
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
              {results.map(r => (
                <button key={r.collectionId} type="button" onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors">
                  <img src={r.artworkUrl60} className="w-10 h-10 rounded-lg" />
                  <div className="truncate"><p className="text-xs font-black uppercase truncate">{r.collectionName}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{r.artistName}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-full md:w-48 aspect-square bg-zinc-800 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative group shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" /> : <ImageIcon className="text-zinc-700" size={32} />}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase">Upload</div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); }}} />
            </div>

            <div className="flex-1 space-y-4">
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500" placeholder="Artist" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
                <input className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold" placeholder="Genre" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-2"><LinkIcon size={12} /> Streaming Links</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold focus:border-green-500" placeholder="Spotify URL" value={form.spotify_url} onChange={e => setForm({...form, spotify_url: e.target.value})} />
                <input className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold focus:border-red-500/50" placeholder="YouTube URL" value={form.youtube_url} onChange={e => setForm({...form, youtube_url: e.target.value})} />
             </div>
          </div>

          <div className="space-y-2">
             <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 mb-2"><Music size={12} /> Tracklist</div>
             <textarea className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold min-h-[100px] outline-none focus:border-white/20" placeholder="1. Song One&#10;2. Song Two..." value={form.tracks} onChange={e => setForm({...form, tracks: e.target.value})} />
          </div>

          <div className="flex gap-4">
            <select className="flex-1 bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase outline-none" value={form.format} onChange={e => setForm({...form, format: e.target.value as any})}>
              <option value="FLAC">FLAC</option><option value="CD">CD</option><option value="MP3">MP3</option><option value="Hi-Res">Hi-Res</option>
            </select>
            <select className="flex-1 bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase text-green-500 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
              <option value="MAM">In Library</option><option value="SZUKAM">Wishlist</option>
            </select>
          </div>

          <button disabled={loading} type="submit" className="w-full py-5 bg-green-500 text-black rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-green-500/10 active:scale-95 transition-all">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Vibe to Cloud'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
