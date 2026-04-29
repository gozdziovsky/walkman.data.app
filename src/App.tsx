import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import DigitalArchive from './pages/DigitalArchive';
import VinylArchive from './pages/VinylArchive';
import CDArchive from './pages/CDArchive';

export default function App() {
  return (
    <BrowserRouter>
      {/* Pasek nawigacji - precyzyjne centrowanie */}
      <nav className="w-full bg-[#09090b] py-4 flex items-center justify-center border-b border-white/5 z-[200]">
        <div className="flex gap-2 px-4 w-full max-w-md justify-center">
          <ArchiveLink to="/digital" label="Digital" />
          <ArchiveLink to="/vinyl" label="Vinyl" />
          <ArchiveLink to="/cd" label="CD" />
        </div>
      </nav>

      <Routes>
        <Route path="/digital" element={<DigitalArchive />} />
        <Route path="/vinyl" element={<VinylArchive />} />
        <Route path="/cd" element={<CDArchive />} />
        <Route path="/" element={<DigitalArchive />} />
      </Routes>
    </BrowserRouter>
  );
}

const ArchiveLink = ({ to, label }: { to: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      text-[10px] font-black uppercase tracking-[0.2em] transition-all 
      py-2 px-2 rounded-full border flex-1 text-center
      ${isActive 
        ? 'text-brand border-brand/40 bg-brand/5 shadow-[0_0_20px_rgba(var(--brand-rgb),0.1)]' 
        : 'text-zinc-600 border-transparent hover:text-zinc-400'}
    `}
  >
    {/* Label bez jednostronnego paddingu dla idealnego środka */}
    {label}
  </NavLink>
);