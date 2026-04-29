import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DigitalArchive from './pages/DigitalArchive';
import VinylArchive from './pages/VinylArchive';
import CDArchive from './pages/CDArchive';

function App() {
  return (
    <BrowserRouter>
      {/* Proste menu nawigacyjne na górze lub dole */}
      <nav className="fixed top-0 left-0 right-0 h-12 bg-black/50 backdrop-blur-md z-[200] flex items-center justify-center gap-8 border-b border-white/5">
        <Link to="/digital" className="text-[10px] font-black uppercase tracking-widest hover:text-brand transition-colors">Digital</Link>
        <Link to="/vinyl" className="text-[10px] font-black uppercase tracking-widest hover:text-brand transition-colors">Vinyl</Link>
        <Link to="/cd" className="text-[10px] font-black uppercase tracking-widest hover:text-brand transition-colors">CD</Link>
      </nav>

      <Routes>
        <Route path="/digital" element={<DigitalArchive />} />
        <Route path="/vinyl" element={<VinylArchive />} />
        <Route path="/cd" element={<CDArchive />} />
        <Route path="/" element={<DigitalArchive />} /> {/* Domyślny widok */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;