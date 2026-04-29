import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import type { Album } from '../../../types/album';

export const DigitalAddModal = ({ onClose, onSuccess, searchSource, discogsToken }: any) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localSource, setLocalSource] = useState<'itunes' | 'discogs'>(searchSource || 'itunes');

  const [form, setForm] = useState({
    artist: '', 
    title: '', 
    coverUrl: '', 
    genre: '',
    year: new Date().getFullYear(), 
    format: 'FLAC' as any, 
    status: 'MAM' as any, 
    rating: 0, 
    spotify_url: '', 
    youtube_url: '', 
    tracks: ''
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      if (localSource === 'itunes') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=15&country=PL`);
        const data = await res.json();
        setResults(data.results.map((r: any) => ({
          collectionId: r.collectionId,
          title: r.collectionName, 
          artist: r.artistName,
          coverUrl: r.artworkUrl100.replace('100x100', '800x800'),
          year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : '',
          genre: r.primaryGenreName
        })));
      } else {
        if (!discogsToken) { alert("Brak tokenu Discogs!"); return; }
        const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&per_page=15&token=${discogsToken}`);
        const data = await res.json();
        setResults(data.results.map((r: any) => {
          const [artist, title] = r.title.includes(' - ') ? r.title.split(' - ') : ['Unknown', r.title];
          return { title: title.trim(), artist: artist.trim(), coverUrl: r.cover_image, year: r.year || '', genre: r.genre?.[0] || '' };
        }));
      }
    } finally { setSearching(false); }
  };

  const handleSelect = async (item: any) => {
    let fetchedTracks = '';
    if (localSource === 'itunes' && item.collectionId) {
      try {
        const res = await fetch(`https://itunes.apple.com/lookup?id=${item.collectionId}&entity=song`);
        const data = await res.json();
        fetchedTracks = data.results.filter((r: any) => r.wrapperType === 'track')
          .map((s: any) => `${s.trackNumber}. ${s.trackName}`).join('\n');
      } catch (e) { console.error(e); }
    }
    setForm({ ...form, artist: item.artist, title: item.title, coverUrl: item.coverUrl, genre: item.genre, year: parseInt(item.year) || form.year, tracks: fetchedTracks });
    setImagePreview(item.coverUrl);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `covers/digital/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }
      await supabase.from('albums').insert([{ ...form, coverUrl: finalUrl }]);
      onSuccess(); 
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={onClose}>
      <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto no-scrollbar border border-white/5" onClick={e => e.stopPropagation()}>
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase italic">Add <span className="text-brand">Digital</span></h2>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500 hover:text-white"><X size={20} /></button>
        </header>

        <div className="space-y-6">
          {/* Search Section */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input className="w-full bg-zinc-950 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-sm font-bold" placeholder="Search for album..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            </div>
            <button onClick={search} className="px-8 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest">{searching ? <Loader2 className="animate-spin" size={16} /> : 'Find'}</button>
          </div>

          {results.length > 0 && (
            <div className="bg-zinc-800 rounded-2xl overflow-hidden divide-y divide-white/5">
              {results.map((r, i) => (
                <button key={i} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-brand/10 text-left transition-colors">
                  <img src={r.coverUrl} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-black uppercase">{r.title}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">{r.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
               <input required className="bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" placeholder="Artist" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
               <input required className="bg-zinc-950 border border-white/5 rounded-xl p-4 text-sm font-bold" placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
             </div>
             <textarea className="w-full bg-zinc-950 border border-white/5 rounded-xl p-4 text-xs font-mono h-32" placeholder="Tracklist" value={form.tracks} onChange={e => setForm({...form, tracks: e.target.value})} />
             <button type="submit" disabled={loading} className="w-full py-5 bg-brand text-black rounded-2xl font-black uppercase text-xs tracking-widest">{loading ? 'Saving...' : 'Archive Record'}</button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};