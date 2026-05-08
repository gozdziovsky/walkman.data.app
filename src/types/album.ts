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
 
  // Vinyl-specific
  variant?: string;
  label?: string;
  matrix_number?: string;
  condition_media?: string;
  condition_sleeve?: string;
  notes?: string;
 
  // Legacy (do usunięcia po migracji Supabase)
  barcode?: string;
  record_condition?: string;
  weight?: string;
}
 