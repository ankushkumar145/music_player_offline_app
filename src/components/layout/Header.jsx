import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Sun,
  Moon,
  Palette,
  Download,
  Smartphone,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function Header({ onOpenImport, onOpenPWAInstructions }) {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode, palettes, accentKey, setAccentKey } = useTheme();
  const { isInstallable, triggerInstall } = usePWAInstall();

  const [searchQuery, setSearchQuery] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-16 px-4 sm:px-8 border-b border-slate-800/80 bg-[#0c0d13]/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-md relative flex items-center"
      >
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search songs, artists, albums, playlists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 focus:border-[var(--color-accent)] text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none"
        />
      </form>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button */}
        {isInstallable ? (
          <button
            onClick={triggerInstall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-purple-200 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            title="Install TuneFlow Progressive Web App"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        ) : (
          <button
            onClick={onOpenPWAInstructions}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-medium transition-all cursor-pointer"
            title="PWA Installation Guide"
          >
            <Smartphone className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">PWA Info</span>
          </button>
        )}

        {/* Quick Import Button (Header) */}
        <button
          onClick={onOpenImport}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          Import
        </button>

        {/* Accent Color Picker Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPaletteOpen(!isPaletteOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Change Theme Accent Color"
            aria-label="Accent Palette"
          >
            <Palette className="w-4 h-4 text-[var(--color-accent)]" />
          </button>

          {isPaletteOpen && (
            <div className="absolute right-0 top-full mt-2 p-3 bg-[#181a24] border border-slate-700/80 rounded-2xl shadow-2xl z-40 w-44 animate-in fade-in zoom-in-95">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Accent Color
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Object.values(palettes).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setAccentKey(p.id);
                      setIsPaletteOpen(false);
                    }}
                    style={{ backgroundColor: p.primary }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer relative"
                    title={p.name}
                  >
                    {accentKey === p.id && (
                      <Check className="w-4 h-4 text-white stroke-[3]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}

