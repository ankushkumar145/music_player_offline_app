import React, { useState, useMemo } from 'react';
import { Disc, Play, ArrowLeft, Clock } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/library/SongRow';
import EmptyState from '../components/common/EmptyState';
import { formatDuration } from '../utils/formatters';

export default function AlbumsPage() {
  const { songs } = useLibrary();
  const { playQueue } = usePlayer();

  const [selectedAlbum, setSelectedAlbum] = useState(null);

  // Group songs by album
  const albums = useMemo(() => {
    const map = new Map();
    songs.forEach((s) => {
      const name = s.album || 'Unknown Album';
      if (!map.has(name)) {
        map.set(name, {
          name,
          artist: s.artist || 'Unknown Artist',
          songs: [],
          coverArtwork: s.coverArtwork || null,
        });
      }
      const item = map.get(name);
      item.songs.push(s);
      if (!item.coverArtwork && s.coverArtwork) {
        item.coverArtwork = s.coverArtwork;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  const activeAlbumObj = albums.find((a) => a.name === selectedAlbum);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Disc className="w-8 h-8 text-[var(--color-accent)]" />
            Albums
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {albums.length} album{albums.length === 1 ? '' : 's'} in your local library
          </p>
        </div>
      </div>

      {albums.length === 0 ? (
        <EmptyState
          icon={Disc}
          title="No Albums Found"
          description="Import audio files to organize your tracks into albums."
        />
      ) : selectedAlbum && activeAlbumObj ? (
        /* Selected Album View */
        <div className="space-y-6 animate-in fade-in">
          <button
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            All Albums
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800 shadow">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden bg-slate-800 shrink-0 shadow-xl border border-slate-700/50 flex items-center justify-center">
              {activeAlbumObj.coverArtwork ? (
                <img
                  src={activeAlbumObj.coverArtwork}
                  alt={activeAlbumObj.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Disc className="w-16 h-16 text-[var(--color-accent)]" />
              )}
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <span className="text-xs uppercase font-extrabold text-[var(--color-accent)]">Album</span>
              <h2 className="text-2xl sm:text-3xl font-black text-white truncate mt-1">
                {activeAlbumObj.name}
              </h2>
              <p className="text-sm text-slate-300 font-medium mt-1">{activeAlbumObj.artist}</p>
              <p className="text-xs text-slate-400 mt-2">
                {activeAlbumObj.songs.length} track{activeAlbumObj.songs.length === 1 ? '' : 's'} &bull;{' '}
                {formatDuration(
                  activeAlbumObj.songs.reduce((acc, s) => acc + (s.duration || 0), 0)
                )}
              </p>

              <button
                onClick={() => playQueue(activeAlbumObj.songs, 0)}
                className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-white shadow-lg active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                Play Album
              </button>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
            {activeAlbumObj.songs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                songsList={activeAlbumObj.songs}
                onEdit={() => {}}
                onAddToPlaylist={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Albums Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {albums.map((album) => (
            <div
              key={album.name}
              onClick={() => setSelectedAlbum(album.name)}
              className="group p-3.5 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all cursor-pointer flex flex-col"
            >
              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-800 mb-3 shadow flex items-center justify-center">
                {album.coverArtwork ? (
                  <img
                    src={album.coverArtwork}
                    alt={album.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Disc className="w-12 h-12 text-[var(--color-accent)]" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-[var(--color-accent)] transition-colors">
                {album.name}
              </h4>
              <p className="text-xs text-slate-400 truncate mt-0.5">{album.artist}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                {album.songs.length} track{album.songs.length === 1 ? '' : 's'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
