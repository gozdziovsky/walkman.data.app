import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search, PlusCircle } from 'lucide-react';
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
    setQuery('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;

      // Jeśli użytkownik wybrał plik z dysku, wgraj go do Supabase Storage
      if (imageFile) {
        const path = `${Date.now()}-${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('album-covers').upload(path, imageFile);
        if (uploadError) throw uploadError;
        finalUrl = supabase.storage.from('album-covers').getPublicUrl(path).data.publicUrl;
      }

      if (!finalUrl) {
        throw new Error('Please add a cover image (search or upload)');
      }

      const { error } = await supabase.from('albums').insert([{ ...form, coverUrl: finalUrl }]);
      if (error) throw error;
      
      onSuccess(); 
      onClose();
    } catch (err: any) { 
      alert(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 overflow-y-auto max-h-[92vh] border-t md:border border-white/10" onClick={e => e.stopPropagation()}>
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">New <span className="text-green-500">Entry</span></h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Search or add manually</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        {/* Sekcja Szukania */}
        {/* Sekcja Szukania - Naprawiony Layout */}
<div className="relative mb-10">
  <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all h-14">
    {/* Ikona Lupy */}
    <div className="pl-4 text-zinc-500 shrink-0">
      <Search size={18} />
    </div>

    {/* Input - min-w-0 pozwala mu się zwężać na bardzo małych ekranach bez rozwalania przycisku */}
    <input 
      className="flex-1 bg-transparent px-2 h-full outline-none text-sm font-bold placeholder:text-zinc-600 min-w-0" 
      placeholder="Search iTunes for auto-fill..." 
      value={query} 
      onChange={e => setQuery(e.target.value)} 
      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), search())} 
    />

    {/* Przycisk Find - shrink-0 to klucz, h-full wypełnia p-1 kontenera */}
    <button 
      type="button" 
      onClick={search} 
      className="shrink-0 h-full px-6 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 active:scale-95 transition-all"
    >
      {searching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
    </button>
  </div>
  
  {/* Wyniki wyszukiwania - dodajemy lekkie odsunięcie, żeby nie przyklejały się do inputa */}
  {results.length > 0 && (
    <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
      {results.map(r => (
        <button key={r.collectionId} type="button" onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors">
          <img src={r.artworkUrl60} className="w-12 h-12 rounded-lg shadow-lg shrink-0" alt="" />
          <div className="truncate">
            <p className="text-xs font-black uppercase truncate text-white">{r.collectionName}</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase">{r.artistName}</p>
          </div>
        </button>
      ))}
    </div>
  )}
</div>

            {/* Pola tekstowe */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Artist Name</label>
                <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" placeholder="e.g. Pink Floyd" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Album Title</label>
                <input required className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" placeholder="e.g. The Wall" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Year</label>
                <input type="number" className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Genre</label>
                <input className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none" placeholder="Rock, Jazz..." value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
              </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Format</label>
              <select className="w-full bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase outline-none" value={form.format} onChange={e => setForm({...form, format: e.target.value as any})}>
                <option value="FLAC">FLAC</option><option value="CD">CD</option><option value="MP3">MP3</option><option value="Hi-Res">Hi-Res</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Status</label>
              <select className="w-full bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase text-green-500 outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                <option value="MAM">Owned</option><option value="SZUKAM">Wishlist</option>
              </select>
            </div>
          </div>

          <button disabled={loading} type="submit" className="w-full py-5 bg-green-500 text-black rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-white transition-colors shadow-xl shadow-green-500/10">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Entry'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
