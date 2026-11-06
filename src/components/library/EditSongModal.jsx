import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Image, Music2, Save } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';
import { blobToDataUrl } from '../../services/metadataService';

export default function EditSongModal({ isOpen, onClose, song }) {
  const { editSong } = useLibrary();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [coverArtwork, setCoverArtwork] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist || '');
      setAlbum(song.album || '');
      setGenre(song.genre || '');
      setCoverArtwork(song.coverArtwork || null);
    }
  }, [song]);

  if (!song) return null;

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
    setIsSubmitting(true);
    try {
      await editSong(song.id, {
        title: title.trim() || song.title,
        artist: artist.trim() || 'Unknown Artist',
        album: album.trim() || 'Unknown Album',
        genre: genre.trim() || 'Unknown',
        coverArtwork,
      });
      onClose();
    } catch (err) {
      // toast shown in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Track Metadata" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Artwork selector */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="relative w-20 h-20 rounded-xl bg-slate-800 shrink-0 overflow-hidden border border-slate-700/60 shadow">
            {coverArtwork ? (
              <img
                src={coverArtwork}
                alt="Track artwork"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-400">
                <Music2 className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-200 mb-1">Cover Artwork</p>
            <p className="text-xs text-slate-400 mb-2">Upload PNG, JPG, or WebP</p>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer border border-slate-700 transition-colors">
              <Image className="w-3.5 h-3.5 text-purple-400" />
              Replace Cover Art
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
                className="block text-[11px] text-rose-400 hover:text-rose-300 mt-1.5"
              >
                Remove artwork
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Track Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
            required
          />
        </div>

        {/* Artist */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Artist
          </label>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Album */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Album
          </label>
          <input
            type="text"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Genre
          </label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

