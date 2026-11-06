import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LibraryProvider } from './context/LibraryContext';
import { PlayerProvider } from './context/PlayerContext';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SongsPage from './pages/SongsPage';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage';
import FavouritesPage from './pages/FavouritesPage';
import ArtistsPage from './pages/ArtistsPage';
import AlbumsPage from './pages/AlbumsPage';
import SearchPage from './pages/SearchPage';
import StoragePage from './pages/StoragePage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <LibraryProvider>
          <PlayerProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="songs" element={<SongsPage />} />
                  <Route path="playlists" element={<PlaylistsPage />} />
                  <Route path="playlists/:id" element={<PlaylistDetailPage />} />
                  <Route path="favourites" element={<FavouritesPage />} />
                  <Route path="artists" element={<ArtistsPage />} />
                  <Route path="albums" element={<AlbumsPage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="storage" element={<StoragePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </PlayerProvider>
        </LibraryProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
