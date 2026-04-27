export interface Album {
  id: string;
  artist: string;
  title: string;
  coverUrl: string;
  format: 'FLAC' | 'MP3' | 'Hi-Res' | 'CD' | '-';
  status: 'MAM' | 'SZUKAM';
  year?: number;      // Opcjonalne, bo stare rekordy mogą go nie mieć
  genre?: string;     // Opcjonalne
  rating?: number;    // Opcjonalne
  label?: string;     // Opcjonalne
  created_at?: string; // Pole z Supabase
  tracks?: string;
  notes?: string;
}
