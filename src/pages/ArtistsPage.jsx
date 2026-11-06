import React, { useState, useMemo } from 'react';
import { Users, Music2, Play, ArrowLeft } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { usePlayer } from '../context/PlayerContext';
import SongRow from '../components/library/SongRow';
import EmptyState from '../components/common/EmptyState';

export default function ArtistsPage() {
  const { songs } = useLibrary();
  const { playQueue } = usePlayer();

  const [selectedArtist, setSelectedArtist] = useState(null);

  // Group songs by artist
  const artists = useMemo(() => {
    const map = new Map();
    songs.forEach((s) => {
      const name = s.artist || 'Unknown Artist';
      if (!map.has(name)) {
        map.set(name, {
          name,
          songs: [],
          albums: new Set(),
          coverArtwork: s.coverArtwork || null,
        });
      }
      const item = map.get(name);
      item.songs.push(s);
      if (s.album) item.albums.add(s.album);
      if (!item.coverArtwork && s.coverArtwork) {
        item.coverArtwork = s.coverArtwork;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [songs]);

  const activeArtistObj = artists.find((a) => a.name === selectedArtist);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[var(--color-accent)]" />
            Artists
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {artists.length} artist{artists.length === 1 ? '' : 's'} represented in your offline collection
          </p>
        </div>
      </div>

      {artists.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Artists Found"
          description="Import music to automatically discover artists in your offline library."
        />
      ) : selectedArtist && activeArtistObj ? (
        /* Selected Artist View */
        <div className="space-y-6 animate-in fade-in">
          <button
            onClick={() => setSelectedArtist(null)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            All Artists
          </button>

          <div className="flex items-center gap-5 p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 shrink-0 shadow flex items-center justify-center border border-slate-700/60">
              {activeArtistObj.coverArtwork ? (
                <img
                  src={activeArtistObj.coverArtwork}
                  alt={activeArtistObj.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-10 h-10 text-[var(--color-accent)]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-xs uppercase font-bold text-[var(--color-accent)]">Artist</span>
              <h2 className="text-2xl font-bold text-white truncate">{activeArtistObj.name}</h2>
              <p className="text-xs text-slate-400 mt-1">
                {activeArtistObj.songs.length} song{activeArtistObj.songs.length === 1 ? '' : 's'} &bull;{' '}
                {activeArtistObj.albums.size} album{activeArtistObj.albums.size === 1 ? '' : 's'}
              </p>
            </div>

            <button
              onClick={() => playQueue(activeArtistObj.songs, 0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-white shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Play Artist
            </button>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-2 sm:p-3 divide-y divide-slate-800/40">
            {activeArtistObj.songs.map((song, idx) => (
              <SongRow
                key={song.id}
                song={song}
                index={idx}
                songsList={activeArtistObj.songs}
                onEdit={() => {}}
                onAddToPlaylist={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Grid of artists */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {artists.map((artist) => (
            <div
              key={artist.name}
              onClick={() => setSelectedArtist(artist.name)}
              className="group p-4 rounded-2xl bg-slate-900/40 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-700/80 transition-all text-center cursor-pointer flex flex-col items-center"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-slate-800 mb-3 shadow-md flex items-center justify-center border border-slate-700/50 group-hover:scale-105 transition-transform">
                {artist.coverArtwork ? (
                  <img
                    src={artist.coverArtwork}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-10 h-10 text-[var(--color-accent)]" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-slate-100 truncate w-full group-hover:text-[var(--color-accent)] transition-colors">
                {artist.name}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                {artist.songs.length} track{artist.songs.length === 1 ? '' : 's'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
