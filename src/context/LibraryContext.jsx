import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as songService from '../services/songService';
import * as playlistService from '../services/playlistService';
import * as favouriteService from '../services/favouriteService';
import * as historyService from '../services/historyService';
import * as storageService from '../services/storageService';
import { useToast } from './ToastContext';

const LibraryContext = createContext(null);

export function LibraryProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [favourites, setFavourites] = useState(new Set());
  const [history, setHistory] = useState([]);
  const [storageStats, setStorageStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const refreshStats = useCallback(async () => {
    try {
      const stats = await storageService.getStorageStats();
      setStorageStats(stats);
    } catch (e) {
      console.warn('Failed to load storage stats', e);
    }
  }, []);

  const loadLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allSongs, allPlaylists, favSet, recentHistory, stats] = await Promise.all([
        songService.getAllSongs(),
        playlistService.getAllPlaylists(),
        favouriteService.getFavouriteSongIds(),
        historyService.getRecentHistory(30),
        storageService.getStorageStats(),
      ]);

      // Sort songs by dateAdded descending by default
      allSongs.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));

      setSongs(allSongs);
      setPlaylists(allPlaylists);
      setFavourites(favSet);
      setHistory(recentHistory);
      setStorageStats(stats);
    } catch (err) {
      console.error('Failed to load library:', err);
      toast.error('Failed to load local music library');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Favorite toggle action
  const toggleLikeSong = useCallback(async (songId) => {
    try {
      const isFav = await favouriteService.toggleFavourite(songId);
      setFavourites((prev) => {
        const next = new Set(prev);
        if (isFav) {
          next.add(songId);
        } else {
          next.delete(songId);
        }
        return next;
      });
      return isFav;
    } catch (err) {
      console.error('Failed to toggle favourite:', err);
      toast.error('Failed to update favourite');
      return false;
    }
  }, [toast]);

  // Remove song
  const removeSong = useCallback(async (songId) => {
    try {
      await songService.deleteSong(songId);
      setSongs((prev) => prev.filter((s) => s.id !== songId));
      setFavourites((prev) => {
        const next = new Set(prev);
        next.delete(songId);
        return next;
      });
      setHistory((prev) => prev.filter((s) => s.id !== songId));
      refreshStats();
      // Also reload playlists to refresh their song counts
      const updatedPlaylists = await playlistService.getAllPlaylists();
      setPlaylists(updatedPlaylists);
      toast.success('Song removed from library');
    } catch (err) {
      console.error('Failed to delete song:', err);
      toast.error('Failed to remove song');
    }
  }, [refreshStats, toast]);

  // Remove multiple songs
  const removeMultipleSongs = useCallback(async (songIds) => {
    try {
      await songService.deleteMultipleSongs(songIds);
      const idSet = new Set(songIds);
      setSongs((prev) => prev.filter((s) => !idSet.has(s.id)));
      setFavourites((prev) => {
        const next = new Set(prev);
        songIds.forEach(id => next.delete(id));
        return next;
      });
      setHistory((prev) => prev.filter((s) => !idSet.has(s.id)));
      refreshStats();
      const updatedPlaylists = await playlistService.getAllPlaylists();
      setPlaylists(updatedPlaylists);
      toast.success(`Removed ${songIds.length} songs`);
    } catch (err) {
      console.error('Failed to delete songs:', err);
      toast.error('Failed to remove songs');
    }
  }, [refreshStats, toast]);

  // Edit song metadata
  const editSong = useCallback(async (songId, updates) => {
    try {
      const updated = await songService.updateSongMetadata(songId, updates);
      setSongs((prev) => prev.map((s) => (s.id === songId ? updated : s)));
      toast.success('Song metadata updated');
      return updated;
    } catch (err) {
      console.error('Failed to update song:', err);
      toast.error('Failed to update song metadata');
      throw err;
    }
  }, [toast]);

  // Playlist actions
  const addPlaylist = useCallback(async ({ name, description, coverArtwork }) => {
    try {
      const newPlaylist = await playlistService.createPlaylist({ name, description, coverArtwork });
      setPlaylists((prev) => [{ ...newPlaylist, songCount: 0 }, ...prev]);
      toast.success(`Playlist "${newPlaylist.name}" created`);
      return newPlaylist;
    } catch (err) {
      toast.error('Failed to create playlist');
      throw err;
    }
  }, [toast]);

  const editPlaylist = useCallback(async (playlistId, updates) => {
    try {
      const updated = await playlistService.updatePlaylist(playlistId, updates);
      setPlaylists((prev) => prev.map((pl) => (pl.id === playlistId ? { ...pl, ...updated } : pl)));
      toast.success('Playlist updated');
      return updated;
    } catch (err) {
      toast.error('Failed to update playlist');
      throw err;
    }
  }, [toast]);

  const removePlaylist = useCallback(async (playlistId) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
      toast.success('Playlist deleted');
    } catch (err) {
      toast.error('Failed to delete playlist');
      throw err;
    }
  }, [toast]);

  const addSongsToPlaylistAction = useCallback(async (playlistId, songIds) => {
    try {
      await playlistService.addSongsToPlaylist(playlistId, songIds);
      const updatedPlaylists = await playlistService.getAllPlaylists();
      setPlaylists(updatedPlaylists);
      toast.success(`Added ${songIds.length} song${songIds.length > 1 ? 's' : ''} to playlist`);
    } catch (err) {
      toast.error('Failed to add songs to playlist');
      throw err;
    }
  }, [toast]);

  const removeSongFromPlaylistAction = useCallback(async (playlistId, songId) => {
    try {
      await playlistService.removeSongFromPlaylist(playlistId, songId);
      const updatedPlaylists = await playlistService.getAllPlaylists();
      setPlaylists(updatedPlaylists);
      toast.success('Removed song from playlist');
    } catch (err) {
      toast.error('Failed to remove song from playlist');
      throw err;
    }
  }, [toast]);

  const reorderPlaylistAction = useCallback(async (playlistId, orderedSongIds) => {
    try {
      await playlistService.reorderPlaylistSongs(playlistId, orderedSongIds);
    } catch (err) {
      toast.error('Failed to save playlist order');
      throw err;
    }
  }, [toast]);

  const clearEntireLibraryAction = useCallback(async () => {
    try {
      await storageService.clearEntireLibrary();
      setSongs([]);
      setPlaylists([]);
      setFavourites(new Set());
      setHistory([]);
      await refreshStats();
      toast.success('Library cleared completely');
    } catch (err) {
      toast.error('Failed to clear library');
      throw err;
    }
  }, [refreshStats, toast]);

  const recordPlayHistory = useCallback(async (songId) => {
    try {
      await historyService.recordHistory(songId);
      const recent = await historyService.getRecentHistory(30);
      setHistory(recent);
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <LibraryContext.Provider
      value={{
        songs,
        playlists,
        favourites,
        history,
        storageStats,
        isLoading,
        loadLibrary,
        refreshStats,
        toggleLikeSong,
        removeSong,
        removeMultipleSongs,
        editSong,
        addPlaylist,
        editPlaylist,
        removePlaylist,
        addSongsToPlaylistAction,
        removeSongFromPlaylistAction,
        reorderPlaylistAction,
        clearEntireLibraryAction,
        recordPlayHistory,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within LibraryProvider');
  return context;
}

