import React, { useState, useRef } from 'react';
import {
  Settings,
  Download,
  Upload,
  Archive,
  FileJson,
  Palette,
  Volume2,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Info,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  exportMetadataJSON,
  importMetadataJSON,
  exportCompleteArchive,
  importCompleteArchive,
} from '../services/backupService';
import Modal from '../components/common/Modal';

export default function SettingsPage() {
  const { isDark, toggleDarkMode, palettes, accentKey, setAccentKey } = useTheme();
  const { songs, loadLibrary } = useLibrary();
  const toast = useToast();
  const { isInstallable, triggerInstall } = usePWAInstall();

  // Backup & Restore processing states
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState({ percent: 0, message: '' });

  const [isImportingZip, setIsImportingZip] = useState(false);
  const [zipImportProgress, setZipImportProgress] = useState({ percent: 0, message: '' });

  // Missing songs warning modal for JSON import
  const [missingSongsModal, setMissingSongsModal] = useState(null);

  const jsonInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // 1. Export Metadata JSON
  const handleExportJSON = async () => {
    try {
      const blob = await exportMetadataJSON();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tuneflow-metadata-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported library metadata JSON');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export metadata');
    }
  };

  // 2. Import Metadata JSON
  const handleImportJSON = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await importMetadataJSON(file);
      await loadLibrary();
      toast.success(`Restored ${res.restoredPlaylists} playlists & ${res.restoredFavs} favourites!`);

      if (res.missingSongsCount > 0) {
        setMissingSongsModal(res);
      }
    } catch (err) {
      console.error(err);
      toast.error('JSON Import failed: ' + err.message);
    } finally {
      if (jsonInputRef.current) jsonInputRef.current.value = '';
    }
  };

  // 3. Export Complete ZIP Archive
  const handleExportZip = async () => {
    if (songs.length === 0) {
      toast.info('No songs to backup yet. Import music first.');
      return;
    }

    setIsExportingZip(true);
    setZipProgress({ percent: 0, message: 'Starting export...' });

    try {
      const zipBlob = await exportCompleteArchive((percent, message) => {
        setZipProgress({ percent, message });
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tuneflow-full-archive-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Complete backup archive downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Archive export failed: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // 4. Import Complete ZIP Archive
  const handleImportZip = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingZip(true);
    setZipImportProgress({ percent: 0, message: 'Unpacking backup archive...' });

    try {
      const res = await importCompleteArchive(file, (percent, message) => {
        setZipImportProgress({ percent, message });
      });

      await loadLibrary();
      toast.success(`Restored ${res.restoredSongs} songs and ${res.restoredPlaylists} playlists!`);
    } catch (err) {
      console.error(err);
      toast.error('Archive restore failed: ' + err.message);
    } finally {
      setIsImportingZip(false);
      if (zipInputRef.current) zipInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-[var(--color-accent)]" />
          Application Settings
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize themes, manage full library backups, and view PWA features
        </p>
      </div>

      {/* 1. Appearance Section */}
      <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-[var(--color-accent)]" />
          Appearance & Themes
        </h2>

        {/* Theme mode toggle */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <p className="text-sm font-semibold text-slate-200">Color Mode</p>
            <p className="text-xs text-slate-400 mt-0.5">Toggle between dark and light interface</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            {isDark ? 'Switch to Light' : 'Switch to Dark'}
          </button>
        </div>

        {/* Accent color picker */}
        <div>
          <p className="text-sm font-semibold text-slate-200 mb-1">Accent Theme</p>
          <p className="text-xs text-slate-400 mb-3">
            Choose your signature neon accent for controls, glowing artwork, and highlights
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.values(palettes).map((p) => {
              const isSelected = accentKey === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setAccentKey(p.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-[var(--color-accent)] shadow-md'
                      : 'bg-slate-900/60 hover:bg-slate-800 border-slate-800'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow"
                    style={{ backgroundColor: p.primary }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </div>
                  <span className="text-xs font-medium text-slate-300">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Library Backup & Restore Section */}
      <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Archive className="w-5 h-5 text-emerald-400" />
            Library Backup & Restore
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Safeguard your playlists and music files or transfer them to another device.
          </p>
        </div>

        {/* Option A: Full Archive (ZIP with audio files) */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">
                Recommended & Complete
              </span>
              <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
                <Archive className="w-4 h-4 text-emerald-400" />
                Full Backup Archive (.zip)
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Contains your playlists, favorites, metadata, AND original binary audio files. Restoring this archive on any computer or phone completely recovers your library.
              </p>
            </div>
          </div>

          {/* Progress feedback for ZIP */}
          {(isExportingZip || isImportingZip) && (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-200">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                  {isExportingZip ? zipProgress.message : zipImportProgress.message}
                </span>
                <span className="font-mono font-bold">
                  {isExportingZip ? zipProgress.percent : zipImportProgress.percent}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{
                    width: `${isExportingZip ? zipProgress.percent : zipImportProgress.percent}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportZip}
              disabled={isExportingZip || isImportingZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Full Archive (.zip)
            </button>

            <button
              onClick={() => zipInputRef.current?.click()}
              disabled={isExportingZip || isImportingZip}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-emerald-400" />
              Restore Full Archive (.zip)
            </button>

            <input
              ref={zipInputRef}
              type="file"
              accept=".zip,application/zip"
              className="hidden"
              onChange={handleImportZip}
            />
          </div>
        </div>

        {/* Option B: Metadata Only (.json) */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-purple-400" />
              Metadata & Playlists Only (.json)
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Lightweight backup containing song tags, playlists, and favorites without binary audio files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" />
              Export Metadata JSON
            </button>

            <button
              onClick={() => jsonInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              Import Metadata JSON
            </button>

            <input
              ref={jsonInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportJSON}
            />
          </div>
        </div>
      </section>

      {/* 3. PWA & Installation Info */}
      <section className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-400" />
          Progressive Web App Status
        </h2>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p>
            TuneFlow is architected with a standard Service Worker and Web App Manifest. Once loaded, the user interface remains accessible without internet connection.
          </p>
          <div className="flex items-center gap-4 text-slate-400 pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Cache Storage Active
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Local IndexedDB Ready
            </span>
          </div>
        </div>

        {isInstallable && (
          <button
            onClick={triggerInstall}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Install TuneFlow to Home Screen / Desktop
          </button>
        )}
      </section>

      {/* Missing Songs Warning Modal for JSON metadata restore */}
      {missingSongsModal && (
        <Modal
          isOpen={Boolean(missingSongsModal)}
          onClose={() => setMissingSongsModal(null)}
          title="Audio Files Not Found Locally"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <div>
                <p className="font-bold">Notice on Metadata-Only Backup</p>
                <p className="mt-0.5">
                  Playlists and tags were restored, but{' '}
                  <strong>{missingSongsModal.missingSongsCount} referenced songs</strong> do not
                  currently have their original audio files in this device's storage.
                </p>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-slate-300">
              {missingSongsModal.missingSongNames.map((name, i) => (
                <div key={i} className="truncate py-0.5 border-b border-slate-800/40 last:border-0">
                  {name}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400">
              To play these songs, simply import the corresponding audio files through the "Import Music" tool or restore using a complete (.zip) archive.
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setMissingSongsModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
