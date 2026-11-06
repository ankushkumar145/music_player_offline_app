# TuneFlow — Personal Offline Music Player

TuneFlow is a high-performance, personal, offline-first Progressive Web App (PWA) music player built with **React**, **Vite**, **Tailwind CSS**, the **HTML5 Audio API**, and **IndexedDB**.

TuneFlow operates **100% on the user's device**. It is NOT a cloud streaming platform, requires NO registration or login, has NO backend database, and NEVER uploads personal audio files to any server.

---

## Key Highlights

- **100% Offline-First Architecture**: Audio files are stored locally in the browser's IndexedDB as binary `Blob` objects. Once imported, they remain playable forever without an internet connection.
- **Installable Progressive Web App (PWA)**: Installable as a standalone app on Android (Chrome), iOS (Safari), and Desktop (Windows / Mac via Chrome or Edge) with custom icons and splash screen.
- **Single Shared HTML5 Audio Engine**: One persistent audio pipeline preventing simultaneous playback, with seamless navigation across all app views.
- **Web Audio API Real-Time Visualizer**: Frequency spectrum bars and wave animations reacting directly to playback in both the mini player and immersive full-screen player.
- **Media Session API Integration**: Native lock-screen media controls, album artwork, and timeline scrubbing on mobile and desktop OS notifications.
- **True Library Backup & Restore**:
  - **Full Archive (.zip)**: Exports all metadata, playlists, AND original binary audio Blobs into a single portable `.zip` archive. Restoring on any phone or PC unpacks and recovers your entire library.
  - **Metadata JSON (.json)**: Lightweight backup of playlists and song tags, with smart validation and missing-track warnings.
- **Storage Manager**: Real-time browser quota estimator (`navigator.storage.estimate`), persistent storage protection (`navigator.storage.persist`), and individual track removal.
- **Design & Customization**: Spotify/Apple Music-grade modern interface with dark mode default, light mode support, and 6 custom neon accent palettes (Violet, Emerald, Cyan, Rose, Amber, Blue).

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling & Design System** | Tailwind CSS v4 + Plus Jakarta Sans & JetBrains Mono typography |
| **Routing** | React Router v7 (SPA with Vercel rewrites) |
| **Local Device Storage** | IndexedDB via `idb` (6 dedicated stores: `songs`, `playlists`, `playlist_songs`, `favourites`, `history`, `settings`) |
| **Audio Playback** | HTML5 Audio API (single shared instance) + Object URL Manager |
| **Audio Analysis** | Web Audio API `AudioContext` & `AnalyserNode` |
| **Metadata & Tag Extraction** | `music-metadata-browser` + HTML5 Audio duration fallback |
| **Archive Compression** | `JSZip` for client-side .zip packaging of audio Blobs |
| **Icons** | Lucide React |
| **PWA & Offline** | Web App Manifest + Cache-First Service Worker (`sw.js`) |
| **Deployment Target** | Static SPA on Vercel |

---

## IndexedDB Database Architecture

Database Name: `tuneflow_db` (Version 1)

1. **`songs`**: Unique ID, track title, artist, album, genre, duration, original fileName, fileSize, `audioBlob` (binary audio), `coverArtwork` (Data URL), dateAdded.
2. **`playlists`**: Playlist ID, name, description, custom cover artwork, creation timestamp.
3. **`playlist_songs`**: Junction records linking playlists to songs with an explicit `order` index for custom track sequencing.
4. **`favourites`**: Registry of liked song IDs with `addedAt` timestamp.
5. **`history`**: Listening history tracking played songs with deduplication for recently played widgets.
6. **`settings`**: User preferences (theme, accent color, volume, repeat mode).

---

## Desktop Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause |
| `Arrow Right` | Seek Forward 5 seconds (`Shift + Arrow Right`: 10s) |
| `Arrow Left` | Seek Backward 5 seconds (`Shift + Arrow Left`: 10s) |
| `Arrow Up` | Volume Up (+5%) |
| `Arrow Down` | Volume Down (-5%) |
| `Key M` | Mute / Unmute Toggle |
| `Key N` | Skip to Next Track |
| `Key P` | Skip to Previous Track |
| `Key L` | Like / Unlike Current Track |
| `Key S` | Toggle Shuffle |
| `Key R` | Cycle Repeat Mode (Off &rarr; All &rarr; One) |
| `Key F` | Open / Close Full-Screen Now Playing Overlay |
| `Escape` | Close Full-Screen Player or Active Modal |

---

## Local Development & Setup

### Prerequisites

- Node.js (v18 or higher recommended; developed on Node v24)
- npm or pnpm

### Getting Started

1. **Clone or navigate to the repository directory**:
   ```bash
   cd Offline_Music_Player
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local Vite development server**:
   ```bash
   npm run dev
   ```
   Open your browser to the URL displayed in the terminal (typically `http://localhost:5173`).

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## PWA Installation Instructions

### Android (Chrome)
1. Open TuneFlow in Chrome on Android.
2. Tap the three dots menu in the top right.
3. Tap **"Install app"** or **"Add to Home screen"**.
4. Confirm installation. The app icon will appear in your home screen and app drawer.

### iOS (Safari on iPhone / iPad)
1. Open TuneFlow in Safari.
2. Tap the **Share** button (box with upward arrow) at the bottom toolbar.
3. Scroll down and select **"Add to Home Screen"**.
4. Tap **Add** in the top right. TuneFlow launches full-screen without Safari browser bars.

### Windows & Mac (Chrome / Edge)
1. Open TuneFlow in Chrome or Microsoft Edge.
2. Click the **Install** button located on the right side of the URL bar (or click "Install App" in TuneFlow's header).
3. Confirm by clicking **Install**. TuneFlow will run in a dedicated desktop window and can be pinned to your Taskbar or Start Menu.

---

## Deploying to Vercel

TuneFlow is configured for zero-configuration static deployment on **Vercel**:

1. Install the Vercel CLI (or connect your GitHub repository directly to Vercel):
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. For production deployment:
   ```bash
   vercel --prod
   ```

The included `vercel.json` automatically:
- Configures client-side SPA routing (`/(.*)` &rarr; `/index.html`).
- Sets optimal `Cache-Control` headers for static JS/CSS assets (`max-age=31536000, immutable`).
- Sets `must-revalidate` for `sw.js` and `manifest.webmanifest` so service worker updates deploy instantly to users.
- Ensures all traffic is served over HTTPS (required for Service Workers and the Media Session API).

---

## License

MIT License. Designed and built with privacy and offline reliability in mind.
