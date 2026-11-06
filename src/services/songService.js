import { getDB } from './db';
import { generateId } from '../utils/formatters';
import { extractAudioMetadata } from './metadataService';
import { audioUrlManager } from '../utils/audioUtils';

/**
 * Get all songs from IndexedDB
 * @returns {Promise<Array>}
 */
export async function getAllSongs() {
  const db = await getDB();
  return db.getAll('songs');
}

/**
 * Get a single song by ID
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getSongById(id) {
  const db = await getDB();
  return db.get('songs', id);
}

/**
 * Save or insert a song into the songs store
 * @param {Object} song
 * @returns {Promise<Object>}
 */
export async function saveSong(song) {
  const db = await getDB();
  await db.put('songs', song);
  return song;
}

/**
 * Update editable metadata for an existing song
 * @param {string} id
 * @param {Object} updates { title, artist, album, genre, coverArtwork }
 * @returns {Promise<Object>}
 */
export async function updateSongMetadata(id, updates) {
  const db = await getDB();
  const tx = db.transaction('songs', 'readwrite');
  const store = tx.objectStore('songs');
  const existing = await store.get(id);

  if (!existing) {
    throw new Error(`Song with id ${id} not found`);
  }

  const updatedSong = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await store.put(updatedSong);
  await tx.done;
  return updatedSong;
}

/**
 * Delete a song and cascade delete its occurrences in playlist_songs, favourites, history
 * @param {string} id
 */
export async function deleteSong(id) {
  const db = await getDB();
  audioUrlManager.revoke(id);

  // Use a transaction across all related stores
  const tx = db.transaction(['songs', 'playlist_songs', 'favourites', 'history'], 'readwrite');

  await tx.objectStore('songs').delete(id);
  await tx.objectStore('favourites').delete(id);

  // Remove occurrences in playlists
  const psIndex = tx.objectStore('playlist_songs').index('songId');
  let cursor = await psIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  // Remove history occurrences
  const histIndex = tx.objectStore('history').index('songId');
  let histCursor = await histIndex.openCursor(id);
  while (histCursor) {
    await histCursor.delete();
    histCursor = await histCursor.continue();
  }

  await tx.done;
}

/**
 * Delete multiple songs by their IDs
 * @param {Array<string>} ids
 */
export async function deleteMultipleSongs(ids) {
  for (const id of ids) {
    await deleteSong(id);
  }
}

/**
 * Imports audio files (Files or Blobs), extracts metadata, and saves to IndexedDB
 * @param {FileList|Array<File>} files
 * @param {Function} onProgress callback (current, total, currentFileName)
 * @returns {Promise<{ imported: Array, errors: Array }>}
 */
export async function importAudioFiles(files, onProgress = () => {}) {
  const fileArray = Array.from(files).filter(file => {
    // Check type or extension
    const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'webm', 'weba', 'opus'];
    return file.type.startsWith('audio/') || audioExts.includes(ext);
  });

  const total = fileArray.length;
  const imported = [];
  const errors = [];

  for (let i = 0; i < total; i++) {
    const file = fileArray[i];
    onProgress(i + 1, total, file.name);

    try {
      const meta = await extractAudioMetadata(file);
      const songId = generateId();

      const songRecord = {
        id: songId,
        title: meta.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: meta.artist || 'Unknown Artist',
        album: meta.album || 'Unknown Album',
        genre: meta.genre || 'Unknown',
        duration: meta.duration || 0,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'audio/mpeg',
        audioBlob: file, // Store raw Blob
        coverArtwork: meta.coverArtwork || null,
        dateAdded: new Date().toISOString(),
      };

      await saveSong(songRecord);
      imported.push(songRecord);
    } catch (err) {
      console.error(`Failed to import ${file.name}:`, err);
      errors.push({ fileName: file.name, error: err.message || 'Import error' });
    }
  }

  return { imported, errors };
}

/**
 * Creates or gets an active audio playback URL for a song
 * @param {Object} song
 * @returns {string|null}
 */
export function getAudioPlaybackUrl(song) {
  if (!song || !song.audioBlob) return null;
  return audioUrlManager.getUrl(song.id, song.audioBlob);
}

