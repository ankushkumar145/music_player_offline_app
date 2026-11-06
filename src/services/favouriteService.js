import { getDB } from './db';

/**
 * Get all favourite song IDs
 * @returns {Promise<Set<string>>}
 */
export async function getFavouriteSongIds() {
  const db = await getDB();
  const allFavs = await db.getAll('favourites');
  return new Set(allFavs.map(f => f.songId));
}

/**
 * Check if a song is favourited
 * @param {string} songId
 * @returns {Promise<boolean>}
 */
export async function isFavourite(songId) {
  if (!songId) return false;
  const db = await getDB();
  const fav = await db.get('favourites', songId);
  return Boolean(fav);
}

/**
 * Toggle favourite status for a song
 * @param {string} songId
 * @returns {Promise<boolean>} returns true if now favourite, false if unfavourited
 */
export async function toggleFavourite(songId) {
  if (!songId) return false;
  const db = await getDB();
  const existing = await db.get('favourites', songId);

  if (existing) {
    await db.delete('favourites', songId);
    return false;
  } else {
    await db.put('favourites', {
      songId,
      addedAt: new Date().toISOString(),
    });
    return true;
  }
}

/**
 * Get all favourite songs with full song details
 * @returns {Promise<Array>}
 */
export async function getFavouriteSongs() {
  const db = await getDB();
  const tx = db.transaction(['favourites', 'songs'], 'readonly');
  const favs = await tx.objectStore('favourites').getAll();
  const songStore = tx.objectStore('songs');

  // Sort by addedAt descending
  favs.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));

  const result = [];
  for (const fav of favs) {
    const song = await songStore.get(fav.songId);
    if (song) {
      result.push({
        ...song,
        favouritedAt: fav.addedAt,
      });
    }
  }

  await tx.done;
  return result;
}

