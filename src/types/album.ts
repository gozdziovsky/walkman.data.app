export interface Album {
  id: string;
  created_at?: string;
  artist: string;
  title: string;
  coverUrl: string;
  format: string;
  status: 'OWNED' | 'WANTED';
  year?: number;
  genre?: string;
  rating?: number;
  spotify_url?: string;
  youtube_url?: string;
  tracks?: string;
  // Pola opcjonalne dla konkretnych archiwów
  barcode?: string;
  record_condition?: string;
  weight?: string;
}