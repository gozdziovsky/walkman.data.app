import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

export const AddAlbumModal = ({ onClose, onSuccess, searchSource, discogsToken }: any) => {
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
      if (searchSource === 'itunes') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`);
        const data = await res.json();
        setResults(data.results.map((r: any) => ({
          title: r.collectionName, artist: r.artistName,
          coverUrl: r.artworkUrl100.replace('100x100', '800x800'),
          year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : '',
          genre: r.primaryGenreName, spotify_url: '' 
        })));
      } else {
        if (!discogsToken) return;
        const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=5&token=${discogsToken}`);
        const data = await res.json();
        setResults(data.results.map((r: any) => {
          const [artist, title] = r.title.includes(' - ') ? r.title.split(' - ') : ['Unknown', r.title];
          return { title: title.trim(), artist: artist.trim(), coverUrl: r.cover_image, year: r.year || '', genre: r.genre?.[0] || '', spotify_url: '' };
        }));
      }
    } finally { setSearching(false); }
  };

  const handleSelect = (item: any) => {
    setForm({ ...form, artist: item.artist, title: item.title, coverUrl: item.coverUrl, genre: item.genre, year: parseInt(item.year) || form.year, spotify_url: '' });
    setImagePreview(item.coverUrl);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `covers/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      await supabase.from('albums').insert([{ ...form, coverUrl: finalUrl }]);
      onSuccess(); onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[3rem] md:rounded-[3rem] p-8 md:p-12 overflow-y-auto max-h-[92vh] border-t border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase italic text-white">Add <span className="text-green-500">Record</span></h2>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>

        <div className="relative mb-10">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 h-14">
            <div className="pl-4 text-zinc-500 shrink-0"><Search size={18} /></div>
            <input className="flex-1 bg-transparent px-2 h-full outline-none text-sm font-bold placeholder:text-zinc-700 text-white" placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <button type="button" onClick={search} className="shrink-0 h-full px-6 rounded-xl font-black uppercase text-[10px] bg-white text-black">{searching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}</button>
          </div>
          {results.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-zinc-800 rounded-2xl overflow-hidden z-50">
              {results.map((r, i) => <button key={i} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 text-left border-b border-white/5 last:border-0 text-white"><img src={r.coverUrl} className="w-12 h-12 rounded-lg object-cover" alt="" /><div><p className="text-xs font-black uppercase">{r.title}</p><p className="text-[10px] text-zinc-500 uppercase">{r.artist}</p></div></button>)}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-full md:w-48 aspect-square bg-zinc-800 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><ImageIcon className="text-zinc-700 mx-auto mb-2" size={32} /><p className="text-[9px] font-black uppercase text-zinc-600">Manual Cover</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
            </div>
            <div className="flex-1 space-y-4">
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Artist" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
              <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-5 bg-green-500 text-black rounded-3xl font-black uppercase text-[11px]">Save Record</button>
        </form>
      </motion.div>
    </motion.div>
  );
};