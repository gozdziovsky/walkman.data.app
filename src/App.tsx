import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import DigitalArchive from './pages/DigitalArchive';
import { VinylArchive } from './pages/VinylArchive'; // <-- DODANY IMPORT

// Zostawiamy zablokowane CD, wrócimy do tego w Fazie 4
const CDArchive = () => <div className="pt-40 text-center text-zinc-800 font-black uppercase tracking-[1em] text-sm animate-pulse italic">Compact Disc Locked</div>;

export default function App() {
  const [showNav, setShowNav] = useState(() => localStorage.getItem('show_nav') !== 'false');
  const [defaultArchive, setDefaultArchive] = useState(() => localStorage.getItem('default_archive') || 'digital');

  useEffect(() => {
    const handleSync = () => {
      setShowNav(localStorage.getItem('show_nav') !== 'false');
      setDefaultArchive(localStorage.getItem('default_archive') || 'digital');
    };
    window.addEventListener('storage_update', handleSync);
    return () => window.removeEventListener('storage_update', handleSync);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#09090b] text-white selection:bg-brand selection:text-black">
        {showNav && (
          <nav className="w-full bg-[#09090b] py-4 flex items-center justify-center border-b border-white/5 z-[200]">
            <div className="flex gap-2 px-4 w-full max-w-md justify-center">
              <ArchiveLink to="/digital" label="Digital" />
              <ArchiveLink to="/vinyl" label="Vinyl" />
              <ArchiveLink to="/cd" label="CD" />
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<Navigate to={`/${defaultArchive}`} replace />} />
          <Route path="/digital" element={<DigitalArchive />} />
          <Route path="/vinyl" element={<VinylArchive />} /> {/* <-- ODBLOKOWANY ROUTE */}
          <Route path="/cd" element={<CDArchive />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

const ArchiveLink = ({ to, label }: { to: string, label: string }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `
      text-[10px] font-black uppercase tracking-[0.2em] 
      py-2.5 px-2 rounded-full border flex-1 text-center
      transition-all duration-500 ease-out
      ${isActive 
        ? 'text-brand border-zinc-800 bg-zinc-800/50 shadow-[0_0_30px_rgba(0,0,0,0.5)]' 
        : 'text-zinc-600 border-white/0 bg-transparent hover:text-zinc-400'}
    `}
  >
    {label}
  </NavLink>
);