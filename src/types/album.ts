export interface Album {
  id: string;
  artist: string;
  title: string;
  coverUrl: string;
  format: 'FLAC' | 'MP3' | 'Hi-Res' | 'CD' | '-';
  status: 'MAM' | 'SZUKAM';
  tracks?: string;
  notes?: string;
}