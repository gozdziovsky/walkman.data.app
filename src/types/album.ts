export interface Album {
  id: string;
  artist: string;
  title: string;
  "coverUrl": string; // Nazwa w cudzysłowie pasuje do SQL
  format: 'FLAC' | 'MP3' | 'Hi-Res' | 'CD' | '-';
  status: 'MAM' | 'SZUKAM';
  year?: number;
  genre?: string;
  rating?: number;
  spotify_url?: string;
  youtube_url?: string;
  tracks?: string;
}
