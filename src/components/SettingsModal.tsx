import { motion } from 'framer-motion';
import { X, LayoutGrid, Layers } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  cols: number;
  setCols: (cols: number) => void;
}

export const SettingsModal = ({ onClose, cols, setCols }: SettingsModalProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 w-full max-w-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black uppercase italic tracking-tighter">Settings</h3>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-500"><X size={20} /></button>
        </header>

        <div className="space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-4 text-zinc-500">
              <LayoutGrid size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Grid Columns</span>
            </div>
            
            <div className="grid grid-cols-4 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
              {[1, 2, 3, 4].map((num) => (
                <button
                  key={num}
                  onClick={() => setCols(num)}
                  className={`py-3 rounded-xl text-xs font-black transition-all ${
                    cols === num ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600 mt-3 text-center uppercase font-bold tracking-widest">
              Current view: {cols} {cols === 1 ? 'Column' : 'Columns'}
            </p>
          </section>

          <section className="pt-4 border-t border-white/5">
            <p className="text-[8px] text-zinc-700 text-center uppercase tracking-widest">
              Walkman Cloud v4.2.0 • 2026 Edition
            </p>
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};
