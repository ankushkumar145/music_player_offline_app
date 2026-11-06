import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Music, Users, Disc, ListMusic, X } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import SongRow from '../components/library/SongRow';
import PlaylistCard from '../components/playlist/PlaylistCard';
import EditSongModal from '../components/library/EditSongModal';
import AddToPlaylistModal from '../components/library/AddToPlaylistModal';
import ConfirmModal from '../components/common/ConfirmModal';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryParam = searchParams.get('q') || '';

  const [query, setQuery] = useState(queryParam);
  const { songs, playlists, removeSong } = useLibrary();

  const [editingSong, setEditingSong] = useState(null);
  const [playlistTargetSong, setPlaylistTargetSong] = useState(null);
  const [deletingSong, setDeletingSong] = useState(null);

  useEffect(() => {
    setQuery(queryParam);
  }, [queryParam]);

  const handleQueryChange = (val) => {
    setQuery(val);
    if (val.trim()) {
      setSearchParams({ q: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { songs: [], artists: [], albums: [], playlists: [] };
    }

    // Matching songs
    const matchedSongs = songs.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.artist?.toLowerCase().includes(q) ||
        s.album?.toLowerCase().includes(q) ||
        s.genre?.toLowerCase().includes(q)
    );

    // Matching artists
    const artistSet = new Set();
    songs.forEach((s) => {
      if (s.artist && s.artist.toLowerCase().includes(q)) {
        artistSet.add(s.artist);
      }
    });

    // Matching albums
    const albumMap = new Map();
    songs.forEach((s) => {
      if (s.album && s.album.toLowerCase().includes(q)) {
        if (!albumMap.has(s.album)) {
          albumMap.set(s.album, s);
        }
      }
    });

    // Matching playlists
    const matchedPlaylists = playlists.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );

    return {
      songs: matchedSongs,
      artists: Array.from(artistSet),
      albums: Array.from(albumMap.values()),
      playlists: matchedPlaylists,
    };
  }, [query, songs, playlists]);

  const hasResults =
    results.songs.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0 ||
    results.playlists.length > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Search Bar Input */}
      <div className="relative max-w-2xl">
        <SearchIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by title, artist, album, or playlist..."
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          autoFocus
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-900 border border-slate-700/80 focus:border-[var(--color-accent)] text-base text-slate-100 placeholder-slate-500 focus:outline-none shadow-xl transition-all"
        />
        {query && (
          <button
            onClick={() => handleQueryChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!query.trim() ? (
        <div className="p-12 text-center text-slate-500 rounded-2xl border border-dashed border-slate-800">
          <SearchIcon className="w-10 h-10 mx-auto mb-3 opacity-40 text-purple-400" />
          <h3 className="text-base font-semibold text-slate-300">Instant Offline Search</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Type anything above to instantly query your locally saved songs, artists, albums, and playlists without an internet connection.
          </p>
        </div>
      ) : !hasResults ? (
        <div className="p-12 text-center text-slate-400 rounded-2xl border border-dashed border-slate-800">
          <p className="text-base font-medium">No results found for "{query}"</p>
          <p className="text-xs text-slate-500 mt-1">Check the spelling or try searching another keyword.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Songs Results */}
          {results.songs.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Music className="w-5 h-5 text-[var(--color-accent)]" />
                Songs ({results.songs.length})
              </h2>
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
                {results.songs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    songsList={results.songs}
                    onEdit={(s) => setEditingSong(s)}
                    onAddToPlaylist={(s) => setPlaylistTargetSong(s)}
                    onDelete={(s) => setDeletingSong(s)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists Results */}
          {results.artists.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                Artists ({results.artists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {results.artists.map((artistName) => (
                  <div
                    key={artistName}
                    onClick={() => navigate('/artists')}
                    className="p-4 rounded-xl bg-slate-900/40 hover:bg-slate-800 border border-slate-800/80 transition-all text-center cursor-pointer"
                  >
                    <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto mb-2 flex items-center justify-center text-purple-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-200 truncate">{artistName}</p>
                    <span className="text-[11px] text-slate-500">Artist</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums Results */}
          {results.albums.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Disc className="w-5 h-5 text-cyan-400" />
                Albums ({results.albums.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {results.albums.map((item) => (
                  <div
                    key={item.album}
                    onClick={() => navigate('/albums')}
                    className="p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800 transition-all cursor-pointer"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-2.5 flex items-center justify-center">
                      {item.coverArtwork ? (
                        <img
                          src={item.coverArtwork}
                          alt={item.album}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Disc className="w-10 h-10 text-cyan-400" />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-100 truncate">{item.album}</p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{item.artist}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Results */}
          {results.playlists.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-emerald-400" />
                Playlists ({results.playlists.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {results.playlists.map((pl) => (
                  <PlaylistCard key={pl.id} playlist={pl} />
                ))}
              </div>
            </section>
          )}
        </div>
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
