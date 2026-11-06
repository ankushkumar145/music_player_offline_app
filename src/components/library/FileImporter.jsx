import React, { useState, useRef } from 'react';
import Modal from '../common/Modal';
import { Upload, FolderUp, Music2, Sparkles, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { importAudioFiles, saveSong } from '../../services/songService';
import { generateSyntheticTrack } from '../../utils/audioUtils';
import { generateId } from '../../utils/formatters';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';

export default function FileImporter({ isOpen, onClose }) {
  const { loadLibrary } = useLibrary();
  const toast = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    setResult(null);
    setProgress({ current: 0, total: fileList.length, fileName: 'Reading files...' });

    try {
      const res = await importAudioFiles(fileList, (current, total, fileName) => {
        setProgress({ current, total, fileName });
      });

      setResult(res);
      await loadLibrary();

      if (res.imported.length > 0) {
        toast.success(`Imported ${res.imported.length} track${res.imported.length > 1 ? 's' : ''}`);
      }
      if (res.errors.length > 0) {
        toast.warning(`${res.errors.length} file(s) could not be imported`);
      }
    } catch (err) {
      console.error('Import error:', err);
      toast.error('Failed to import files: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Generate offline synthetic track
  const handleGenerateSample = async (style = 'ambient') => {
    setIsProcessing(true);
    const isSynthwave = style === 'synthwave';
    const trackTitle = isSynthwave ? 'Neon Horizon (Synthwave Demo)' : 'Celestial Reverie (Ambient Demo)';
    const trackArtist = isSynthwave ? 'Retro Pulse Wave' : 'TuneFlow Synthesizer';
    const trackAlbum = isSynthwave ? 'Cyber Arcade 1984' : 'Offline Echoes';
    const trackGenre = isSynthwave ? 'Synthwave' : 'Ambient';

    setProgress({ current: 1, total: 1, fileName: `Synthesizing ${trackTitle}...` });
    try {
      const synth = await generateSyntheticTrack({
        title: trackTitle,
        artist: trackArtist,
        style,
        duration: isSynthwave ? 14 : 12,
      });

      const songRecord = {
        id: generateId(),
        title: trackTitle,
        artist: trackArtist,
        album: trackAlbum,
        genre: trackGenre,
        duration: synth.duration,
        fileName: `${trackTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.wav`,
        fileSize: synth.blob.size,
        mimeType: 'audio/wav',
        audioBlob: synth.blob,
        coverArtwork: null,
        dateAdded: new Date().toISOString(),
      };

      await saveSong(songRecord);
      await loadLibrary();
      toast.success(`Generated "${trackTitle}" offline track!`);
      onClose();
    } catch (e) {
      console.error('Sample generation failed:', e);
      toast.error('Failed to generate sample: ' + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setResult(null);
    setProgress({ current: 0, total: 0, fileName: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="Import Music to Device" maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        {/* Notice */}
        <p className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <strong className="text-slate-300">100% Local & Private:</strong> Audio files are stored
          directly inside your browser's IndexedDB. They never leave your device or upload to any server.
        </p>

        {/* Processing State */}
        {isProcessing && (
          <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-800/40 flex flex-col items-center text-center">
            <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mb-3" />
            <h4 className="text-base font-semibold text-slate-200 mb-1">
              Importing Audio Files...
            </h4>
            <p className="text-xs text-slate-400 max-w-xs truncate mb-4">
              {progress.fileName} ({progress.current}/{progress.total})
            </p>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[var(--color-accent)] h-full transition-all duration-300"
                style={{
                  width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Success / Result State */}
        {!isProcessing && result && (
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex flex-col items-center text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <h4 className="text-base font-semibold text-slate-200">
              Successfully Imported {result.imported.length} Track{result.imported.length > 1 ? 's' : ''}!
            </h4>
            {result.errors.length > 0 && (
              <p className="text-xs text-amber-400 mt-1">
                {result.errors.length} file(s) were skipped or unsupported.
              </p>
            )}
            <button
              onClick={resetAndClose}
              className="mt-4 px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer"
            >
              Done & View Library
            </button>
          </div>
        )}

        {/* Drop Zone */}
        {!isProcessing && !result && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-8 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-[var(--color-accent)] bg-purple-950/20 scale-[1.01]'
                  : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center text-[var(--color-accent)] mb-3 shadow">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-base font-semibold text-slate-200 mb-1">
                Drag & drop audio files here
              </p>
              <p className="text-xs text-slate-400 max-w-xs mb-3">
                Supports MP3, WAV, FLAC, OGG, M4A, AAC, and WebM audio formats.
              </p>
              <span className="text-xs text-[var(--color-accent)] font-medium underline">
                Browse files on your computer
              </span>
            </div>

            {/* Hidden Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac,.webm"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            <input
              ref={folderInputRef}
              type="file"
              webkitdirectory=""
              directory=""
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Folder Import Button */}
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-sm font-medium transition-all cursor-pointer"
            >
              <FolderUp className="w-4 h-4 text-purple-400" />
              Import Music Folder
            </button>

            {/* Instant Offline Demo Tracks */}
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2 font-medium">Don't have music files on hand? Try an offline synthesized demo:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerateSample('ambient')}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-800/50 text-purple-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Ambient Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateSample('synthwave')}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-800/50 text-cyan-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Synthwave Demo
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
