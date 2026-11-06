import React, { useState } from 'react';
import {
  HardDrive,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  Database,
  Music2,
  Image,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';
import { requestStoragePersistence } from '../services/storageService';
import { useToast } from '../context/ToastContext';
import { formatBytes } from '../utils/formatters';
import ConfirmModal from '../components/common/ConfirmModal';

export default function StoragePage() {
  const { songs, storageStats, refreshStats, removeSong, clearEntireLibraryAction } = useLibrary();
  const toast = useToast();

  const [isRequestingPersist, setIsRequestingPersist] = useState(false);
  const [isConfirmClearAll, setIsConfirmClearAll] = useState(false);
  const [deletingSong, setDeletingSong] = useState(null);

  const handleRequestPersist = async () => {
    setIsRequestingPersist(true);
    try {
      const granted = await requestStoragePersistence();
      await refreshStats();
      if (granted) {
        toast.success('Persistent browser storage granted!');
      } else {
        toast.info(
          'Persistent storage was not granted by browser (depends on bookmarking/installation).'
        );
      }
    } catch (e) {
      toast.error('Failed to request persistent storage');
    } finally {
      setIsRequestingPersist(false);
    }
  };

  const quota = storageStats?.quotaEstimate;
  const totalAudioBytes = storageStats?.totalAudioBytes || 0;
  const totalArtworkBytes = storageStats?.totalArtworkBytes || 0;
  const totalBytesUsed = storageStats?.totalBytesUsed || 0;
  const isPersisted = storageStats?.isPersisted;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-[var(--color-accent)]" />
            Storage Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor and control your offline music data in device storage
          </p>
        </div>

        <button
          onClick={refreshStats}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold border border-slate-700/60 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Storage Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Music Files */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Music2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Offline Songs</p>
            <h3 className="text-2xl font-black text-white">{songs.length}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Stored as IndexedDB Blobs</p>
          </div>
        </div>

        {/* Music Storage Used */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Music Storage Used</p>
            <h3 className="text-2xl font-black text-white">{formatBytes(totalBytesUsed)}</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Audio: {formatBytes(totalAudioBytes)} &bull; Art: {formatBytes(totalArtworkBytes)}
            </p>
          </div>
        </div>

        {/* Persistence Status */}
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isPersisted
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}
            >
              {isPersisted ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-slate-400">Storage Persistence</p>
              <h3 className="text-base font-bold text-white">
                {isPersisted ? 'Persistent' : 'Best-effort'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isPersisted ? 'Protected from eviction' : 'May be evicted if device fills'}
              </p>
            </div>
          </div>

          {!isPersisted && (
            <button
              onClick={handleRequestPersist}
              disabled={isRequestingPersist}
              className="px-3 py-1.5 rounded-xl bg-[var(--color-accent)] text-white text-xs font-semibold hover:bg-[var(--color-accent-hover)] transition-all cursor-pointer shadow-sm shrink-0"
            >
              Protect Storage
            </button>
          )}
        </div>
      </div>

      {/* Quota Progress Bar (if supported) */}
      {quota?.supported && (
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">Browser Storage Quota</span>
            <span className="text-slate-400 font-mono">
              {formatBytes(quota.usage || 0)} used of {formatBytes(quota.quota || 0)} (
              {quota.percentUsed.toFixed(1)}%)
            </span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="bg-[var(--color-accent)] h-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(1, quota.percentUsed))}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            Storage quota is allocated automatically by your browser based on available free disk space on this device.
          </p>
        </div>
      )}

      {/* Browser Storage Policy Explanation Box */}
      <div className="p-6 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-xs text-slate-300 space-y-2.5">
        <h4 className="text-sm font-bold text-purple-200 flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-400" />
          Understanding Offline Browser Storage & Eviction Policies
        </h4>
        <p className="leading-relaxed">
          TuneFlow stores all imported audio files as binary Blobs directly inside your device's{' '}
          <strong>IndexedDB</strong> engine. Unlike remote music services, nothing is uploaded to the cloud.
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400">
          <li>
            <strong>Mobile browsers (iOS Safari & Chrome Android)</strong>: Devices running critically low on disk space may automatically evict non-persistent website data. Installing TuneFlow as a PWA or requesting persistence prevents eviction.
          </li>
          <li>
            <strong>Desktop browsers (Chrome, Edge, Firefox)</strong>: Typically allow tens of gigabytes of music storage without eviction under standard disk health.
          </li>
          <li>
            <strong>Privacy & Isolation</strong>: Each browser profile maintains its own separate local storage sandbox.
          </li>
        </ul>
      </div>

      {/* File Management & Danger Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-200">Imported Audio Files ({songs.length})</h3>

          {songs.length > 0 && (
            <button
              onClick={() => setIsConfirmClearAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Entire Library
            </button>
          )}
        </div>

        {songs.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-slate-800 rounded-2xl">
            No audio files currently occupying storage.
          </p>
        ) : (
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/50">
            {songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3.5 hover:bg-slate-850 transition-colors text-xs"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <p className="font-semibold text-slate-200 truncate">{song.title}</p>
                  <p className="text-slate-400 truncate mt-0.5">
                    {song.artist} &bull; {song.fileName}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-slate-400">
                    {formatBytes(song.fileSize || song.audioBlob?.size || 0)}
                  </span>
                  <button
                    onClick={() => setDeletingSong(song)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-950/30 transition-colors"
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Single Song Confirmation */}
      <ConfirmModal
        isOpen={Boolean(deletingSong)}
        onClose={() => setDeletingSong(null)}
        onConfirm={() => {
          if (deletingSong) removeSong(deletingSong.id);
        }}
        title="Remove Audio File"
        message={`Are you sure you want to delete "${deletingSong?.title}"? Its file blob will be permanently removed from IndexedDB.`}
        confirmText="Remove File"
      />

      {/* Clear Entire Library Confirmation */}
      <ConfirmModal
        isOpen={isConfirmClearAll}
        onClose={() => setIsConfirmClearAll(false)}
        onConfirm={clearEntireLibraryAction}
        title="Clear Entire Music Library"
        message="DANGER: This will delete ALL songs, playlists, favourites, and playback history stored on this browser! Original imported audio files will be wiped from this device. Are you completely sure?"
        confirmText="Yes, Wipe Library"
      />
    </div>
  );
}
