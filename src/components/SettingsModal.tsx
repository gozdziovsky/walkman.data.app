// src/components/SettingsModal.tsx
export const SettingsModal = ({ onClose, cols, setCols }: any) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6">
    <div onClick={e => e.stopPropagation()} className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-10 text-white">Global <span className="text-brand">Settings</span></h2>
      
      <div className="space-y-8">
        <section>
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block mb-4">Grid Columns (Mobile)</label>
          <div className="flex gap-4">
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => setCols(n)} className={`flex-1 py-4 rounded-xl font-mono font-bold transition-all ${cols === n ? 'bg-brand text-black shadow-lg shadow-brand/20' : 'bg-zinc-800 text-zinc-500'}`}>{n}</button>
            ))}
          </div>
        </section>

        {/* Tutaj dojdzie Token Discogs i inne globalne rzeczy */}
      </div>

      <button onClick={onClose} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest mt-12 active:scale-95 transition-transform">Save & Close</button>
    </div>
  </motion.div>
);