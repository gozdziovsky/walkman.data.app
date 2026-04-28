

readme_content = """# 🎧 Walkman Buddy. - Digital Audio Archive

---

<a name="english"></a>
## English

**Walkman.** is a high-end, responsive web application designed for audiophiles and music collectors to manage their physical and digital archives. Built with a focus on speed, aesthetics, and fluid UX, it handles large collections (400+ records) with ease.

### ✨ Key Features
* **Hybrid Interface:**
    * **Mobile-first:** Manual column control (1-4) for perfect visibility on smartphones.
    * **Desktop-optimized:** Intelligent auto-fill grid that creates a beautiful "wall of sound" on large monitors.
* **Dual-Engine Search:** Integrated with **iTunes API** (for clean digital metadata) and **Discogs API** (for precise physical pressings and tracklists).
* **Intelligent UI/UX:**
    * **Dynamic Typography:** Automatically scales long titles (like *Balloonerism*) to prevent layout breaking.
    * **Gesture-driven navigation:** Swipe left/right for browsing, swipe up for tracklists, and swipe down to close.
    * **Corner Ribbons:** Minimalist status indicators (Owned/Wishlist) and tracklist presence.
* **Visual Excellence:**
    * **Dark & Normal Modes:** From deep "Amoled" black to soft, matte macOS-style light mode.
    * **On-the-fly Compression:** Uses `wsrv.nl` and Apple CDN to load lightweight thumbnails in the grid, fetching high-res covers only when needed.
* **System Health:** Real-time connection monitoring for Supabase and Discogs API.

### 🛠 Tech Stack
* **Frontend:** React + Vite + TypeScript
* **Styling:** Tailwind CSS (Custom brand colors)
* **Animations:** Framer Motion (Spring-physics based)
* **Database:** Supabase (PostgreSQL)
* **Icons:** Lucide React

### 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies:** `npm install`
3. **Setup Environment Variables:**
   Create a `.env` file and add your credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
