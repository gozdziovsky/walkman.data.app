import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmarkCheck, X, Image as ImageIcon, Loader2, Search, ListMusic, Disc, FileText, Activity } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

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
    label: '', matrix_number: '', variant: '',
    condition_media: 'NM', condition_sleeve: 'NM',
    status: 'OWNED' as 'OWNED' | 'WANTED', rating: 0, 
    tracks: '', notes: ''
  });

  const searchDiscogs = async () => {
    if (!query) return;
    if (!discogsToken) { alert("Missing Discogs token in settings!"); return; }
    
    setSearching(true);
    try {
      // Szukamy wyłącznie wydań winylowych
      const res = await fetch(`https://api.discogs.com/database/search?q=${encodeURIComponent(query)}&type=release&format=vinyl&per_page=15&token=${discogsToken}`);
      const data = await res.json();
      setResults(data.results.map((r: any) => {
        const [artist, title] = r.title.includes(' - ') ? r.title.split(' - ') : ['Unknown', r.title];
        return { 
          title: title.trim(), 
          artist: artist.trim(), 
          coverUrl: r.cover_image, 
          year: r.year || '', 
          genre: r.genre?.[0] || '',
          label: r.label?.[0] || '',
          format: r.formats?.[0]?.name === 'Vinyl' ? (r.formats?.[0]?.descriptions?.includes('LP') ? '12" LP' : 'Vinyl') : '12" LP'
        };
      }));
    } catch (e) {
      console.error(e);
    } finally { 
      setSearching(false); 
    }
  };

  const handleSelect = (item: any) => {
    setForm({ 
      ...form, 
      artist: item.artist, 
      title: item.title, 
      coverUrl: item.coverUrl, 
      genre: item.genre, 
      year: parseInt(item.year) || form.year,
      label: item.label,
      format: item.format
    });
    setImagePreview(item.coverUrl);
    setResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;
      if (imageFile) {
        const path = `covers/vinyls/${Date.now()}-${imageFile.name}`;
        await supabase.storage.from('album-covers').upload(path, imageFile);
        const { data: { publicUrl } } = supabase.storage.from('album-covers').getPublicUrl(path);
        finalUrl = publicUrl;
      }
      
      // CHIRURGICZNE CIĘCIE: Oddzielamy coverUrl od reszty danych, 
      // by wysłać do bazy tylko to, co ona potrafi przyjąć (czyli cover_url)
      const { coverUrl, ...dataToInsert } = form;
      
      await supabase.from('vinyls').insert([{ ...dataToInsert, cover_url: finalUrl }]);
      
      onSuccess(); 
      onClose();
    } catch (err: any) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[140] bg-black/95 backdrop-blur-xl flex items-center justify-center p-0 md:p-6" onClick={onClose}>
      <motion.div 
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-zinc-900 w-full max-w-4xl rounded-t-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 overflow-y-auto max-h-[95vh] border-t border-white/10 shadow-2xl no-scrollbar relative transform-gpu will-change-transform" 
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-10 text-white">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Add <span className="text-brand">Vinyl</span></h2>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
        </header>

        {/* TYLKO DISCOGS SEARCH */}
        <section className="mb-10 space-y-4">
          <div className="flex items-stretch bg-zinc-950 border border-white/10 rounded-2xl overflow-hidden focus-within:border-brand/50 h-16 shadow-inner">
            <div className="flex items-center justify-center pl-6 text-zinc-600"><Search size={20} /></div>
            <input className="flex-1 bg-transparent px-4 outline-none text-sm font-bold text-white placeholder:text-zinc-700" placeholder="Search Discogs database..." value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchDiscogs()} />
            <button type="button" onClick={searchDiscogs} className="px-8 bg-brand text-black font-black uppercase text-[11px] tracking-widest transition-colors hover:bg-white">{searching ? <Loader2 size={18} className="animate-spin" /> : 'Discogs'}</button>
          </div>
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-800 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-60 overflow-y-auto no-scrollbar">
                {results.map((r, i) => (
                  <button type="button" key={i} onClick={() => handleSelect(r)} className="w-full p-4 flex items-center gap-4 hover:bg-brand/10 text-left border-b border-white/5 last:border-0 transition-colors group">
                    <img src={r.coverUrl} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <div className="truncate flex-1">
                      <p className="text-xs font-black uppercase group-hover:text-brand transition-colors truncate">{r.title}</p>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold truncate">{r.artist}</p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md">{r.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* BASE INFO */}
          <div className="flex flex-col md:flex-row gap-8">
            <div onClick={() => fileInputRef.current?.click()} className="w-full md:w-52 aspect-square bg-zinc-950 rounded-[2.5rem] border-2 border-dashed border-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-brand/30 transition-colors shrink-0">
              {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" alt="" /> : <ImageIcon className="text-zinc-800 group-hover:text-brand/30 transition-colors" size={40} />}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => { if(e.target.files?.[0]) { setImageFile(e.target.files[0]); setImagePreview(URL.createObjectURL(e.target.files[0])); } }} />
            </div>
            <div className="flex-1 space-y-5">
              <FormInput label="Artist" value={form.artist} onChange={(v:any) => setForm({...form, artist: v})} />
              <FormInput label="Album Title" value={form.title} onChange={(v:any) => setForm({...form, title: v})} />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Year" type="number" value={form.year} onChange={(v:any) => setForm({...form, year: parseInt(v)})} />
                <FormInput label="Genre" value={form.genre} onChange={(v:any) => setForm({...form, genre: v})} />
              </div>
            </div>
          </div>
          
          {/* PHYSICAL SPECS */}
          <section className="space-y-4 bg-zinc-950/50 p-6 md:p-8 rounded-[2rem] border border-white/5">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2 mb-2"><Disc size={14}/> Physical Specifications</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput label="Format (e.g., 12&quot; LP, 2xLP)" value={form.format} onChange={(v:any) => setForm({...form, format: v})} />
              <FormInput label="Variant / Color" placeholder="e.g., 180g Black, Red Translucent" value={form.variant} onChange={(v:any) => setForm({...form, variant: v})} />
              <FormInput label="Label / Pressing" placeholder="e.g., Blue Note, Sony Music" value={form.label} onChange={(v:any) => setForm({...form, label: v})} />
              <FormInput label="Matrix / Runout" placeholder="e.g., BL 12345-01" value={form.matrix_number} onChange={(v:any) => setForm({...form, matrix_number: v})} />
            </div>
          </section>

          {/* CONDITION & STATUS */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><Activity size={14}/> Grading</label>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Media" value={form.condition_media} onChange={(v:any) => setForm({...form, condition_media: v})} options={['M', 'NM', 'VG+', 'VG', 'G', 'P']} />
                <FormSelect label="Sleeve" value={form.condition_sleeve} onChange={(v:any) => setForm({...form, condition_sleeve: v})} options={['M', 'NM', 'VG+', 'VG', 'G', 'P', 'Generic']} />
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><BookmarkCheck size={14}/> Library Status</label>
              <div className="flex gap-2 p-1.5 bg-zinc-950 border border-white/5 rounded-2xl shadow-inner h-[60px]">
                <button type="button" onClick={() => setForm({...form, status: 'OWNED'})} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'OWNED' ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'text-zinc-600 hover:text-white'}`}>Owned</button>
                <button type="button" onClick={() => setForm({...form, status: 'WANTED'})} className={`flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${form.status === 'WANTED' ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'text-zinc-600 hover:text-white'}`}>Wanted</button>
              </div>
            </div>
          </section>

          {/* NOTES & TRACKS */}
          <section className="space-y-4">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] flex items-center gap-2"><FileText size={14}/> Notes & Tracklist</label>
            <textarea className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-sm font-medium text-zinc-300 h-24 resize-none outline-none focus:border-brand/50" placeholder="Collector's notes (e.g., bought in Tokyo, has obi strip...)" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
            <textarea className="w-full bg-zinc-950 border border-white/5 rounded-2xl p-5 text-xs font-mono text-zinc-400 h-32 resize-none outline-none focus:border-brand/50 no-scrollbar" placeholder="Paste tracklist here..." value={form.tracks} onChange={e => setForm({...form, tracks: e.target.value})} />
          </section>

          <button type="submit" disabled={loading} className="w-full py-6 bg-brand text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-white active:scale-95 transition-all shadow-2xl mt-4">
            {loading ? 'Archiving...' : 'Archive Physical Record'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

// MINI COMPONENTS
const FormInput = ({ label, value, onChange, type = "text", placeholder = "" }: any) => (
  <div className="space-y-1 text-left flex-1">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <input type={type} required className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all placeholder:text-zinc-800" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const FormSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-1 text-left flex-1 relative">
    <label className="text-[9px] font-black uppercase text-zinc-600 ml-1">{label}</label>
    <select className="w-full bg-zinc-950 border border-white/5 rounded-xl px-5 py-4 text-sm font-bold text-white outline-none focus:border-brand/50 transition-all appearance-none cursor-pointer" value={value} onChange={e => onChange(e.target.value)}>
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>)}
    </select>
  </div>
);