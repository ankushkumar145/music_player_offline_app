import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Volume2,
  VolumeX,
  ListMusic,
  Moon,
  Music2,
  Info,
  Sliders,
  Disc,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDuration, formatBytes } from '../../utils/formatters';
import AudioVisualizer from './AudioVisualizer';
import VolumeControl from './VolumeControl';
import SleepTimerModal from './SleepTimerModal';

export default function FullScreenPlayer() {
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
    playbackRate,
    setPlaybackRate,
    isFullScreenOpen,
    setIsFullScreenOpen,
    sleepTimerRemaining,
    queue,
    queueIndex,
  } = usePlayer();

  const { favourites, toggleLikeSong } = useLibrary();
  const { currentAccent } = useTheme();

  const [activeTab, setActiveTab] = useState('artwork'); // 'artwork' | 'queue' | 'info'
  const [visualizerMode, setVisualizerMode] = useState('bars'); // 'bars' | 'wave'
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);

  if (!isFullScreenOpen || !currentSong) return null;

  const isLiked = favourites.has(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const remainingTime = duration > currentTime ? duration - currentTime : 0;

  const playbackSpeeds = [0.75, 1.0, 1.25, 1.5, 2.0];

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0b10] text-slate-100 flex flex-col justify-between overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      {/* Background Ambient Glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none filter blur-3xl scale-125 transition-all duration-1000"
        style={{
          background: currentSong.coverArtwork
            ? `radial-gradient(circle at 50% 30%, ${currentAccent.primary}, transparent 70%)`
            : `radial-gradient(circle at 50% 30%, ${currentAccent.primary}, transparent 60%)`,
        }}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/40 backdrop-blur-md">
        <button
          onClick={() => setIsFullScreenOpen(false)}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors flex items-center gap-1.5 text-sm"
        >
          <ChevronDown className="w-6 h-6" />
          <span className="hidden sm:inline font-medium">Minimize</span>
        </button>

        {/* Tab switchers: Now Playing, Up Next, Track Info */}
        <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('artwork')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'artwork'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Artwork
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'queue'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Queue ({queue.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'info'
                ? 'bg-[var(--color-accent)] text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Details
          </button>
        </div>

        {/* Right tools: Sleep timer & Visualizer toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSleepModalOpen(true)}
            className={`p-2 rounded-xl transition-colors ${
              sleepTimerRemaining !== null
                ? 'text-[var(--color-accent)] bg-purple-500/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            title="Sleep timer"
          >
            <Moon className="w-5 h-5" />
          </button>
          <button
            onClick={() => setVisualizerMode(prev => (prev === 'bars' ? 'wave' : 'bars'))}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors hidden sm:block"
            title={`Visualizer: ${visualizerMode}`}
          >
            <Sliders className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full overflow-y-auto">
        {activeTab === 'artwork' && (
          <div className="flex flex-col items-center justify-center w-full max-w-md my-auto">
            {/* Album Artwork Card / Disc */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-slate-800/80 group">
              {currentSong.coverArtwork ? (
                <img
                  src={currentSong.coverArtwork}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center text-slate-600">
                  <Disc className={`w-28 h-28 text-[var(--color-accent)]/50 ${isPlaying ? 'animate-spin-slow' : ''}`} />
                  <span className="text-xs text-slate-500 mt-3 font-medium">No artwork embedded</span>
                </div>
              )}
            </div>

            {/* Audio Visualizer underneath artwork */}
            <div className="w-full h-14 mt-6">
              <AudioVisualizer
                className="w-full h-full"
                barCount={52}
                mode={visualizerMode}
              />
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="w-full max-w-lg h-full flex flex-col bg-slate-900/40 rounded-2xl border border-slate-800/80 p-4 overflow-y-auto my-auto max-h-[60vh]">
            <h4 className="text-sm font-semibold text-slate-300 mb-3 px-2">
              Playback Sequence ({queue.length} Tracks)
            </h4>
            <div className="space-y-1.5">
              {queue.map((song, idx) => {
                const isCurrent = idx === queueIndex;
                return (
                  <div
                    key={`${song.id}-${idx}`}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-[var(--color-accent-light)] border-[var(--color-accent)] text-white'
                        : 'hover:bg-slate-800/50 border-transparent text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-mono w-5 text-slate-400">{idx + 1}</span>
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${isCurrent ? 'font-bold text-[var(--color-accent)]' : ''}`}>
                          {song.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">
                      {formatDuration(song.duration)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="w-full max-w-lg bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-4 my-auto">
            <h4 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <Info className="w-5 h-5 text-[var(--color-accent)]" />
              File & Track Details
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-slate-400">Title</p>
                <p className="font-medium text-slate-100 truncate">{currentSong.title}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Artist</p>
                <p className="font-medium text-slate-100 truncate">{currentSong.artist}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Album</p>
                <p className="font-medium text-slate-100 truncate">{currentSong.album}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Genre</p>
                <p className="font-medium text-slate-100">{currentSong.genre || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Original File Name</p>
                <p className="font-medium text-slate-100 truncate">{currentSong.fileName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">File Size</p>
                <p className="font-medium text-slate-100">
                  {formatBytes(currentSong.fileSize || currentSong.audioBlob?.size || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Storage Location</p>
                <p className="font-medium text-emerald-400">Local IndexedDB (Device)</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Format</p>
                <p className="font-medium text-slate-100 uppercase">
                  {currentSong.fileName ? currentSong.fileName.split('.').pop() : 'AUDIO'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Section */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pb-8 pt-4">
        {/* Track Title and Favorite */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0 pr-4">
            <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
              {currentSong.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-400 truncate mt-0.5">
              {currentSong.artist} &bull; {currentSong.album}
            </p>
          </div>
          <button
            onClick={() => toggleLikeSong(currentSong.id)}
            className="p-3 rounded-full hover:bg-slate-800/60 transition-transform active:scale-125"
            aria-label="Favorite song"
          >
            <Heart
              className={`w-7 h-7 transition-colors ${
                isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400 hover:text-white'
              }`}
            />
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="space-y-1.5 mb-6">
          <div className="relative flex items-center group py-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.5"
              value={currentTime}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none"
              aria-label="Seek track"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>{formatDuration(currentTime)}</span>
            <span>-{formatDuration(remainingTime)}</span>
          </div>
        </div>

        {/* Action & Speed Controls Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-3 rounded-xl transition-all ${
              isShuffle
                ? 'text-[var(--color-accent)] bg-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          {/* Previous Track */}
          <button
            onClick={playPrevious}
            className="p-3 text-slate-300 hover:text-white transition-colors active:scale-90"
            title="Previous track"
            aria-label="Previous"
          >
            <SkipBack className="w-8 h-8 fill-current" />
          </button>

          {/* Big Play / Pause Circle */}
          <button
            onClick={togglePlayPause}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center shadow-xl shadow-purple-600/40 active:scale-95 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={playNext}
            className="p-3 text-slate-300 hover:text-white transition-colors active:scale-90"
            title="Next track"
            aria-label="Next"
          >
            <SkipForward className="w-8 h-8 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeatMode}
            className={`p-3 rounded-xl transition-all ${
              repeatMode !== 'off'
                ? 'text-[var(--color-accent)] bg-purple-500/10'
                : 'text-slate-400 hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-5 h-5" />
            ) : (
              <Repeat className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Playback Speed Selector & Volume on Fullscreen */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/40">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Speed:</span>
            {playbackSpeeds.map((rate) => (
              <button
                key={rate}
                onClick={() => setPlaybackRate(rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                  playbackRate === rate
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          <div className="w-36">
            <VolumeControl showLabel />
          </div>
        </div>
      </div>

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />
    </div>
  );
}

