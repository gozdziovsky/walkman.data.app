import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck, X, Image as ImageIcon, Loader2, Search, ListMusic } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

export const DigitalAddModal = ({ onClose, onSuccess, searchSource = 'itunes', discogsToken }: any) => {
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [localSource, setLocalSource] = useState<'itunes' | 'discogs'>(searchSource);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    artist: '', title: '', coverUrl: '', genre: '',
    year: new Date().getFullYear(), format: 'FLAC', 
    status: 'OWNED' as 'OWNED' | 'WANTED', rating: 0, 
    spotify_url: '', youtube_url: '', tracks: ''
  });

  const search = async () => {
    if (!query) return;
    setSearching(true);
    try {
      if (localSource === 'itunes') {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=15&country=PL`);
        const data = await res.json();
        setResults(data.results.map((r: any) => ({
          collectionId: r.collectionId, title: r.collectionName, artist: r.artistName,
          coverUrl: r.artworkUrl100.replace('100x100', '800x800'),
          year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : '', genre: r.primaryGenreName
        })));
      } else {
        if (!discogsToken) { alert("Missing Discogs token in settings!"); return; }
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
    setSearching(true);
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
    setSearching(false);
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
      onSuccess(); onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-zinc-900 w-full max-w-3xl rounded-t-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 overflow-y-auto max-h-[95vh] border-t border-white/10 shadow-2xl no-scrollbar relative transform-gpu will-change-transform" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-10 text-white">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Add <span className="text-brand">Digital</span></h2>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        <section className="mb-10 space-y-4">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 w-fit ml-auto mb-2">
            <button type="button" onClick={() => setLocalSource('itunes')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${localSource === 'itunes' ? 'bg-white text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>iTunes</button>
            <button type="button" onClick={() => setLocalSource('discogs')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${localSource === 'discogs' ? 'bg-brand text-black shadow-lg' : 'text-zinc-600 hover:text-white'}`}>Discogs</button>
          </div>
          <div className="flex items-stretch bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand/50 h-16 shadow-inner">
            <div className="flex items-center justify-center pl-6 text-zinc-600"><Search size={20} /></div>
            <input className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-white placeholder:text-zinc-700" placeholder="Search album..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
            <button onClick={search} className="px-8 bg-white hover:bg-brand text-black font-black uppercase text-[11px] tracking-widest transition-colors">{searching ? <Loader2 size={18} className="animate-spin" /> : 'Search'}</button>
          </div>
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
                {results.map((r, i) => (
                  <button key={i} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-brand/10 text-left border-b border-white/5 last:border-0 transition-colors group">
                    <img src={r.coverUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div className="truncate">
                      <p className="text-xs font-black uppercase group-hover:text-brand transition-colors truncate">{r.title}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold truncate">{r.artist}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-full md:w-52 aspect-square bg-zinc-950 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-brand/30 transition-colors shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-zinc-800 group-hover:text-brand/30 transition-colors" size={40} />}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
            </div>
            <div className="flex-1 space-y-5">
              <FormInput label="Artist" value={form.artist} onChange={v => setForm({...form, artist: v})} />
              <FormInput label="Album Title" value={form.title} onChange={v => setForm({...form, title: v})} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <FormInput label="Year" type="number" value={form.year} onChange={v => setForm({...form, year: parseInt(v)})} />
            <FormInput label="Format" value={form.format} onChange={v => setForm({...form, format: v})} />
            <FormInput label="Rating" type="number" value={form.rating} onChange={v => setForm({...form, rating: parseInt(v)})} />
          </div>

          {/* DODANY SWITCH STATUSU */}
          <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 flex items-center gap-2">
              <BookmarkCheck size={12}/> Library Status
            </label>
            <div className="flex gap-2 p-1.5 bg-zinc-950 border border-white/5 rounded-2xl shadow-inner">
              <button 
                type="button" 
                onClick={() => setForm({...form, status: 'OWNED'})} 
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'OWNED' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600 hover:text-white'}`}
              >
                Owned
              </button>
              <button 
                type="button" 
                onClick={() => setForm({...form, status: 'WANTED'})} 
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'WANTED' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-zinc-600 hover:text-white'}`}
              >
                Wanted
              </button>
            </div>
          </div>

          <div className="space-y-2 text-left">
             <label className="text-[9px] font-black uppercase text-zinc-600 ml-1 flex items-center gap-2"><ListMusic size={12}/> Tracklist</label>
             <textarea className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-xs font-mono text-zinc-400 h-40 resize-none outline-none focus:border-brand/50 no-scrollbar" placeholder="Paste tracks here..." value={form.tracks} onChange={e => setForm({...form, tracks: e.target.value})} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white active:scale-95 transition-all shadow-2xl">Archive Record</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const FormInput = ({ label, value, onChange, type = "text" }: any) => (
  <div className="space-y-1 text-left">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);