export interface Album {
  id: string;
  artist: string;
  title: string;
  coverUrl: string;
  format: 'FLAC' | 'MP3' | 'Hi-Res' | 'CD' | '-';
  status: 'MAM' | 'SZUKAM';
  year?: number;
  genre?: string;
  rating?: number;
  label?: string;
  created_at?: string;
  tracks?: string;
  notes?: string;
}
