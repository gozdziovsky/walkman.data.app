English
Walkman. is a high-end, responsive web application designed for audiophiles and music collectors to manage their physical and digital archives. Built with a focus on speed, aesthetics, and fluid UX, it handles large collections (400+ records) with ease.

✨ Key Features
Hybrid Interface: * Mobile-first: Manual column control (1-4) for perfect visibility on smartphones.

Desktop-optimized: Intelligent auto-fill grid that creates a beautiful "wall of sound" on large monitors.

Dual-Engine Search: Integrated with iTunes API (for clean digital metadata) and Discogs API (for precise physical pressings and tracklists).

Intelligent UI/UX:

Dynamic Typography: Automatically scales long titles (like Balloonerism) to prevent layout breaking.

Gesture-driven navigation: Swipe left/right for browsing, swipe up for tracklists, and swipe down to close.

Corner Ribbons: Minimalist status indicators (Owned/Wishlist) and tracklist presence.

Visual Excellence:

Dark & Normal Modes: From deep "Amoled" black to soft, matte macOS-style light mode.

On-the-fly Compression: Uses wsrv.nl and Apple CDN to load lightweight thumbnails in the grid, fetching high-res covers only when needed.

System Health: Real-time connection monitoring for Supabase and Discogs API.

🛠 Tech Stack
Frontend: React + Vite + TypeScript

Styling: Tailwind CSS (Custom brand colors)

Animations: Framer Motion (Spring-physics based)

Database: Supabase (PostgreSQL)

Icons: Lucide React

🚀 Getting Started
Clone the repository

Install dependencies: npm install

Setup Environment Variables:
Create a .env file and add your credentials:

Fragment kodu
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
Database Schema:
Ensure your albums table has the following fields: title, artist, coverUrl, year, genre, format, status, tracks, rating, spotify_url, youtube_url.

Run Dev: npm run dev

🌍 Deployment
The app is optimized for Vercel. Simply connect your GitHub repo, add your environment variables in the Vercel dashboard, and deploy.

Polski
Walkman. to zaawansowana aplikacja webowa stworzona dla audiofili i kolekcjonerów muzyki, służąca do zarządzania fizycznymi i cyfrowymi archiwami. Skupiona na szybkości, estetyce i płynnym UX, z łatwością obsługuje duże kolekcje (ponad 400 albumów).

✨ Kluczowe Funkcje
Hybrydowy Interfejs: * Mobile-first: Ręczna kontrola kolumn (1-4) dla idealnej widoczności na smartfonie.

Desktop-optimized: Inteligentny grid "auto-fill", tworzący piękną ścianę okładek na dużych monitorach.

Podwójny Silnik Wyszukiwania: Integracja z iTunes API (czyste metadane cyfrowe) oraz Discogs API (precyzyjne wydania fizyczne i tracklisty).

Inteligentny UI/UX:

Dynamiczna Typografia: Automatyczne skalowanie długich tytułów, aby zapobiec rozjeżdżaniu się interfejsu.

Nawigacja Gestami: Swipe lewo/prawo (następny/poprzedni), swipe w górę (tracklista), swipe w dół (zamknij).

Corner Ribbons: Minimalistyczne oznaczenia statusu (MAM/SZUKAM) oraz obecności listy utworów.

Perfekcja Wizualna:

Tryby Dark & Normal: Od głębokiej czerni "Amoled" po miękki, matowy tryb jasny w stylu macOS.

Kompresja w locie: Wykorzystanie wsrv.nl i Apple CDN do ładowania lekkich miniaturek, pobierając pełną rozdzielczość tylko w podglądzie.

System Health: Monitorowanie połączenia z bazą Supabase i API Discogs w czasie rzeczywistym.

🛠 Stos Technologiczny
Frontend: React + Vite + TypeScript

Styling: Tailwind CSS (Custom brand colors)

Animacje: Framer Motion

Baza Danych: Supabase (PostgreSQL)

Ikony: Lucide React

🚀 Jak zacząć?
Sklonuj repozytorium

Zainstaluj zależności: npm install

Ustaw zmienne środowiskowe:
Stwórz plik .env i dodaj swoje klucze:

Fragment kodu
VITE_SUPABASE_URL=twoj_url_supabase
VITE_SUPABASE_ANON_KEY=twoj_klucz_anon_supabase
Baza danych:
Upewnij się, że tabela albums zawiera pola: title, artist, coverUrl, year, genre, format, status, tracks, rating, spotify_url, youtube_url.

Uruchom: npm run dev

🌍 Deployment
Aplikacja jest zoptymalizowana pod platformę Vercel. Połącz repozytorium GitHub, dodaj zmienne środowiskowe w panelu Vercel i gotowe.

Created with ❤️ for Music Collectors.
