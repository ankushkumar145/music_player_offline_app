import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Music,
  Play,
  Shuffle,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  Upload,
  Trash2,
  ListPlus,
  CheckSquare,
  Square,
  Filter,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/library/SongRow';
import SongCard from '../components/library/SongCard';
import EmptyState from '../components/common/EmptyState';
import EditSongModal from '../components/library/EditSongModal';
import AddToPlaylistModal from '../components/library/AddToPlaylistModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { formatBytes } from '../utils/formatters';

export default function SongsPage() {
  const { openImport } = useOutletContext() || {};
  const { songs, removeSong, removeMultipleSongs } = useLibrary();
  const { playQueue } = usePlayer();

  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded'); // 'title' | 'artist' | 'album' | 'duration' | 'dateAdded'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'

  // Bulk selection mode
  const [selectedSongIds, setSelectedSongIds] = useState(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);

  // Modals state
  const [editingSong, setEditingSong] = useState(null);
  const [playlistTargetSong, setPlaylistTargetSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);
  const [isConfirmBulkDelete, setIsConfirmBulkDelete] = useState(false);

  // Filter & Sort
  const processedSongs = useMemo(() => {
    let result = [...songs];

    // Filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.artist?.toLowerCase().includes(q) ||
          s.album?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
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

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [songs, searchFilter, sortBy, sortDirection]);

  // Bulk selection helpers
  const toggleSelectSong = (id) => {
    setSelectedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedSongIds.size === processedSongs.length) {
      setSelectedSongIds(new Set());
    } else {
      setSelectedSongIds(new Set(processedSongs.map((s) => s.id)));
    }
  };

  const handleBulkDelete = async () => {
    await removeMultipleSongs(Array.from(selectedSongIds));
    setSelectedSongIds(new Set());
    setIsBulkMode(false);
  };

  const handleShufflePlay = () => {
    if (processedSongs.length === 0) return;
    const shuffled = [...processedSongs].sort(() => Math.random() - 0.5);
    playQueue(shuffled, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Music className="w-8 h-8 text-[var(--color-accent)]" />
            Music Library
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {songs.length} song{songs.length === 1 ? '' : 's'} stored offline in your browser
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {songs.length > 0 && (
            <>
              <button
                onClick={() => playQueue(processedSongs, 0)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg transition-all active:scale-95 cursor-pointer"
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
            </>
          )}

          <button
            onClick={openImport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-purple-400" />
            Import
          </button>
        </div>
      </div>

      {songs.length === 0 ? (
        <EmptyState
          title="No Songs in Library"
          description="Import your audio files (MP3, WAV, FLAC, OGG, M4A) to start listening offline."
          actionText="Import Music"
          onAction={openImport}
        />
      ) : (
        <>
          {/* Controls Bar: Search, Sort, View, Bulk */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
            {/* Filter Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title, artist, album..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-[var(--color-accent)]"
              />
            </div>

            {/* Sort & View Options */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
                >
                  <option value="dateAdded" className="bg-slate-900">Date Added</option>
                  <option value="title" className="bg-slate-900">Title</option>
                  <option value="artist" className="bg-slate-900">Artist</option>
                  <option value="album" className="bg-slate-900">Album</option>
                  <option value="duration" className="bg-slate-900">Duration</option>
                </select>
                <button
                  onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="text-slate-400 hover:text-white px-1 text-[11px] font-mono uppercase"
                  title="Toggle Ascending/Descending"
                >
                  {sortDirection}
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Bulk Select Toggle */}
              <button
                onClick={() => {
                  setIsBulkMode(!isBulkMode);
                  setSelectedSongIds(new Set());
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isBulkMode
                    ? 'bg-purple-950/40 border-purple-700 text-purple-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {isBulkMode ? 'Done' : 'Select'}
              </button>
            </div>
          </div>

          {/* Bulk Action Bar (if active) */}
          {isBulkMode && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1.5 text-purple-200 hover:text-white font-medium cursor-pointer"
                >
                  {selectedSongIds.size === processedSongs.length ? (
                    <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  Select All ({processedSongs.length})
                </button>
                <span className="text-purple-300">
                  {selectedSongIds.size} song{selectedSongIds.size === 1 ? '' : 's'} selected
                </span>
              </div>

              {selectedSongIds.size > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsConfirmBulkDelete(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete ({selectedSongIds.size})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Song Listing */}
          {processedSongs.length === 0 ? (
            <p className="text-center text-slate-500 py-12 text-sm italic">
              No songs matched your filter "{searchFilter}".
            </p>
          ) : viewMode === 'list' ? (
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
              {processedSongs.map((song, idx) => (
                <div key={song.id} className="flex items-center">
                  {isBulkMode && (
                    <button
                      onClick={() => toggleSelectSong(song.id)}
                      className="p-2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {selectedSongIds.has(song.id) ? (
                        <CheckSquare className="w-4 h-4 text-[var(--color-accent)]" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <SongRow
                      song={song}
                      index={idx}
                      songsList={processedSongs}
                      onEdit={(s) => setEditingSong(s)}
                      onAddToPlaylist={(s) => setPlaylistTargetSong(s)}
                      onDelete={(s) => setDeletingSong(s)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {processedSongs.map((song) => (
                <SongCard key={song.id} song={song} songsList={processedSongs} />
              ))}
            </div>
          )}
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

      {/* Delete Single Song Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingSong)}
        onClose={() => setDeletingSong(null)}
        onConfirm={() => {
          if (deletingSong) removeSong(deletingSong.id);
        }}
        title="Delete Song"
        message={`Are you sure you want to delete "${deletingSong?.title}"? This permanently removes the audio file from your browser's storage.`}
        confirmText="Delete Song"
      />

      {/* Bulk Delete Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmBulkDelete}
        onClose={() => setIsConfirmBulkDelete(false)}
        onConfirm={handleBulkDelete}
        title="Delete Selected Songs"
        message={`Are you sure you want to delete ${selectedSongIds.size} songs from your device? This cannot be undone.`}
        confirmText={`Delete ${selectedSongIds.size} Songs`}
      />
    </div>
  );
}
