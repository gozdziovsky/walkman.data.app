import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Palette, Cloud } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  appName: string;
  onSave: (newName: string) => void;
}

export const SettingsModal = ({ onClose, appName, onSave }: SettingsModalProps) => {
  const [tempName, setTempName] = useState(appName);

  const handleSave = () => {
    onSave(tempName);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Cloud className="text-green-500" size={24} /> Settings
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500"><X size={20} /></button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Cloud Name</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-colors text-white font-bold" 
              value={tempName}
              onChange={e => setTempName(e.target.value)}
              placeholder="e.g. My Vinyls"
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-4 opacity-50 cursor-not-allowed">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                <Palette size={12} /> Accent Color
              </span>
              <div className="w-4 h-4 bg-green-500 rounded-full" />
            </div>
            <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">More customization coming soon</p>
          </div>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest mt-4 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Settings
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};