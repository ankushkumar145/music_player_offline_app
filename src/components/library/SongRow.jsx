import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Heart,
  MoreVertical,
  Plus,
  ListPlus,
  Edit,
  Trash2,
  Music2,
  Volume2,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';
import { formatDuration } from '../../utils/formatters';

export default function SongRow({
  song,
  index,
  songsList = [],
  onEdit,
  onAddToPlaylist,
  onDelete,
}) {
  const { currentSong, isPlaying, playSong, togglePlayPause, addToQueue, playNextInQueue } =
    usePlayer();
  const { favourites, toggleLikeSong } = useLibrary();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentSong?.id === song.id;
  const isLiked = favourites.has(song.id);

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isMenuOpen]);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, songsList);
    }
  };

  return (
    <div
      className={`group flex items-center justify-between px-3 sm:px-4 py-2.5 rounded-xl transition-all duration-150 select-none ${
        isCurrent
          ? 'bg-[var(--color-accent-light)] text-white'
          : 'hover:bg-slate-800/50 text-slate-300'
      }`}
    >
      {/* Left: Index / Play Button & Artwork & Title */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Track number / Animated indicator */}
        <div className="w-6 flex items-center justify-center shrink-0">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-3.5">
              <span className="w-1 bg-[var(--color-accent)] animate-bounce h-2" />
              <span className="w-1 bg-[var(--color-accent)] animate-bounce h-3.5 delay-100" />
              <span className="w-1 bg-[var(--color-accent)] animate-bounce h-2.5 delay-200" />
            </div>
          ) : (
            <>
              <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                {typeof index === 'number' ? index + 1 : ''}
              </span>
              <button
                onClick={handleRowClick}
                className="hidden group-hover:flex text-slate-200 hover:text-white"
                aria-label="Play song"
              >
                {isCurrent && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </>
          )}
        </div>

        {/* Thumbnail */}
        <div
          onClick={handleRowClick}
          className="relative w-10 h-10 rounded-lg bg-slate-800 shrink-0 overflow-hidden cursor-pointer shadow group-hover:shadow-md"
        >
          {song.coverArtwork ? (
            <img
              src={song.coverArtwork}
              alt={song.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-purple-400">
              <Music2 className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Title & Artist */}
        <div
          onClick={handleRowClick}
          className="min-w-0 flex-1 cursor-pointer"
        >
          <p
            className={`text-sm font-medium truncate ${
              isCurrent ? 'text-[var(--color-accent)] font-semibold' : 'text-slate-100'
            }`}
          >
            {song.title}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
        </div>
      </div>

      {/* Center: Album (Desktop only) */}
      <div
        onClick={handleRowClick}
        className="hidden md:block flex-1 max-w-xs px-4 text-xs text-slate-400 truncate cursor-pointer"
      >
        {song.album}
      </div>

      {/* Right: Duration, Like, Menu */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <button
          onClick={() => toggleLikeSong(song.id)}
          className={`p-1.5 rounded-lg transition-colors ${
            isLiked
              ? 'text-rose-500'
              : 'text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
          aria-label="Like"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        <span className="text-xs font-mono text-slate-400 w-10 text-right">
          {formatDuration(song.duration)}
        </span>

        {/* Options Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-[#181a24] border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-30 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  playSong(song, songsList);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
              >
                <Play className="w-3.5 h-3.5 text-purple-400 fill-current" />
                Play Now
              </button>

              <button
                onClick={() => {
                  playNextInQueue(song);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
              >
                <ListPlus className="w-3.5 h-3.5 text-blue-400" />
                Play Next
              </button>

              <button
                onClick={() => {
                  addToQueue(song);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Add to Queue
              </button>

              <button
                onClick={() => {
                  onAddToPlaylist(song);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                Add to Playlist...
              </button>

              <div className="my-1 border-t border-slate-700/60" />

              <button
                onClick={() => {
                  onEdit(song);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-700/60 transition-colors text-left"
              >
                <Edit className="w-3.5 h-3.5 text-amber-400" />
                Edit Metadata
              </button>

              <button
                onClick={() => {
                  onDelete(song);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Song
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

