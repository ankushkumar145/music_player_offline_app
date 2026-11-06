import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Image, ListMusic, Plus } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { blobToDataUrl } from '../../services/metadataService';

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const { addPlaylist } = useLibrary();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [coverArtwork, setCoverArtwork] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleArtworkChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await blobToDataUrl(file);
        setCoverArtwork(dataUrl);
      } catch (err) {
        console.error('Failed to read image file:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await addPlaylist({
        name: name.trim(),
        description: description.trim(),
        coverArtwork,
      });
      setName('');
      setDescription('');
      setCoverArtwork(null);
      onClose();
    } catch (e) {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Playlist" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Custom Artwork */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="relative w-20 h-20 rounded-xl bg-slate-800 shrink-0 overflow-hidden border border-slate-700/60 shadow flex items-center justify-center">
            {coverArtwork ? (
              <img
                src={coverArtwork}
                alt="Playlist artwork preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ListMusic className="w-8 h-8 text-[var(--color-accent)]" />
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200 mb-1">Playlist Artwork</p>
            <p className="text-xs text-slate-400 mb-2">Optional custom cover image</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer border border-slate-700 transition-colors">
              <Image className="w-3.5 h-3.5 text-purple-400" />
              Choose Artwork
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleArtworkChange}
              />
            </label>
            {coverArtwork && (
              <button
                type="button"
                onClick={() => setCoverArtwork(null)}
                className="block text-[11px] text-rose-400 hover:text-rose-300 mt-1"
              >
                Clear artwork
              </button>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Playlist Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            placeholder="My Awesome Playlist"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
            required
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Description
          </label>
          <textarea
            placeholder="Give your playlist a memorable description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {isSubmitting ? 'Creating...' : 'Create Playlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

