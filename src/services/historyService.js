import { getDB } from './db';

/**
 * Record a song playback to listening history
 * @param {string} songId
 */
export async function recordHistory(songId) {
  if (!songId) return;
  const db = await getDB();
  await db.add('history', {
    songId,
    playedAt: new Date().toISOString(),
  });
}

/**
 * Get recently played songs
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getRecentHistory(limit = 20) {
  const db = await getDB();
  const tx = db.transaction(['history', 'songs'], 'readonly');
  const historyStore = tx.objectStore('history');
  const songStore = tx.objectStore('songs');

  const allHistory = await historyStore.getAll();
  allHistory.sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));

  // Deduplicate by songId while preserving the latest order
  const seenSongIds = new Set();
  const uniqueHistory = [];

  for (const h of allHistory) {
    if (!seenSongIds.has(h.songId)) {
      seenSongIds.add(h.songId);
      uniqueHistory.push(h);
      if (uniqueHistory.length >= limit) break;
    }
  }

  const result = [];
  for (const h of uniqueHistory) {
    const song = await songStore.get(h.songId);
    if (song) {
      result.push({
        ...song,
        playedAt: h.playedAt,
      });
    }
  }

  await tx.done;
  return result;
}

/**
 * Clear all listening history
 */
export async function clearHistory() {
  const db = await getDB();
  await db.clear('history');
}

