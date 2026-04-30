-- Tabela albumów
create table public.albums (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  artist text not null,
  title text not null,
  coverUrl text,
  genre text,
  year integer,
  format text default 'FLAC',
  status text default 'OWNED',
  rating integer default 0,
  spotify_url text,
  youtube_url text,
  tracks text
);

-- Tabela okładek (Storage)
-- Uwaga: Musisz ręcznie stworzyć bucket 'album-covers' w Supabase Storage i ustawić go jako publiczny.

-- Włączenie Row Level Security (RLS)
alter table public.albums enable row level security;

-- Polityka odczytu dla każdego
create policy "Allow public read access" on public.albums
  for select using (true);

-- Polityka zapisu (Tylko dla Ciebie - po wdrożeniu logowania Auth)
-- Na start dla Open Source możesz zostawić tak (pozwala każdemu na wszystko):
create policy "Enable all access for all users" on public.albums
  for all using (true) with check (true);