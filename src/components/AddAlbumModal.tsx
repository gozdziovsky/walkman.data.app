import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Loader2, Search, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

interface AddAlbumModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddAlbumModal = ({ onClose, onSuccess }: AddAlbumModalProps) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    artist: '',
    title: '',
    coverUrl: '',
    genre: '',
    year: new Date().getFullYear(),
    format: 'FLAC' as Album['format'],
    status: 'MAM' as Album['status'],
    rating: 0,
    spotify_url: '',
    youtube_url: '',
    tracks: ''
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSelect = (item: any) => {
    const img = item.artworkUrl100.replace('100x100', '800x800');
    setForm({ 
      ...form, 
      artist: item.artistName, 
      title: item.collectionName, 
      coverUrl: img, 
      genre: item.primaryGenreName || '', 
      year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : new Date().getFullYear(),
      spotify_url: item.collectionViewUrl || ''
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

      // Obsługa własnego pliku graficznego
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `covers/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('album-covers')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('album-covers')
          .getPublicUrl(filePath);
        
        finalUrl = data.publicUrl;
      }

      if (!finalUrl) {
        throw new Error('Musisz dodać okładkę (przez wyszukiwarkę lub plik)');
      }

      const { error } = await supabase.from('albums').insert([{ 
        ...form, 
        coverUrl: finalUrl 
      }]);

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
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6" 
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 100 }} 
        animate={{ y: 0 }} 
        className="bg-zinc-900 w-full max-w-2xl rounded-t-[2.5rem] md:rounded-[3rem] p-8 md:p-12 overflow-y-auto max-h-[92vh] border-t md:border border-white/10" 
        onClick={e => e.stopPropagation()}
      >
        
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">New <span className="text-green-500">Entry</span></h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Search iTunes or add manually</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        {/* WYSZUKIWARKA */}
        <div className="relative mb-10">
          <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5 focus-within:border-green-500/50 transition-all h-14">
            <div className="pl-4 text-zinc-500 shrink-0">
              <Search size={18} />
            </div>
            <input 
              className="flex-1 bg-transparent px-2 h-full outline-none text-sm font-bold placeholder:text-zinc-600 min-w-0" 
              placeholder="Search database..." 
              value={query} 
              onChange={e => setQuery(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), search())} 
            />
            <button 
              type="button" 
              onClick={search} 
              className="shrink-0 h-full px-6 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-green-500 active:scale-95 transition-all"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : 'Find'}
            </button>
          </div>
          
          {results.length > 0 && (
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden z-50 shadow-2xl">
              {results.map(r => (
                <button 
                  key={r.collectionId} 
                  type="button" 
                  onClick={() => handleSelect(r)} 
                  className="w-full p-4 flex items-center gap-4 hover:bg-white/5 border-b border-white/5 last:border-0 text-left transition-colors"
                >
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

        {/* FORMULARZ */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col md:flex-row gap-8">
            {/* UPLOAD OKŁADKI */}
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full md:w-48 aspect-square bg-zinc-800 rounded-[2rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative group shrink-0"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <PlusCircle className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <ImageIcon className="text-zinc-700 mx-auto mb-2" size={32} />
                  <p className="text-[9px] font-black uppercase text-zinc-600">Manual Cover</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={e => { 
                  if(e.target.files?.[0]) { 
                    setImageFile(e.target.files[0]); 
                    setImagePreview(URL.createObjectURL(e.target.files[0])); 
                  }
                }} 
              />
            </div>

            {/* ARTIST & TITLE */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Artist Name</label>
                <input 
                  required 
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50 transition-colors" 
                  placeholder="e.g. Tame Impala" 
                  value={form.artist} 
                  onChange={e => setForm({...form, artist: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Album Title</label>
                <input 
                  required 
                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50 transition-colors" 
                  placeholder="e.g. Currents" 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})} 
                />
              </div>
            </div>
          </div>

          {/* YEAR & GENRE */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Release Year</label>
                <input 
                  type="number" 
                  className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-white/10" 
                  value={form.year} 
                  onChange={e => setForm({...form, year: parseInt(e.target.value)})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Genre</label>
                <input 
                  className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none border border-transparent focus:border-white/10" 
                  placeholder="Synth-pop, Rap..." 
                  value={form.genre} 
                  onChange={e => setForm({...form, genre: e.target.value})} 
                />
              </div>
          </div>

          {/* FORMAT & STATUS */}
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Audio Format</label>
              <select 
                className="w-full bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase outline-none cursor-pointer border border-transparent focus:border-white/10" 
                value={form.format} 
                onChange={e => setForm({...form, format: e.target.value as any})}
              >
                <option value="FLAC">FLAC</option>
                <option value="CD">CD</option>
                <option value="MP3">MP3</option>
                <option value="Hi-Res">Hi-Res</option>
                <option value="-">-</option>
              </select>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Collection Status</label>
              <select 
                className={`w-full bg-zinc-800 rounded-xl px-4 py-4 text-[11px] font-black uppercase outline-none cursor-pointer border border-transparent focus:border-white/10 ${form.status === 'MAM' ? 'text-green-500' : 'text-orange-500'}`} 
                value={form.status} 
                onChange={e => setForm({...form, status: e.target.value as any})}
              >
                <option value="MAM">Owned</option>
                <option value="SZUKAM">Wishlist</option>
              </select>
            </div>
          </div>

          {/* SUBMIT */}
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full py-5 bg-green-500 text-black rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-white active:scale-[0.98] transition-all shadow-xl shadow-green-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Save to Cloud'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};
