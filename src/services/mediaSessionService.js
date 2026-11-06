/**
 * Media Session API integration for lock-screen controls, notification controls, and metadata
 */
export function updateMediaSessionMetadata(song) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  if (!song) {
    navigator.mediaSession.metadata = null;
    return;
  }

  const artworkList = [];
  if (song.coverArtwork) {
    artworkList.push(
      { src: song.coverArtwork, sizes: '96x96', type: 'image/png' },
      { src: song.coverArtwork, sizes: '128x128', type: 'image/png' },
      { src: song.coverArtwork, sizes: '192x192', type: 'image/png' },
      { src: song.coverArtwork, sizes: '256x256', type: 'image/png' },
      { src: song.coverArtwork, sizes: '512x512', type: 'image/png' }
    );
  } else {
    // Default placeholder
    artworkList.push({
      src: '/icons/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
    });
  }

  try {
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: song.title || 'Unknown Title',
      artist: song.artist || 'Unknown Artist',
      album: song.album || 'Unknown Album',
      artwork: artworkList,
    });
  } catch (err) {
    console.warn('Failed to set MediaMetadata:', err);
  }
}

/**
 * Setup media session action handlers
 * @param {Object} handlers
 */
export function setupMediaSessionHandlers(handlers = {}) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) {
    return;
  }

  const actionList = [
    ['play', handlers.onPlay],
    ['pause', handlers.onPause],
    ['previoustrack', handlers.onPrev],
    ['nexttrack', handlers.onNext],
    ['seekto', handlers.onSeekTo ? (details) => handlers.onSeekTo(details.seekTime) : null],
    ['seekbackward', handlers.onSeekBackward ? () => handlers.onSeekBackward() : null],
    ['seekforward', handlers.onSeekForward ? () => handlers.onSeekForward() : null],
  ];

  actionList.forEach(([action, handler]) => {
    try {
      if (handler) {
        navigator.mediaSession.setActionHandler(action, handler);
      } else {
        navigator.mediaSession.setActionHandler(action, null);
      }
    } catch (e) {
      // action might not be supported on this browser version
    }
  });
}

/**
 * Update media session playback state
 * @param {'playing'|'paused'|'none'} state
 */
export function setMediaSessionPlaybackState(state) {
  if (typeof navigator !== 'undefined' && 'mediaSession' in navigator) {
    try {
      navigator.mediaSession.playbackState = state;
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Update playback position state for lock screen scrubber
 * @param {Object} state { duration, playbackRate, position }
 */
export function setMediaSessionPositionState(state) {
  if (
    typeof navigator !== 'undefined' &&
    'mediaSession' in navigator &&
    'setPositionState' in navigator.mediaSession
  ) {
    try {
      if (state.duration && !isNaN(state.duration) && state.duration > 0) {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, state.duration),
          playbackRate: state.playbackRate || 1.0,
          position: Math.min(state.duration, Math.max(0, state.position || 0)),
        });
      }
    } catch (e) {
      // ignore
    }
  }
}

