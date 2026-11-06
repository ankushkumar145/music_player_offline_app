import JSZip from 'jszip';
import { getDB } from './db';
import { saveSong } from './songService';
import { audioUrlManager } from '../utils/audioUtils';

const BACKUP_SCHEMA_VERSION = 1;

/**
 * Export library metadata as a formatted JSON string/blob
 * (Explicitly notes that it contains metadata and playlists, not binary audio blobs)
 * @returns {Promise<Blob>}
 */
export async function exportMetadataJSON() {
  const db = await getDB();
  const songs = await db.getAll('songs');
  const playlists = await db.getAll('playlists');
  const playlistSongs = await db.getAll('playlist_songs');
  const favourites = await db.getAll('favourites');
  const history = await db.getAll('history');

  // Strip raw audio blobs from metadata export
  const songsMeta = songs.map(s => ({
    id: s.id,
    title: s.title,
    artist: s.artist,
    album: s.album,
    genre: s.genre,
    duration: s.duration,
    fileName: s.fileName,
    fileSize: s.fileSize,
    mimeType: s.mimeType,
    coverArtwork: s.coverArtwork,
    dateAdded: s.dateAdded,
  }));

  const backupData = {
    version: BACKUP_SCHEMA_VERSION,
    appName: 'TuneFlow',
    type: 'metadata_only',
    createdAt: new Date().toISOString(),
    stats: {
      songCount: songs.length,
      playlistCount: playlists.length,
      favouritesCount: favourites.length,
    },
    data: {
      songs: songsMeta,
      playlists,
      playlistSongs,
      favourites,
      history,
    },
    notice: 'This backup contains song metadata, playlists, and tags only. Original audio files are not included in metadata-only backups.',
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  return new Blob([jsonStr], { type: 'application/json' });
}

/**
 * Validates and imports a JSON metadata backup
 * @param {string|File} jsonContent
 * @returns {Promise<{ restoredPlaylists: number, restoredFavs: number, missingSongsCount: number, missingSongNames: Array }>}
 */
export async function importMetadataJSON(jsonContent) {
  let parsed;
  try {
    const text = typeof jsonContent === 'string' ? jsonContent : await jsonContent.text();
    parsed = JSON.parse(text);
  } catch (err) {
    throw new Error('Invalid JSON file format.');
  }

  if (!parsed || parsed.appName !== 'TuneFlow' || !parsed.data) {
    throw new Error('Unrecognized backup format. Please select a valid TuneFlow backup file.');
  }

  const db = await getDB();
  const existingSongs = await db.getAll('songs');
  const existingSongIds = new Set(existingSongs.map(s => s.id));

  const { playlists = [], playlistSongs = [], favourites = [], songs = [] } = parsed.data;

  // Track which songs from the backup do NOT exist in the local library
  const missingSongNames = [];
  for (const s of songs) {
    if (!existingSongIds.has(s.id)) {
      missingSongNames.push(`${s.title} - ${s.artist}`);
    }
  }

  // Restore Playlists
  const pTx = db.transaction('playlists', 'readwrite');
  for (const pl of playlists) {
    await pTx.objectStore('playlists').put(pl);
  }
  await pTx.done;

  // Restore Playlist Songs
  const psTx = db.transaction('playlist_songs', 'readwrite');
  for (const ps of playlistSongs) {
    await psTx.objectStore('playlist_songs').put(ps);
  }
  await psTx.done;

  // Restore Favourites
  const favTx = db.transaction('favourites', 'readwrite');
  for (const fav of favourites) {
    await favTx.objectStore('favourites').put(fav);
  }
  await favTx.done;

  return {
    restoredPlaylists: playlists.length,
    restoredFavs: favourites.length,
    missingSongsCount: missingSongNames.length,
    missingSongNames,
  };
}

/**
 * Export a complete ZIP archive containing metadata AND all audio Blobs!
 * @param {Function} onProgress (percent, currentFile)
 * @returns {Promise<Blob>}
 */
export async function exportCompleteArchive(onProgress = () => {}) {
  const db = await getDB();
  const songs = await db.getAll('songs');
  const playlists = await db.getAll('playlists');
  const playlistSongs = await db.getAll('playlist_songs');
  const favourites = await db.getAll('favourites');
  const history = await db.getAll('history');

  const zip = new JSZip();

  const manifestSongs = [];
  const audioFolder = zip.folder('audio');

  const totalSongs = songs.length;
  for (let i = 0; i < totalSongs; i++) {
    const song = songs[i];
    const safeExt = song.fileName ? song.fileName.split('.').pop() : 'mp3';
    const blobFilename = `${song.id}.${safeExt}`;

    manifestSongs.push({
      id: song.id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      genre: song.genre,
      duration: song.duration,
      fileName: song.fileName,
      fileSize: song.fileSize,
      mimeType: song.mimeType,
      coverArtwork: song.coverArtwork,
      dateAdded: song.dateAdded,
      archiveAudioPath: `audio/${blobFilename}`,
    });

    if (song.audioBlob) {
      audioFolder.file(blobFilename, song.audioBlob);
    }

    onProgress(Math.round(((i + 1) / totalSongs) * 70), `Packing ${song.title}`);
  }

  const manifest = {
    version: BACKUP_SCHEMA_VERSION,
    appName: 'TuneFlow',
    type: 'complete_archive',
    createdAt: new Date().toISOString(),
    data: {
      songs: manifestSongs,
      playlists,
      playlistSongs,
      favourites,
      history,
    },
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  onProgress(75, 'Compressing archive...');

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const pct = 75 + Math.round((metadata.percent / 100) * 25);
      onProgress(pct, `Compressing: ${Math.round(metadata.percent)}%`);
    }
  );

  onProgress(100, 'Done');
  return zipBlob;
}

