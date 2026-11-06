import { openDB } from 'idb';

export const DB_NAME = 'tuneflow_db';
export const DB_VERSION = 1;

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        // 1. songs: id, title, artist, album, genre, duration, fileName, fileSize, audioBlob, coverArtwork, dateAdded
        if (!db.objectStoreNames.contains('songs')) {
          const songStore = db.createObjectStore('songs', { keyPath: 'id' });
          songStore.createIndex('title', 'title', { unique: false });
          songStore.createIndex('artist', 'artist', { unique: false });
          songStore.createIndex('album', 'album', { unique: false });
          songStore.createIndex('dateAdded', 'dateAdded', { unique: false });
        }

        // 2. playlists: id, name, description, coverArtwork, createdAt, updatedAt
        if (!db.objectStoreNames.contains('playlists')) {
          const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
          playlistStore.createIndex('name', 'name', { unique: false });
          playlistStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        // 3. playlist_songs: id, playlistId, songId, order, addedAt
        if (!db.objectStoreNames.contains('playlist_songs')) {
          const psStore = db.createObjectStore('playlist_songs', { keyPath: 'id' });
          psStore.createIndex('playlistId', 'playlistId', { unique: false });
          psStore.createIndex('songId', 'songId', { unique: false });
          psStore.createIndex('order', 'order', { unique: false });
        }

        // 4. favourites: songId, addedAt
        if (!db.objectStoreNames.contains('favourites')) {
          const favStore = db.createObjectStore('favourites', { keyPath: 'songId' });
          favStore.createIndex('addedAt', 'addedAt', { unique: false });
        }

        // 5. history: id, songId, playedAt, durationPlayed
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('playedAt', 'playedAt', { unique: false });
          historyStore.createIndex('songId', 'songId', { unique: false });
        }

        // 6. settings: key, value
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Reset database connection (useful on delete/restore)
 */
export function resetDBPromise() {
  dbPromise = null;
}

