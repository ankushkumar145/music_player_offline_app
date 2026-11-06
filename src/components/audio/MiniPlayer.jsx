import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  Maximize2,
  Music2,
  Moon,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../../utils/formatters';
import VolumeControl from './VolumeControl';
import AudioVisualizer from './AudioVisualizer';
import SleepTimerModal from './SleepTimerModal';

export default function MiniPlayer({ onOpenQueue }) {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    seek,
    isShuffle,
    toggleShuffle,
    repeatMode,
    cycleRepeatMode,
    setIsFullScreenOpen,
    sleepTimerRemaining,
    queue,
  } = usePlayer();

  const { favourites, toggleLikeSong } = useLibrary();
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  if (!currentSong) return null;

  const isLiked = favourites.has(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f1118]/95 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-all">
        {/* Top Slim Progress Bar for Mobile */}
        <div
          className="w-full h-1 bg-slate-800/80 cursor-pointer sm:hidden relative group"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seek(clickPos * (duration || 0));
          }}
        >
          <div
            className="h-full bg-[var(--color-accent)] transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Track Information */}
          <div className="flex items-center gap-3 min-w-0 max-w-[45%] sm:max-w-[30%] sm:w-72">
            <div
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800 shrink-0 overflow-hidden cursor-pointer shadow-md group"
              onClick={() => setIsFullScreenOpen(true)}
              title="Open full player"
            >
              {currentSong.coverArtwork ? (
                <img
                  src={currentSong.coverArtwork}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-purple-400">
                  <Music2 className="w-6 h-6" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div
              className="min-w-0 flex-1 cursor-pointer"
              onClick={() => setIsFullScreenOpen(true)}
            >
              <p className="text-sm font-semibold text-slate-100 truncate hover:text-[var(--color-accent)] transition-colors">
                {currentSong.title}
              </p>
              <p className="text-xs text-slate-400 truncate hover:text-slate-300">
                {currentSong.artist}
              </p>
            </div>

            <button
              onClick={() => toggleLikeSong(currentSong.id)}
              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
              title={isLiked ? 'Unlike' : 'Like'}
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-5 h-5 transition-transform active:scale-125 ${
                  isLiked ? 'fill-rose-500 text-rose-500' : ''
                }`}
              />
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex-1 max-w-xl flex flex-col items-center">
            {/* Playback Buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-lg transition-colors hidden sm:block ${
                  isShuffle
                    ? 'text-[var(--color-accent)] bg-purple-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Shuffle ${isShuffle ? 'On' : 'Off'} (S)`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={playPrevious}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Previous track (P)"
                aria-label="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={playNext}
                className="p-2 text-slate-300 hover:text-white transition-colors"
                title="Next track (N)"
                aria-label="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={cycleRepeatMode}
                className={`p-2 rounded-lg transition-colors hidden sm:block ${
                  repeatMode !== 'off'
                    ? 'text-[var(--color-accent)] bg-purple-500/10'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode} (R)`}
              >
                {repeatMode === 'one' ? (
                  <Repeat1 className="w-4 h-4" />
                ) : (
                  <Repeat className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Desktop Timeline Scrubber */}
            <div className="w-full hidden sm:flex items-center gap-2.5 mt-1">
              <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                {formatDuration(currentTime)}
              </span>
              <div className="relative flex-1 group py-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700/70 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none"
                  aria-label="Seek progress"
                />
              </div>
              <span className="text-[11px] font-mono text-slate-400 w-10">
                {formatDuration(duration)}
              </span>
            </div>
          </div>

          {/* Right: Actions, Volume & Fullscreen */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-[30%] sm:w-72">
            {/* Visualizer preview on desktop */}
            <div className="hidden lg:block w-20 h-6">
              <AudioVisualizer className="w-full h-full" barCount={16} mode="bars" />
            </div>

            {/* Sleep Timer */}
            <button
              onClick={() => setIsSleepModalOpen(true)}
              className={`p-2 rounded-lg transition-colors relative ${
                sleepTimerRemaining !== null
                  ? 'text-[var(--color-accent)] bg-purple-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
              {sleepTimerRemaining !== null && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--color-accent)] animate-ping" />
              )}
            </button>

            {/* Queue Button */}
            <button
              onClick={onOpenQueue}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors relative"
              title="Play Queue"
            >
              <ListMusic className="w-5 h-5" />
              {queue.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold flex items-center justify-center">
                  {queue.length}
                </span>
              )}
            </button>

            {/* Volume Control */}
            <div className="hidden md:block">
              <VolumeControl />
            </div>

            {/* Full Screen Player Button */}
            <button
              onClick={() => setIsFullScreenOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors hidden sm:block"
              title="Full Screen View (F)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />
    </>
  );
}