/**
 * Import a complete ZIP archive restoring metadata and all audio files
 * @param {File|Blob} zipFile
 * @param {Function} onProgress (percent, statusMessage)
 * @returns {Promise<{ restoredSongs: number, restoredPlaylists: number }>}
 */
export async function importCompleteArchive(zipFile, onProgress = () => {}) {
  onProgress(5, 'Reading backup archive...');
  const zip = await JSZip.loadAsync(zipFile);

  const manifestFile = zip.file('manifest.json');
  if (!manifestFile) {
    throw new Error('Invalid archive: manifest.json not found in backup archive.');
  }

  const manifestText = await manifestFile.async('text');
  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch (e) {
    throw new Error('Corrupted manifest.json in archive.');
  }

  if (manifest.appName !== 'TuneFlow' || !manifest.data) {
    throw new Error('Not a valid TuneFlow backup archive.');
  }

  const { songs = [], playlists = [], playlistSongs = [], favourites = [] } = manifest.data;
  const total = songs.length;

  for (let i = 0; i < total; i++) {
    const s = songs[i];
    onProgress(10 + Math.round(((i + 1) / total) * 70), `Restoring song: ${s.title}`);

    let audioBlob = null;
    if (s.archiveAudioPath) {
      const fileInZip = zip.file(s.archiveAudioPath);
      if (fileInZip) {
        audioBlob = await fileInZip.async('blob');
      }
    }

    if (audioBlob) {
      await saveSong({
        id: s.id,
        title: s.title,
        artist: s.artist,
        album: s.album,
        genre: s.genre,
        duration: s.duration,
        fileName: s.fileName,
        fileSize: audioBlob.size || s.fileSize,
        mimeType: s.mimeType || 'audio/mpeg',
        audioBlob: audioBlob,
        coverArtwork: s.coverArtwork,
        dateAdded: s.dateAdded || new Date().toISOString(),
      });
    }
  }

  onProgress(85, 'Restoring playlists and favorites...');
  const db = await getDB();

  // Restore Playlists
  const pTx = db.transaction('playlists', 'readwrite');
  for (const pl of playlists) {
    await pTx.objectStore('playlists').put(pl);
  }
  await pTx.done;

  // Restore Playlist Songs
  const psTx = db.transaction('playlist_songs', 'readwrite');
  for (const ps of playlistSongs) {
    await psTx.objectStore('playlist_songs').put(ps);
  }
  await psTx.done;

  // Restore Favourites
  const favTx = db.transaction('favourites', 'readwrite');
  for (const fav of favourites) {
    await favTx.objectStore('favourites').put(fav);
  }
  await favTx.done;

  onProgress(100, 'Import completed successfully!');
  return {
    restoredSongs: songs.length,
    restoredPlaylists: playlists.length,
  };
}

