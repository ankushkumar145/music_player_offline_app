import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useLibrary } from '../context/LibraryContext';

export function useKeyboardShortcuts() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    isFullScreenOpen,
    setIsFullScreenOpen,
  } = usePlayer();

  const { toggleLikeSong } = useLibrary();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlayPause();
          break;

        case 'ArrowRight':
          e.preventDefault();
          seek(Math.min(duration || 0, currentTime + (e.shiftKey ? 10 : 5)));
          break;

        case 'ArrowLeft':
          e.preventDefault();
          seek(Math.max(0, currentTime - (e.shiftKey ? 10 : 5)));
          break;

        case 'ArrowUp':
          e.preventDefault();
          setVolumeLevel(Math.min(1, volume + 0.05));
          break;

        case 'ArrowDown':
          e.preventDefault();
          setVolumeLevel(Math.max(0, volume - 0.05));
          break;

        case 'KeyM':
          e.preventDefault();
          toggleMute();
          break;

        case 'KeyN':
          e.preventDefault();
          playNext();
          break;

        case 'KeyP':
          e.preventDefault();
          playPrevious();
          break;

        case 'KeyL':
          if (currentSong) {
            e.preventDefault();
            toggleLikeSong(currentSong.id);
          }
          break;

        case 'KeyS':
          e.preventDefault();
          toggleShuffle();
          break;

        case 'KeyR':
          e.preventDefault();
          cycleRepeatMode();
          break;

        case 'KeyF':
          e.preventDefault();
          setIsFullScreenOpen(!isFullScreenOpen);
          break;

        case 'Escape':
          if (isFullScreenOpen) {
            e.preventDefault();
            setIsFullScreenOpen(false);
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    toggleLikeSong,
    isFullScreenOpen,
    setIsFullScreenOpen,
  ]);
}

