import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Shuffle, ArrowUpDown, Music2 } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/library/SongRow';
import EmptyState from '../components/common/EmptyState';
import EditSongModal from '../components/library/EditSongModal';
import AddToPlaylistModal from '../components/library/AddToPlaylistModal';
import ConfirmModal from '../components/common/ConfirmModal';

export default function FavouritesPage() {
  const { songs, favourites, removeSong } = useLibrary();
  const { playQueue } = usePlayer();
  const navigate = useNavigate();

  const [sortBy, setSortBy] = useState('dateAdded'); // 'dateAdded' | 'title' | 'artist' | 'duration'
  const [sortDir, setSortDir] = useState('desc');

  const [editingSong, setEditingSong] = useState(null);
  const [playlistTargetSong, setPlaylistTargetSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);

  const favouriteSongs = useMemo(() => {
    const favs = songs.filter((s) => favourites.has(s.id));
    favs.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';

      if (sortBy === 'duration') {
        valA = Number(valA) || 0;
        valB = Number(valB) || 0;
      } else if (sortBy === 'dateAdded') {
        valA = new Date(valA).getTime() || 0;
        valB = new Date(valB).getTime() || 0;
      } else {
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return favs;
  }, [songs, favourites, sortBy, sortDir]);

  const handlePlayAll = () => {
    if (favouriteSongs.length > 0) {
      playQueue(favouriteSongs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (favouriteSongs.length > 0) {
      const shuffled = [...favouriteSongs].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Favourite Songs</h1>
            <p className="text-sm text-slate-400">
              {favouriteSongs.length} track{favouriteSongs.length === 1 ? '' : 's'} you love
            </p>
          </div>
        </div>

        {favouriteSongs.length > 0 && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Play All
            </button>
            <button
              onClick={handleShufflePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              Shuffle
            </button>
          </div>
        )}
      </div>

      {favouriteSongs.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Favourites Yet"
          description="Click the heart icon on any song in your library to add it to your favourites collection."
          actionText="Browse Library"
          onAction={() => navigate('/songs')}
        />
      ) : (
        <>
          {/* Sorting controls */}
          <div className="flex items-center justify-end gap-2 bg-slate-900/30 p-2.5 rounded-xl border border-slate-800/60 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="dateAdded" className="bg-slate-900">Date Added</option>
              <option value="title" className="bg-slate-900">Title</option>
              <option value="artist" className="bg-slate-900">Artist</option>
              <option value="duration" className="bg-slate-900">Duration</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
              className="text-slate-400 hover:text-white px-1 uppercase font-mono"
            >
              {sortDir}
            </button>
          </div>

          {/* Song list */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
            {favouriteSongs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                songsList={favouriteSongs}
                onEdit={(s) => setEditingSong(s)}
                onAddToPlaylist={(s) => setPlaylistTargetSong(s)}
                onDelete={(s) => setDeletingSong(s)}
              />
            ))}
          </div>
        </>
      )}

      {/* Edit Modal */}
      <EditSongModal
        isOpen={Boolean(editingSong)}
        onClose={() => setEditingSong(null)}
        song={editingSong}
      />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        isOpen={Boolean(playlistTargetSong)}
        onClose={() => setPlaylistTargetSong(null)}
        song={playlistTargetSong}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSong)}
        onClose={() => setDeletingSong(null)}
        onConfirm={() => {
          if (deletingSong) removeSong(deletingSong.id);
        }}
        title="Delete Track"
        message={`Are you sure you want to remove "${deletingSong?.title}" from your offline library?`}
        confirmText="Delete Track"
      />
    </div>
  );
}
