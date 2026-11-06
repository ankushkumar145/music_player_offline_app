import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Play,
  Upload,
  Music,
  Heart,
  ListMusic,
  Disc,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/library/SongRow';
import SongCard from '../components/library/SongCard';
import PlaylistCard from '../components/playlist/PlaylistCard';
import EmptyState from '../components/common/EmptyState';
import EditSongModal from '../components/library/EditSongModal';
import AddToPlaylistModal from '../components/library/AddToPlaylistModal';
import ConfirmModal from '../components/common/ConfirmModal';

export default function HomePage() {
  const { openImport, openCreatePlaylist } = useOutletContext() || {};
  const { songs, playlists, history, favourites, removeSong } = useLibrary();
  const { playQueue } = usePlayer();
  const navigate = useNavigate();

  const [editingSong, setEditingSong] = useState(null);
  const [playlistTargetSong, setPlaylistTargetSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Recently imported (first 6)
  const recentImports = songs.slice(0, 6);

  // Favourite songs list
  const favouriteSongs = songs.filter((s) => favourites.has(s.id)).slice(0, 6);

  // Distinct albums (first 5)
  const albumMap = new Map();
  songs.forEach((s) => {
    if (s.album && !albumMap.has(s.album)) {
      albumMap.set(s.album, s);
    }
  });
  const popularAlbums = Array.from(albumMap.values()).slice(0, 5);

  const hasMusic = songs.length > 0;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900/80 border border-slate-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs font-semibold mb-4 border border-[var(--color-accent)]/30">
            <Sparkles className="w-3.5 h-3.5" />
            100% Offline Music Player
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {getGreeting()}
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Your personal music library stored right on this device. No servers, no tracking, pure
            high-fidelity playback wherever you go.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 mt-6">
            <button
              onClick={openImport}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-lg shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Import Music
            </button>

            {hasMusic && (
              <button
                onClick={() => playQueue(songs, 0)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Play All ({songs.length})
              </button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-[var(--color-accent)] opacity-10 filter blur-3xl pointer-events-none" />
      </section>

      {/* Empty State when no songs imported yet */}
      {!hasMusic && (
        <EmptyState
          title="Your Offline Library is Empty"
          description="TuneFlow stores your music safely in your browser's IndexedDB. Import MP3, WAV, FLAC, or OGG files from your PC or mobile to get started."
          actionText="Import Audio Files"
          onAction={openImport}
          secondaryActionText="Create Playlist"
          onSecondaryAction={openCreatePlaylist}
        />
      )}

      {hasMusic && (
        <>
          {/* Recently Played */}
          {history.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-[var(--color-accent)]" />
                  <h2 className="text-xl font-bold text-slate-100">Recently Played</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {history.slice(0, 6).map((song) => (
                  <SongCard key={`hist-${song.id}`} song={song} songsList={history} />
                ))}
              </div>
            </section>
          )}

          {/* Quick Access to Playlists */}
          {playlists.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ListMusic className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-bold text-slate-100">Your Playlists</h2>
                </div>
                <button
                  onClick={() => navigate('/playlists')}
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-semibold"
                >
                  View all ({playlists.length})
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {playlists.slice(0, 5).map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Imported Songs */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-100">Recently Imported</h2>
              </div>
              <button
                onClick={() => navigate('/songs')}
                className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-semibold"
              >
                View all songs ({songs.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
              {recentImports.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  songsList={songs}
                  onEdit={(s) => setEditingSong(s)}
                  onAddToPlaylist={(s) => setPlaylistTargetSong(s)}
                  onDelete={(s) => setDeletingSong(s)}
                />
              ))}
            </div>
          </section>

          {/* Favourites Snippet */}
          {favouriteSongs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h2 className="text-xl font-bold text-slate-100">Favourite Tracks</h2>
                </div>
                <button
                  onClick={() => navigate('/favourites')}
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-semibold"
                >
                  View all favourites
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                {favouriteSongs.map((song) => (
                  <SongCard key={`fav-${song.id}`} song={song} songsList={favouriteSongs} />
                ))}
              </div>
            </section>
          )}

          {/* Popular Albums */}
          {popularAlbums.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Disc className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-xl font-bold text-slate-100">Albums in Library</h2>
                </div>
                <button
                  onClick={() => navigate('/albums')}
                  className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 font-semibold"
                >
                  All Albums
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {popularAlbums.map((song) => (
                  <div
                    key={`alb-${song.album}`}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(song.album)}`)}
                    className="group p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow">
                      {song.coverArtwork ? (
                        <img
                          src={song.coverArtwork}
                          alt={song.album}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400">
                          <Disc className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-[var(--color-accent)]">
                      {song.album}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{song.artist}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Edit Song Modal */}
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

