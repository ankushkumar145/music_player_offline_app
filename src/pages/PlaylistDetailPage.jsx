import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  Shuffle,
  Edit,
  Trash2,
  ListMusic,
  ArrowLeft,
  Clock,
  ArrowUp,
  ArrowDown,
  X,
  Music2,
} from 'lucide-react';
import { getPlaylistById } from '../services/playlistService';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/formatters';
import EditPlaylistModal from '../components/playlist/EditPlaylistModal';
import ConfirmModal from '../components/common/ConfirmModal';

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { removePlaylist, removeSongFromPlaylistAction, reorderPlaylistAction } = useLibrary();
  const { currentSong, isPlaying, playSong, playQueue, togglePlayPause } = usePlayer();

  const [playlist, setPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPlaylistById(id);
      if (!data) {
        navigate('/playlists');
        return;
      }
      setPlaylist(data);
    } catch (err) {
      console.error('Failed to load playlist:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20 text-slate-500 text-sm">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) return null;

  const totalDuration = playlist.songs.reduce((acc, s) => acc + (s.duration || 0), 0);

  const handlePlayAll = () => {
    if (playlist.songs.length > 0) {
      playQueue(playlist.songs, 0);
    }
  };

  const handleShufflePlay = () => {
    if (playlist.songs.length > 0) {
      const shuffled = [...playlist.songs].sort(() => Math.random() - 0.5);
      playQueue(shuffled, 0);
    }
  };

  const handleMoveSong = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= playlist.songs.length) return;
    const newSongs = [...playlist.songs];
    const [moved] = newSongs.splice(fromIdx, 1);
    newSongs.splice(toIdx, 0, moved);

    setPlaylist((prev) => ({ ...prev, songs: newSongs }));

    const orderedIds = newSongs.map((s) => s.id);
    await reorderPlaylistAction(playlist.id, orderedIds);
  };

  const handleRemoveSong = async (songId) => {
    await removeSongFromPlaylistAction(playlist.id, songId);
    setPlaylist((prev) => ({
      ...prev,
      songs: prev.songs.filter((s) => s.id !== songId),
    }));
  };

  const handleDeletePlaylist = async () => {
    await removePlaylist(playlist.id);
    navigate('/playlists');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={() => navigate('/playlists')}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </button>

      {/* Playlist Hero Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 via-slate-900/60 to-slate-900/40 border border-slate-800/80 shadow-2xl">
        {/* Cover Art */}
        <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-2xl border border-slate-700/50 flex items-center justify-center">
          {playlist.coverArtwork ? (
            <img
              src={playlist.coverArtwork}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-slate-900 flex items-center justify-center text-[var(--color-accent)]">
              <ListMusic className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[var(--color-accent)]">
            Playlist
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1 mb-2 truncate">
            {playlist.name}
          </h1>
          {playlist.description && (
            <p className="text-sm text-slate-300 max-w-xl mb-4 leading-relaxed">
              {playlist.description}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-400">
            <span>{playlist.songs.length} tracks</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(totalDuration)}
            </span>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
            {playlist.songs.length > 0 && (
              <>
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-lg active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play
                </button>
                <button
                  onClick={handleShufflePlay}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/60 transition-all cursor-pointer"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </>
            )}

            <button
              onClick={() => setIsEditOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Edit Playlist"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsDeleteOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 transition-colors"
              title="Delete Playlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track List */}
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-3 px-2">
          Tracklist ({playlist.songs.length})
        </h3>

        {playlist.songs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-dashed border-slate-800">
            <p className="text-sm text-slate-400">This playlist has no songs yet.</p>
            <p className="text-xs text-slate-500 mt-1">
              Go to the Music Library to add tracks to this playlist.
            </p>
            <button
              onClick={() => navigate('/songs')}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
            >
              Go to Songs
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
            {playlist.songs.map((song, idx) => {
              const isCurrent = currentSong?.id === song.id;
              return (
                <div
                  key={`${song.id}-${idx}`}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isCurrent
                      ? 'bg-[var(--color-accent-light)] text-white'
                      : 'hover:bg-slate-800/50 text-slate-300'
                  }`}
                >
                  {/* Left: Track # & Details */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <span className="text-xs font-mono text-slate-500 w-6 text-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Play trigger button */}
                    <button
                      onClick={() => {
                        if (isCurrent) togglePlayPause();
                        else playSong(song, playlist.songs);
                      }}
                      className="w-10 h-10 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative group/btn flex items-center justify-center cursor-pointer"
                    >
                      {song.coverArtwork ? (
                        <img
                          src={song.coverArtwork}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Music2 className="w-5 h-5 text-purple-400" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-current" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                        )}
                      </div>
                    </button>

                    <div
                      className="min-w-0 flex-1 cursor-pointer"
                      onClick={() => {
                        if (isCurrent) togglePlayPause();
                        else playSong(song, playlist.songs);
                      }}
                    >
                      <p
                        className={`text-sm font-semibold truncate ${
                          isCurrent ? 'text-[var(--color-accent)]' : 'text-slate-100'
                        }`}
                      >
                        {song.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                    </div>
                  </div>

                  {/* Right: Reorder & Remove Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="text-xs font-mono text-slate-400">
                      {formatDuration(song.duration)}
                    </span>

                    {/* Move Up/Down buttons */}
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleMoveSong(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20 rounded"
                        title="Move up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveSong(idx, idx + 1)}
                        disabled={idx === playlist.songs.length - 1}
                        className="p-1 text-slate-500 hover:text-white disabled:opacity-20 rounded"
                        title="Move down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Remove from playlist */}
                    <button
                      onClick={() => handleRemoveSong(song.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                      title="Remove from playlist"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          loadData();
        }}
        playlist={playlist}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeletePlaylist}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlist.name}"? The songs inside will remain in your library.`}
        confirmText="Delete Playlist"
      />
    </div>
  );
}
