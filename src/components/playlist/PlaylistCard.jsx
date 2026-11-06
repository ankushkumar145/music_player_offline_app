import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListMusic, Play } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { getPlaylistById } from '../../services/playlistService';

export default function PlaylistCard({ playlist }) {
  const navigate = useNavigate();
  const { playQueue } = usePlayer();

  const handlePlayPlaylist = async (e) => {
    e.stopPropagation();
    try {
      const pl = await getPlaylistById(playlist.id);
      if (pl && pl.songs?.length > 0) {
        playQueue(pl.songs, 0);
      }
    } catch (err) {
      console.warn('Could not play playlist:', err);
    }
  };

  return (
    <div
      onClick={() => navigate(`/playlists/${playlist.id}`)}
      className="group relative p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Artwork container */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3.5 shadow-md flex items-center justify-center">
        {playlist.coverArtwork ? (
          <img
            src={playlist.coverArtwork}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-slate-900 flex items-center justify-center text-[var(--color-accent)]">
            <ListMusic className="w-12 h-12" />
          </div>
        )}

        {/* Hover Play Button */}
        {playlist.songCount > 0 && (
          <button
            onClick={handlePlayPlaylist}
            className="absolute bottom-3 right-3 w-11 h-11 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 active:scale-95 cursor-pointer"
            title="Play entire playlist"
            aria-label="Play playlist"
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </button>
        )}
      </div>

      {/* Info */}
      <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-[var(--color-accent)] transition-colors">
        {playlist.name}
      </h4>
      <p className="text-xs text-slate-400 mt-1">
        {playlist.songCount || 0} track{(playlist.songCount || 0) === 1 ? '' : 's'}
      </p>
    </div>
  );
}

