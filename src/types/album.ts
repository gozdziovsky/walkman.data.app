export interface Album {
  id: string;
  created_at?: string;
  artist: string;
  title: string;
  coverUrl: string; // To pole musi mieć duże 'U', bo tak daliśmy w cudzysłowie w SQL
  genre?: string;
  year?: number;
  format: 'FLAC' | 'MP3' | 'Hi-Res' | 'CD' | '-';
  status: 'MAM' | 'SZUKAM';
  rating?: number;
  spotify_url?: string;
  youtube_url?: string;
  tracks?: string;
  notes?: string;
}
