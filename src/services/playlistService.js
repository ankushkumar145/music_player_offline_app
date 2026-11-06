import { getDB } from './db';
import { generateId } from '../utils/formatters';

/**
 * Get all playlists
 * @returns {Promise<Array>}
 */
export async function getAllPlaylists() {
  const db = await getDB();
  const playlists = await db.getAll('playlists');

  // Enrich playlists with song count and thumbnail artwork
  const playlistSongs = await db.getAll('playlist_songs');
  const songs = await db.getAll('songs');
  const songMap = new Map(songs.map(s => [s.id, s]));

  return playlists.map(pl => {
    const items = playlistSongs.filter(ps => ps.playlistId === pl.id);
    let previewArtwork = pl.coverArtwork || null;
    
    // If no custom artwork, find artwork from first song with artwork
    if (!previewArtwork && items.length > 0) {
      for (const item of items) {
        const song = songMap.get(item.songId);
        if (song?.coverArtwork) {
          previewArtwork = song.coverArtwork;
          break;
        }
      }
    }

    return {
      ...pl,
      songCount: items.length,
      coverArtwork: previewArtwork,
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

/**
 * Get a single playlist with full song details in proper order
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function getPlaylistById(id) {
  const db = await getDB();
  const playlist = await db.get('playlists', id);
  if (!playlist) return null;

  const tx = db.transaction(['playlist_songs', 'songs'], 'readonly');
  const psIndex = tx.objectStore('playlist_songs').index('playlistId');
  const items = await psIndex.getAll(id);

  // Sort items by order
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const songStore = tx.objectStore('songs');
  const songs = [];
  for (const item of items) {
    const song = await songStore.get(item.songId);
    if (song) {
      songs.push({
        ...song,
        playlistItemId: item.id,
        playlistOrder: item.order,
      });
    }
  }

  await tx.done;

  return {
    ...playlist,
    songs,
  };
}

/**
 * Create a new playlist
 * @param {Object} data { name, description, coverArtwork }
 * @returns {Promise<Object>}
 */
export async function createPlaylist({ name, description = '', coverArtwork = null }) {
  const db = await getDB();
  const id = generateId();
  const newPlaylist = {
    id,
    name: name.trim() || 'Untitled Playlist',
    description: description.trim(),
    coverArtwork,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.put('playlists', newPlaylist);
  return newPlaylist;
}

/**
 * Update an existing playlist
 * @param {string} id
 * @param {Object} updates { name, description, coverArtwork }
 * @returns {Promise<Object>}
 */
export async function updatePlaylist(id, updates) {
  const db = await getDB();
  const tx = db.transaction('playlists', 'readwrite');
  const store = tx.objectStore('playlists');
  const existing = await store.get(id);

  if (!existing) {
    throw new Error(`Playlist ${id} not found`);
  }

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await store.put(updated);
  await tx.done;
  return updated;
}

/**
 * Delete a playlist and its associated playlist_songs entries
 * @param {string} id
 */
export async function deletePlaylist(id) {
  const db = await getDB();
  const tx = db.transaction(['playlists', 'playlist_songs'], 'readwrite');

  await tx.objectStore('playlists').delete(id);

  const psIndex = tx.objectStore('playlist_songs').index('playlistId');
  let cursor = await psIndex.openCursor(id);
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }

  await tx.done;
}

/**
 * Add songs to a playlist
 * @param {string} playlistId
 * @param {Array<string>} songIds
 */
export async function addSongsToPlaylist(playlistId, songIds) {
  const db = await getDB();
  const tx = db.transaction('playlist_songs', 'readwrite');
  const store = tx.objectStore('playlist_songs');
  const psIndex = store.index('playlistId');
  const currentItems = await psIndex.getAll(playlistId);

  let maxOrder = currentItems.reduce((max, item) => Math.max(max, item.order ?? 0), -1);

  for (const songId of songIds) {
    // Avoid immediate duplicates in playlist
    const alreadyExists = currentItems.some(item => item.songId === songId);
    if (!alreadyExists) {
      maxOrder += 1;
      await store.put({
        id: generateId(),
        playlistId,
        songId,
        order: maxOrder,
        addedAt: new Date().toISOString(),
      });
    }
  }

  await tx.done;
}

/**
 * Remove a single song from a playlist
 * @param {string} playlistId
 * @param {string} songId
 */
export async function removeSongFromPlaylist(playlistId, songId) {
  const db = await getDB();
  const tx = db.transaction('playlist_songs', 'readwrite');
  const store = tx.objectStore('playlist_songs');
  const psIndex = store.index('playlistId');

  let cursor = await psIndex.openCursor(playlistId);
  while (cursor) {
    if (cursor.value.songId === songId) {
      await cursor.delete();
      break;
    }
    cursor = await cursor.continue();
  }

  await tx.done;
}

/**
 * Reorder songs in a playlist
 * @param {string} playlistId
 * @param {Array<string>} orderedSongIds - Array of songIds in desired sequence
 */
export async function reorderPlaylistSongs(playlistId, orderedSongIds) {
  const db = await getDB();
  const tx = db.transaction('playlist_songs', 'readwrite');
  const store = tx.objectStore('playlist_songs');
  const psIndex = store.index('playlistId');

  const items = await psIndex.getAll(playlistId);
  const itemMapBySongId = new Map(items.map(item => [item.songId, item]));

  for (let index = 0; index < orderedSongIds.length; index++) {
    const songId = orderedSongIds[index];
    const item = itemMapBySongId.get(songId);
    if (item) {
      item.order = index;
      await store.put(item);
    }
  }

  await tx.done;
}

