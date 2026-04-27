import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, MonitorPlay, Trash2, Edit3, Save, ImageIcon, Search, Loader2, Calendar, Music, ListMusic } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Album } from '../types/album';

interface DetailsModalProps {
  album: Album;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

export const DetailsModal = ({ album, onClose, onUpdateSuccess }: DetailsModalProps) => {
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  
  // Stan formularza
  const [form, setForm] = useState<Album>({ ...album });
  const [imagePreview, setImagePreview] = useState<string | null>(album.coverUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Szukanie nowej okładki w iTunes
  const handleSearchCover = async () => {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=4`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally { setSearching(false); }
  };

  const handleSelectNewCover = (item: any) => {
    const img = item.artworkUrl100.replace('100x100', '800x800');
    setForm({ ...form, coverUrl: img });
    setImagePreview(img);
    setImageFile(null);
    setResults([]);
  };

  // Zapisywanie zmian
  const handleUpdate = async () => {
    setLoading(true);
    try {
      let finalUrl = form.coverUrl;

      // Jeśli użytkownik wybrał nowy plik z dysku
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

      const { error } = await supabase
        .from('albums')
        .update({ ...form, coverUrl: finalUrl })
        .eq('id', album.id);

      if (error) throw error;
      
      onUpdateSuccess();
      setIsEdit(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Usunąć "${album.title}" z kolekcji?`)) {
      await supabase.from('albums').delete().eq('id', album.id);
      onUpdateSuccess();
      onClose();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6" 
      onClick={onClose}
    >
      <motion.div 
        layout 
        className="bg-zinc-900 w-full max-w-5xl rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden border-t border-white/10 flex flex-col md:flex-row max-h-[95vh] shadow-2xl" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* LEWA STRONA: OKŁADKA */}
        <div className="w-full md:w-1/2 aspect-square relative bg-zinc-800 shrink-0">
          <img 
            src={imagePreview || album.coverUrl} 
            className={`w-full h-full object-cover transition-all duration-500 ${isEdit ? 'opacity-40 scale-105 blur-sm' : 'opacity-100'}`} 
            alt="" 
          />
          
          {/* Nakładka edycji okładki */}
          <AnimatePresence>
            {isEdit && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-6"
              >
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-2xl active:scale-95 transition-transform"
                >
                  <ImageIcon size={16} /> Upload New File
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => {
                  if(e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
                
                <div className="w-full max-w-xs space-y-2">
                  <div className="flex gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <input 
                      className="bg-transparent flex-1 pl-3 text-xs font-bold outline-none placeholder:text-zinc-600" 
                      placeholder="Or search iTunes..." 
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearchCover()}
                    />
                    <button onClick={handleSearchCover} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
                      {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                  </div>
                  
                  {results.length > 0 && (
                    <div className="bg-zinc-800 rounded-2xl border border-white/10 overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                      {results.map(r => (
                        <button key={r.collectionId} onClick={() => handleSelectNewCover(r)} className="w-full p-3 flex items-center gap-3 hover:bg-white/5 border-b border-white/5 text-left transition-colors">
                          <img src={r.artworkUrl60} className="w-10 h-10 rounded-lg" alt="" />
                          <div className="truncate">
                            <p className="text-[10px] font-black uppercase truncate text-white">{r.collectionName}</p>
                            <p className="text-[8px] font-bold text-zinc-500 uppercase">{r.artistName}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Przyciski funkcyjne na okładce */}
          {!isEdit && (
            <div className="absolute top-6 left-6 flex gap-3">
              <button onClick={() => setIsEdit(true)} className="p-4 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all active:scale-90 shadow-xl">
                <Edit3 size={20} />
              </button>
              <button onClick={handleDelete} className="p-4 bg-red-500/20 backdrop-blur-xl rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all active:scale-90 shadow-xl">
                <Trash2 size={20} />
              </button>
            </div>
          )}
          <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-black/40 backdrop-blur-xl rounded-full text-white active:scale-90">
            <X size={20} />
          </button>
        </div>

        {/* PRAWA STRONA: DANE */}
        <div className="p-8 md:p-12 flex-1 overflow-y-auto no-scrollbar bg-zinc-900">
          <AnimatePresence mode="wait">
            {isEdit ? (
              <motion.div 
                key="edit"
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-black uppercase italic text-green-500 tracking-tighter">Edit Record</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Artist</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" value={form.artist} onChange={e => setForm({...form, artist: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Title</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-green-500/50" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Year</label>
                    <input type="number" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Genre</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none" value={form.genre} onChange={e => setForm({...form, genre: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Format</label>
                    <select className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none" value={form.format} onChange={e => setForm({...form, format: e.target.value as any})}>
                      <option value="FLAC">FLAC</option><option value="CD">CD</option><option value="MP3">MP3</option><option value="Hi-Res">Hi-Res</option><option value="-">-</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Status</label>
                    <select className="w-full bg-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                      <option value="MAM">Owned</option><option value="SZUKAM">Wishlist</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">Tracklist / Notes</label>
                  <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold min-h-[120px] outline-none focus:border-green-500/50" 
                    value={form.tracks} 
                    onChange={e => setForm({...form, tracks: e.target.value})} 
                    placeholder="1. Track One&#10;2. Track Two..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setIsEdit(false)} className="flex-1 py-4 bg-zinc-800 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Cancel</button>
                  <button onClick={handleUpdate} disabled={loading} className="flex-[2] py-4 bg-green-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-500/10">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={16} />} Save Changes
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="view"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div>
                  <p className="text-green-500 font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic italic leading-none">
                    {album.artist}
                  </p>
                  <h2 className="text-4xl md:text-6xl font-black uppercase leading-[0.85] tracking-tighter italic italic mb-8">
                    {album.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Calendar size={14} className="text-green-500" /> {album.year}
                    </div>
                    <div className="px-4 py-2 bg-zinc-800 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                      <Music size={14} className="text-green-500" /> {album.genre}
                    </div>
                    <div className="px-4 py-2 bg-zinc-800 border border-green-500/20 rounded-full text-[10px] font-black uppercase text-green-500">
                      {album.format}
                    </div>
                  </div>
                </div>

                {/* TRACKLISTA */}
                {album.tracks && (
                  <div className="pt-8 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4 text-zinc-500">
                      <ListMusic size={14} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Tracklist</h4>
                    </div>
                    <div className="bg-black/20 rounded-3xl p-6 border border-white/5">
                      <pre className="text-[11px] font-mono text-zinc-400 whitespace-pre-wrap leading-relaxed">
                        {album.tracks}
                      </pre>
                    </div>
                  </div>
                )}

                {/* LINKI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                  <button 
                    onClick={() => album.spotify_url && window.open(album.spotify_url, '_blank')} 
                    className="py-5 bg-white text-black rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-green-500 transition-colors shadow-xl"
                  >
                    <Play size={18} fill="black" /> Spotify
                  </button>
                  <button 
                    onClick={() => album.youtube_url && window.open(album.youtube_url, '_blank')} 
                    className="py-5 bg-zinc-800 text-white rounded-[1.8rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3"
                  >
                    <MonitorPlay size={18} /> YouTube
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
