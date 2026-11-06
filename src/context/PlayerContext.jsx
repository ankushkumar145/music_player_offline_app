import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getAudioPlaybackUrl } from '../services/songService';
import {
  updateMediaSessionMetadata,
  setupMediaSessionHandlers,
  setMediaSessionPlaybackState,
  setMediaSessionPositionState,
} from '../services/mediaSessionService';
import { useToast } from './ToastContext';
import { useLibrary } from './LibraryContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { recordPlayHistory } = useLibrary();
  const toast = useToast();

  // Audio element reference (Single shared instance across the entire app)
  const audioRef = useRef(null);

  // Web Audio API refs for visualizer
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);

  // Playback State
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('tf_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [repeatMode, setRepeatMode] = useState(() => {
    return localStorage.getItem('tf_repeat_mode') || 'off'; // 'off' | 'all' | 'one'
  });
  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem('tf_shuffle') === 'true';
  });

  // Queue State
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [shuffledIndices, setShuffledIndices] = useState([]);

  // Full-screen Now Playing Modal
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // Sleep Timer
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState(null); // seconds
  const sleepTimerIdRef = useRef(null);

  // Initialize single HTML5 Audio element on mount
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setMediaSessionPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
      });
    };

    const onDurationChange = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      setMediaSessionPlaybackState('playing');
    };

    const onPause = () => {
      setIsPlaying(false);
      setMediaSessionPlaybackState('paused');
    };

    const onError = (e) => {
      console.error('Audio playback error:', e);
      setIsPlaying(false);
      setMediaSessionPlaybackState('none');
      toast.error('Unable to play this audio file. The format may be unsupported.');
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Web Audio API Initializer (safe for cross-browser, initialized on user play)
  const initWebAudio = useCallback(() => {
    if (!audioContextRef.current && audioRef.current) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 128;
          analyser.smoothingTimeConstant = 0.8;

          const source = ctx.createMediaElementSource(audioRef.current);
          source.connect(analyser);
          analyser.connect(ctx.destination);

          audioContextRef.current = ctx;
          analyserRef.current = analyser;
          sourceNodeRef.current = source;
        }
      } catch (err) {
        console.warn('Web Audio initialization error (continuing without visualizer):', err);
      }
    } else if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('tf_volume', String(volume));
  }, [volume, isMuted]);

  // Sync playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Persist repeat & shuffle
  useEffect(() => {
    localStorage.setItem('tf_repeat_mode', repeatMode);
  }, [repeatMode]);

  useEffect(() => {
    localStorage.setItem('tf_shuffle', String(isShuffle));
  }, [isShuffle]);

  // Play next handler
  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      return;
    }

    let nextIndex = queueIndex + 1;
    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        // End of queue
        setIsPlaying(false);
        return;
      }
    }

    setQueueIndex(nextIndex);
    loadAndPlaySong(queue[nextIndex]);
  }, [queue, queueIndex, repeatMode]);

  // Play previous handler
  const playPrevious = useCallback(() => {
    if (queue.length === 0) return;

    // If more than 3 seconds into song, restart it
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    setQueueIndex(prevIndex);
    loadAndPlaySong(queue[prevIndex]);
  }, [queue, queueIndex]);

  // Attach onEnded listener to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      // Check sleep timer end-of-track mode
      if (sleepTimerRemaining === 'end-of-track') {
        audio.pause();
        setIsPlaying(false);
        setSleepTimerRemaining(null);
        toast.info('Sleep timer stopped playback');
        return;
      }

      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        playNext();
      }
    };

    audio.addEventListener('ended', onEnded);
    return () => audio.removeEventListener('ended', onEnded);
  }, [playNext, repeatMode, sleepTimerRemaining, toast]);

  // Load and play a specific song
  const loadAndPlaySong = useCallback(
    async (song) => {
      if (!song || !audioRef.current) return;

      initWebAudio();

      const playbackUrl = getAudioPlaybackUrl(song);
      if (!playbackUrl) {
        toast.error('Could not create playback stream for this song.');
        return;
      }

      const audio = audioRef.current;
      audio.src = playbackUrl;
      audio.playbackRate = playbackRate;
      setCurrentSong(song);
      setCurrentTime(0);
      setDuration(song.duration || 0);

      try {
        await audio.play();
        setIsPlaying(true);
        updateMediaSessionMetadata(song);
        recordPlayHistory(song.id);
      } catch (err) {
        console.warn('Playback start interrupted or prohibited by autoplay policy:', err);
        setIsPlaying(false);
      }
    },
    [initWebAudio, playbackRate, recordPlayHistory, toast]
  );

  // Play a song directly, optionally initializing or replacing queue
  const playSong = useCallback(
    (song, newQueue = null) => {
      if (!song) return;

      if (newQueue && newQueue.length > 0) {
        setQueue(newQueue);
        const idx = newQueue.findIndex((s) => s.id === song.id);
        setQueueIndex(idx >= 0 ? idx : 0);
      } else {
        // If no new queue provided, insert into current queue or start one
        if (queue.length === 0) {
          setQueue([song]);
          setQueueIndex(0);
        } else {
          const idx = queue.findIndex((s) => s.id === song.id);
          if (idx >= 0) {
            setQueueIndex(idx);
          } else {
            setQueue((prev) => [...prev, song]);
            setQueueIndex(queue.length);
          }
        }
      }

      loadAndPlaySong(song);
    },
    [queue, loadAndPlaySong]
  );

  // Play an entire queue from an index
  const playQueue = useCallback(
    (songsList, startIndex = 0) => {
      if (!songsList || songsList.length === 0) return;
      const validIndex = Math.max(0, Math.min(startIndex, songsList.length - 1));
      setQueue(songsList);
      setQueueIndex(validIndex);
      loadAndPlaySong(songsList[validIndex]);
    },
    [loadAndPlaySong]
  );

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    initWebAudio();

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (!currentSong && queue.length > 0) {
        const idx = queueIndex >= 0 ? queueIndex : 0;
        setQueueIndex(idx);
        loadAndPlaySong(queue[idx]);
      } else if (currentSong) {
        audioRef.current.play().catch((e) => console.warn('Play error:', e));
      }
    }
  }, [currentSong, initWebAudio, isPlaying, loadAndPlaySong, queue, queueIndex]);

  // Seek
  const seek = useCallback((time) => {
    if (audioRef.current && !isNaN(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  // Volume
  const setVolumeLevel = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (isMuted && clamped > 0) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Shuffle toggle
  const toggleShuffle = useCallback(() => {
    setIsShuffle((prev) => {
      const next = !prev;
      if (next && queue.length > 1) {
        // Reshuffle queue while keeping current song first
        const remaining = queue.filter((_, idx) => idx !== queueIndex);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        const current = currentSong ? [currentSong] : [];
        const newQueue = [...current, ...remaining];
        setQueue(newQueue);
        setQueueIndex(0);
        toast.info('Shuffle turned on');
      } else {
        toast.info('Shuffle turned off');
      }
      return next;
    });
  }, [currentSong, queue, queueIndex, toast]);

  // Cycle repeat modes
  const cycleRepeatMode = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === 'off') {
        toast.info('Repeat all');
        return 'all';
      }
      if (prev === 'all') {
        toast.info('Repeat current track');
        return 'one';
      }
      toast.info('Repeat off');
      return 'off';
    });
  }, [toast]);

  // Queue manipulation
  const addToQueue = useCallback((song) => {
    setQueue((prev) => [...prev, song]);
    toast.success(`Added "${song.title}" to queue`);
  }, [toast]);

  const playNextInQueue = useCallback((song) => {
    setQueue((prev) => {
      const nextIndex = queueIndex + 1;
      const copy = [...prev];
      copy.splice(nextIndex, 0, song);
      return copy;
    });
    toast.success(`"${song.title}" will play next`);
  }, [queueIndex, toast]);

  const removeFromQueue = useCallback((index) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index < queueIndex) {
        setQueueIndex((curr) => curr - 1);
      }
      return next;
    });
  }, [queueIndex]);

  const reorderQueue = useCallback((newQueue) => {
    setQueue(newQueue);
    if (currentSong) {
      const newIdx = newQueue.findIndex((s) => s.id === currentSong.id);
      if (newIdx >= 0) setQueueIndex(newIdx);
    }
  }, [currentSong]);

  const clearQueue = useCallback(() => {
    setQueue(currentSong ? [currentSong] : []);
    setQueueIndex(0);
    toast.info('Queue cleared');
  }, [currentSong, toast]);

  // Sleep Timer logic
  const startSleepTimer = useCallback((minutes) => {
    if (sleepTimerIdRef.current) {
      clearInterval(sleepTimerIdRef.current);
      sleepTimerIdRef.current = null;
    }

    if (minutes === 'end-of-track') {
      setSleepTimerRemaining('end-of-track');
      toast.info('Sleep timer set to end of current track');
      return;
    }

    if (minutes === null || minutes === 0) {
      setSleepTimerRemaining(null);
      toast.info('Sleep timer canceled');
      return;
    }

    const totalSecs = minutes * 60;
    setSleepTimerRemaining(totalSecs);
    toast.info(`Sleep timer set for ${minutes} minutes`);

    sleepTimerIdRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (typeof prev !== 'number' || prev <= 1) {
          clearInterval(sleepTimerIdRef.current);
          sleepTimerIdRef.current = null;
          if (audioRef.current) {
            audioRef.current.pause();
          }
          setIsPlaying(false);
          toast.info('Sleep timer stopped music playback');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [toast]);

  // Setup Media Session handlers
  useEffect(() => {
    setupMediaSessionHandlers({
      onPlay: () => {
        if (audioRef.current) audioRef.current.play();
      },
      onPause: () => {
        if (audioRef.current) audioRef.current.pause();
      },
      onNext: playNext,
      onPrev: playPrevious,
      onSeekTo: seek,
      onSeekBackward: () => {
        if (audioRef.current) seek(Math.max(0, audioRef.current.currentTime - 10));
      },
      onSeekForward: () => {
        if (audioRef.current) seek(Math.min(duration, audioRef.current.currentTime + 10));
      },
    });
  }, [playNext, playPrevious, seek, duration]);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        repeatMode,
        isShuffle,
        queue,
        queueIndex,
        isFullScreenOpen,
        analyserNode: analyserRef.current,
        sleepTimerRemaining,
        // Methods
        playSong,
        playQueue,
        togglePlayPause,
        playNext,
        playPrevious,
        seek,
        setVolumeLevel,
        toggleMute,
        toggleShuffle,
        cycleRepeatMode,
        setPlaybackRate,
        addToQueue,
        playNextInQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setIsFullScreenOpen,
        startSleepTimer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
}

