import * as mm from 'music-metadata-browser';

/**
 * Extracts metadata and duration from an audio file
 * @param {File|Blob} file
 * @returns {Promise<{title: string, artist: string, album: string, genre: string, duration: number, coverArtwork: string|null}>}
 */
export async function extractAudioMetadata(file) {
  let title = '';
  let artist = 'Unknown Artist';
  let album = 'Unknown Album';
  let genre = 'Unknown';
  let duration = 0;
  let coverArtwork = null;

  // Derive initial title from filename if available
  const fileName = file.name || 'Untitled Track';
  const cleanFileName = fileName.replace(/\.[^/.]+$/, '').replace(/^[0-9\s-_.]+/, '').trim() || fileName;
  title = cleanFileName;

  // 1. Try parsing with music-metadata-browser
  try {
    const metadata = await mm.parseBlob(file, { duration: true, skipCovers: false });
    if (metadata.common) {
      if (metadata.common.title && metadata.common.title.trim()) {
        title = metadata.common.title.trim();
      }
      if (metadata.common.artist && metadata.common.artist.trim()) {
        artist = metadata.common.artist.trim();
      }
      if (metadata.common.album && metadata.common.album.trim()) {
        album = metadata.common.album.trim();
      }
      if (metadata.common.genre && metadata.common.genre.length > 0) {
        genre = Array.isArray(metadata.common.genre) ? metadata.common.genre.join(', ') : String(metadata.common.genre);
      }
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const pic = metadata.common.picture[0];
        try {
          const blob = new Blob([pic.data], { type: pic.format || 'image/jpeg' });
          coverArtwork = await blobToDataUrl(blob);
        } catch (picErr) {
          console.warn('Could not process cover art:', picErr);
        }
      }
    }
    if (metadata.format && metadata.format.duration) {
      duration = Math.round(metadata.format.duration);
    }
  } catch (err) {
    console.warn(`Tag parsing skipped for ${fileName}:`, err?.message || err);
  }

  // 2. Fallback for duration if tag parser didn't yield duration
  if (!duration || duration <= 0) {
    try {
      duration = await getAudioDurationFromElement(file);
    } catch (e) {
      console.warn('Audio element duration extraction failed:', e);
      duration = 0;
    }
  }

  return {
    title,
    artist,
    album,
    genre,
    duration,
    coverArtwork,
  };
}

/**
 * Gets exact audio duration by temporarily loading into an HTML5 Audio object
 * @param {Blob|File} blob
 * @returns {Promise<number>}
 */
export function getAudioDurationFromElement(blob) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(blob);
    audio.preload = 'metadata';

    const cleanUp = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
      URL.revokeObjectURL(objectUrl);
    };

    const onLoaded = () => {
      const dur = Math.round(audio.duration || 0);
      cleanUp();
      resolve(dur);
    };

    const onError = () => {
      cleanUp();
      resolve(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);
    audio.src = objectUrl;

    // Safety timeout in case audio never triggers loadedmetadata
    setTimeout(() => {
      cleanUp();
      resolve(0);
    }, 4000);
  });
}

/**
 * Converts a Blob to a base64 Data URL
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

