import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { ListMusic, Plus } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import PlaylistCard from '../components/playlist/PlaylistCard';
import EmptyState from '../components/common/EmptyState';

export default function PlaylistsPage() {
  const { openCreatePlaylist } = useOutletContext() || {};
  const { playlists } = useLibrary();

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <ListMusic className="w-8 h-8 text-[var(--color-accent)]" />
            Playlists
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {playlists.length} custom playlist{playlists.length === 1 ? '' : 's'} created
          </p>
        </div>

        <button
          onClick={openCreatePlaylist}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <EmptyState
          title="No Playlists Yet"
          description="Create playlists to organize your favorite songs into personal collections."
          actionText="Create Your First Playlist"
          onAction={openCreatePlaylist}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((pl) => (
            <PlaylistCard key={pl.id} playlist={pl} />
          ))}
        </div>
      )}
    </div>
  );
}
