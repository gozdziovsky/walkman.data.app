import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DigitalArchive from './pages/DigitalArchive';
import VinylArchive from './pages/VinylArchive';
import CDArchive from './pages/CDArchive';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="w-full bg-[#09090b] py-4 flex items-center justify-center border-b border-white/5 z-[200]">
        <div className="flex gap-2 px-4 w-full max-w-md justify-center">
          <ArchiveLink to="/digital" label="Digital" />
          <ArchiveLink to="/vinyl" label="Vinyl" />
          <ArchiveLink to="/cd" label="CD" />
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/digital" replace />} />
        <Route path="/digital" element={<DigitalArchive />} />
        <Route path="/vinyl" element={<VinylArchive />} />
        <Route path="/cd" element={<CDArchive />} />
      </Routes>
    </BrowserRouter>
  );
}

const ArchiveLink = ({ to, label }: { to: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      text-[10px] font-black uppercase tracking-[0.2em] 
      py-2 px-2 rounded-full border flex-1 text-center
      
      /* Klucz do płynności: precyzyjne przejście i zdefiniowane stany bazowe */
      transition-all duration-500 ease-out
      
      ${isActive 
        ? 'text-brand border-brand/40 bg-brand/10 shadow-[0_0_25px_rgba(var(--brand-rgb),0.15)]' 
        : 'text-zinc-600 border-white/0 bg-transparent shadow-[0_0_25px_rgba(0,0,0,0)] hover:text-zinc-400'}
    `}
  >
    {label}
  </NavLink>
);