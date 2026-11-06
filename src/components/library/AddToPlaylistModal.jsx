import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Plus, ListMusic, Check } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';

export default function AddToPlaylistModal({ isOpen, onClose, song }) {
  const { playlists, addPlaylist, addSongsToPlaylistAction } = useLibrary();
  const toast = useToast();

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!song) return null;

  const handleAddToPlaylist = async (playlistId) => {
    try {
      await addSongsToPlaylistAction(playlistId, [song.id]);
      onClose();
    } catch (e) {
      // toast shown in context
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const pl = await addPlaylist({
        name: newPlaylistName.trim(),
        description: '',
      });
      await addSongsToPlaylistAction(pl.id, [song.id]);
      setNewPlaylistName('');
      setIsCreating(false);
      onClose();
    } catch (e) {
      // toast shown in context
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add to Playlist" maxWidth="max-w-sm">
      <div className="flex flex-col gap-4">
        {/* Track summary */}
        <p className="text-xs text-slate-400">
          Adding <strong className="text-slate-200">"{song.title}"</strong> to:
        </p>

        {/* Existing playlists list */}
        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
          {playlists.length === 0 ? (
            <p className="text-xs text-slate-500 italic p-3 text-center">
              No playlists found. Create one below!
            </p>
          ) : (
            playlists.map((pl) => (
              <button
                key={pl.id}
                onClick={() => handleAddToPlaylist(pl.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 border border-slate-800/40 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-purple-400 shrink-0">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate group-hover:text-[var(--color-accent)]">
                      {pl.name}
                    </p>
                    <p className="text-xs text-slate-500">{pl.songCount || 0} songs</p>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-400 group-hover:text-white" />
              </button>
            ))
          )}
        </div>

        {/* Create inline playlist toggle */}
        <div className="pt-3 border-t border-slate-800">
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[var(--color-accent)]" />
              New Playlist
            </button>
          ) : (
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="Playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] cursor-pointer"
              >
                Create
              </button>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}

