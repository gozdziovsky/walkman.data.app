import { motion } from 'framer-motion';
import { X, LayoutGrid, Zap, BookmarkCheck, Disc, ArrowUpDown } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  cols: number;
  setCols: (cols: number) => void;
  defaultFormat: string;
  setDefaultFormat: (f: string) => void;
  defaultStatus: string;
  setDefaultStatus: (s: string) => void;
  defaultSort: string;
  setDefaultSort: (s: any) => void;
}

export const SettingsModal = ({ 
  onClose, cols, setCols, 
  defaultFormat, setDefaultFormat,
  defaultStatus, setDefaultStatus,
  defaultSort, setDefaultSort 
}: SettingsModalProps) => {

  // Funkcja pomocnicza do zapisu
  const updateDefault = (key: string, value: string, setter: (v: string) => void) => {
    localStorage.setItem(key, value);
    setter(value);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-zinc-900 w-full max-w-md rounded-[3rem] p-8 border border-white/10 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter leading-none">System <span className="text-green-500">Config</span></h3>
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-2">Personalize your experience</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </header>

        <div className="space-y-10">
          {/* SIATKA */}
          <section>
            <Label icon={<LayoutGrid size={12} />} title="Default Viewport" />
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => { localStorage.setItem('walkman_cols', num.toString()); setCols(num); }}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${cols === num ? 'bg-white text-black' : 'text-zinc-600 hover:text-white'}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          <hr className="border-white/5" />

          {/* STARTUP DEFAULTS */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Zap size={14} fill="currentColor" /></div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.2em]">Startup Defaults</h4>
            </div>

            {/* DEFAULT STATUS */}
            <section>
              <Label icon={<BookmarkCheck size={12} />} title="Default Status" />
              <div className="grid grid-cols-3 gap-2">
                {['ALL', 'MAM', 'SZUKAM'].map(s => (
                  <button 
                    key={s}
                    onClick={() => updateDefault('walkman_default_status', s, setDefaultStatus)}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${defaultStatus === s ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-zinc-600'}`}
                  >
                    {s === 'SZUKAM' ? 'WISH' : s}
                  </button>
                ))}
              </div>
            </section>

            {/* DEFAULT FORMAT */}
            <section>
              <Label icon={<Disc size={12} />} title="Default Format" />
              <div className="grid grid-cols-4 gap-2">
                {['ALL', 'FLAC', 'MP3', 'Hi-Res'].map(f => (
                  <button 
                    key={f}
                    onClick={() => updateDefault('walkman_default_format', f, setDefaultFormat)}
                    className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${defaultFormat === f ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-zinc-600'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </section>

            {/* DEFAULT SORT */}
            <section>
              <Label icon={<ArrowUpDown size={12} />} title="Default Sort Order" />
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'recent', label: 'RECENT' },
                  { id: 'artist', label: 'ARTIST A-Z' },
                  { id: 'album', label: 'ALBUM A-Z' },
                  { id: 'year', label: 'YEAR' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => updateDefault('walkman_default_sort', opt.id, setDefaultSort)}
                    className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all ${defaultSort === opt.id ? 'border-green-500 text-green-500 bg-green-500/5' : 'border-white/5 text-zinc-600'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <footer className="pt-6 border-t border-white/5">
            <p className="text-[8px] text-zinc-700 text-center uppercase tracking-[0.3em] font-bold">
              All settings synced to local storage
            </p>
          </footer>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Mały pomocnik dla czystszego kodu
const Label = ({ icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-4 text-zinc-600">
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{title}</span>
  </div>
);
