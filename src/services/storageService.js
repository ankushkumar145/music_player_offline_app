import { getDB, resetDBPromise, DB_NAME } from './db';
import { audioUrlManager } from '../utils/audioUtils';

/**
 * Get comprehensive storage statistics
 * @returns {Promise<Object>}
 */
export async function getStorageStats() {
  const db = await getDB();
  const songs = await db.getAll('songs');

  let totalAudioBytes = 0;
  let totalArtworkBytes = 0;

  for (const song of songs) {
    if (song.audioBlob?.size) {
      totalAudioBytes += song.audioBlob.size;
    } else if (song.fileSize) {
      totalAudioBytes += song.fileSize;
    }

    if (song.coverArtwork && typeof song.coverArtwork === 'string') {
      // Rough estimation for base64 data url
      totalArtworkBytes += Math.round(song.coverArtwork.length * 0.75);
    }
  }

  let quotaEstimate = {
    supported: false,
    quota: null,
    usage: null,
    percentUsed: 0,
  };

  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      quotaEstimate = {
        supported: true,
        quota: estimate.quota || 0,
        usage: estimate.usage || 0,
        percentUsed: estimate.quota ? Math.min(100, (estimate.usage / estimate.quota) * 100) : 0,
      };
    } catch (e) {
      console.warn('Could not estimate storage:', e);
    }
  }

  const isPersisted = await checkStoragePersistence();

  return {
    songCount: songs.length,
    totalAudioBytes,
    totalArtworkBytes,
    totalBytesUsed: totalAudioBytes + totalArtworkBytes,
    quotaEstimate,
    isPersisted,
  };
}

/**
 * Check if persistent storage is already granted
 * @returns {Promise<boolean>}
 */
export async function checkStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Request persistent storage permission from browser
 * @returns {Promise<boolean>}
 */
export async function requestStoragePersistence() {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isGranted = await navigator.storage.persist();
      return isGranted;
    } catch (e) {
      console.warn('Failed to request persistence:', e);
      return false;
    }
  }
  return false;
}

/**
 * Completely clear the entire local library (all songs, playlists, favorites, history)
 */
export async function clearEntireLibrary() {
  audioUrlManager.revokeAll();
  const db = await getDB();
  const tx = db.transaction(['songs', 'playlists', 'playlist_songs', 'favourites', 'history'], 'readwrite');

  await tx.objectStore('songs').clear();
  await tx.objectStore('playlists').clear();
  await tx.objectStore('playlist_songs').clear();
  await tx.objectStore('favourites').clear();
  await tx.objectStore('history').clear();

  await tx.done;
}

