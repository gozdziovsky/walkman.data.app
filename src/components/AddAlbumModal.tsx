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
    status: 'MAM' as Album['status'], 
    rating: 0, spotify_url: '', youtube_url: '', tracks: ''
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      if (searchSource === 'itunes') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=5`);
        const data = await res.json();
        setResults(data.results.map((r: any) => ({
          collectionId: r.collectionId,
          title: r.collectionName, artist: r.artistName,
          coverUrl: r.artworkUrl100.replace('100x100', '800x800'),
          year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : '',
          genre: r.primaryGenreName
        })));
      } else {
        if (!discogsToken) return;
        const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=5&token=${discogsToken}`);
        const data = await res.json();
        setResults(data.results.map((r: any) => {
          const [artist, title] = r.title.includes(' - ') ? r.title.split(' - ') : ['Unknown', r.title];
          return { title: title.trim(), artist: artist.trim(), coverUrl: r.cover_image, year: r.year || '', genre: r.genre?.[0] || '' };
        }));
      }
    } finally { setSearching(false); }
  };

  const handleSelect = async (item: any) => {
    setSearching(true);
    let fetchedTracks = '';
    try {
      if (searchSource === 'itunes' && item.collectionId) {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${item.collectionId}&entity=song`);
        const data = await res.json();
        const songs = data.results.filter((r: any) => r.wrapperType === 'track');
        fetchedTracks = songs.map((s: any) => `${s.trackNumber}. ${s.trackName}`).join('\n');
      }
    } catch (e) { console.error("Tracklist fetch failed", e); }

    setForm({ ...form, artist: item.artist, title: item.title, coverUrl: item.coverUrl, genre: item.genre, year: parseInt(item.year) || form.year, tracks: fetchedTracks });
    setImagePreview(item.coverUrl);
    setResults([]);
    setSearching(false);
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "tween", ease: "easeOut", duration: 0.3 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 overflow-y-auto max-h-[95vh] border-t border-white/10 shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Add <span className="text-brand">Record</span></h2>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        <div className="relative mb-10 group w-full">
          <div className="flex items-stretch bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand/50 transition-all shadow-inner h-14 w-full">
            <div className="flex items-center justify-center pl-5 text-zinc-600 shrink-0"><Search size={18} /></div>
            <input className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-white placeholder:text-zinc-700 min-w-0" placeholder={`Search via ${searchSource.toUpperCase()}...`} value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && search()} />
            <button type="button" onClick={search} className="px-6 md:px-10 bg-white hover:bg-brand text-black font-black uppercase text-[11px] tracking-widest transition-colors active:scale-95 shrink-0">{searching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}</button>
          </div>
          {results.length > 0 && (
            <div className="absolute top-full mt-3 left-0 right-0 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
              {results.map((r, i) => (
                <button key={i} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-brand/10 text-left border-b border-white/5 last:border-0 text-white transition-colors group">
                  <img src={r.coverUrl} className="w-12 h-12 rounded-lg object-cover shadow-lg" alt="" />
                  <div className="truncate"><p className="text-xs font-black uppercase truncate group-hover:text-brand transition-colors">{r.title}</p><p className="text-[10px] text-zinc-500 uppercase font-bold">{r.artist}</p></div>
                </button>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-full md:w-52 aspect-square bg-zinc-950 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative shrink-0 group hover:border-brand/30 transition-colors">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <div className="text-center"><ImageIcon className="text-zinc-800 mx-auto mb-2 group-hover:text-brand/30 transition-colors" size={40} /><p className="text-[8px] font-black uppercase text-zinc-700 group-hover:text-brand/50 transition-colors">Manual Cover</p></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
            </div>
            <div className="flex-1 space-y-5">
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Artist Name</label><input required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} /></div>
              <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Album Title</label><input required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.title} onChange={e => setForm({...form, title: e.target.value})} /></div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Initial Status</label>
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-2xl border border-white/5 h-14">
              <button type="button" onClick={() => setForm({...form, status: 'MAM'})} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${form.status === 'MAM' ? 'bg-brand text-black' : 'text-zinc-600'}`}>Owned</button>
              <button type="button" onClick={() => setForm({...form, status: 'SZUKAM'})} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${form.status === 'SZUKAM' ? 'bg-orange-500 text-black' : 'text-zinc-600'}`}>Wanted</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Genre</label><input className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-[9px] font-black uppercase text-zinc-600 ml-1">Year</label><input type="number" className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} /></div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white active:scale-[0.98] transition-all shadow-2xl shadow-brand/20 disabled:opacity-50">
            {loading ? 'Archiving...' : 'Save Record'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};