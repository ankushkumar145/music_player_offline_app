import React from 'react';
import { Play, Pause, Music2, Heart } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { useLibrary } from '../../context/LibraryContext';

export default function SongCard({ song, songsList = [] }) {
  const { currentSong, isPlaying, playSong, togglePlayPause } = usePlayer();
  const { favourites, toggleLikeSong } = useLibrary();

  const isCurrent = currentSong?.id === song.id;
  const isLiked = favourites.has(song.id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, songsList);
    }
  };

  return (
    <div
      onClick={handlePlay}
      className={`group relative p-3 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
        isCurrent
          ? 'bg-slate-800/80 border-[var(--color-accent)] shadow-lg'
          : 'bg-slate-900/40 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700/80'
      }`}
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow-md">
        {song.coverArtwork ? (
          <img
            src={song.coverArtwork}
            alt={song.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-purple-400">
            <Music2 className="w-10 h-10" />
          </div>
        )}

        {/* Floating Play Button */}
        <button
          onClick={handlePlay}
          className={`absolute bottom-2.5 right-2.5 w-10 h-10 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center shadow-xl transition-all duration-200 active:scale-95 ${
            isCurrent
              ? 'opacity-100 scale-100'
              : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
          }`}
          aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        {/* Like Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLikeSong(song.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-sm transition-all ${
            isLiked
              ? 'text-rose-500 opacity-100'
              : 'text-slate-300 opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Details */}
      <h4
        className={`text-sm font-semibold truncate ${
          isCurrent ? 'text-[var(--color-accent)]' : 'text-slate-100'
        }`}
      >
        {song.title}
      </h4>
      <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
    </div>
  );
}

