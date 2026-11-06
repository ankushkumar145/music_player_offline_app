import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Music,
  ListMusic,
  Heart,
  Users,
  Disc,
  Search,
  HardDrive,
  Settings,
  Plus,
  Radio,
  Sparkles,
} from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export default function Sidebar({ onOpenImport, onOpenCreatePlaylist }) {
  const { playlists, songs } = useLibrary();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'All Songs', path: '/songs', icon: Music, badge: songs.length || null },
    { label: 'Playlists', path: '/playlists', icon: ListMusic, badge: playlists.length || null },
    { label: 'Favourites', path: '/favourites', icon: Heart },
    { label: 'Artists', path: '/artists', icon: Users },
    { label: 'Albums', path: '/albums', icon: Disc },
    { label: 'Storage', path: '/storage', icon: HardDrive },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0e1017] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/60">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--color-accent)] to-purple-400 flex items-center justify-center text-white shadow-lg shadow-purple-900/30 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              TuneFlow
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold border border-[var(--color-accent)]/20">
                OFFLINE
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Personal Music Player</p>
          </div>
        </div>
      </div>

      {/* Primary Action: Import */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={onOpenImport}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Import Music
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-1.5">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-accent-light)] text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Quick Playlists Section */}
        <div className="pt-4 mt-2 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Playlists
            </span>
            <button
              onClick={onOpenCreatePlaylist}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
              title="Create Playlist"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1 max-h-44 overflow-y-auto pr-1">
            {playlists.length === 0 ? (
              <p className="text-xs text-slate-500 italic px-3 py-2">No playlists yet</p>
            ) : (
              playlists.map((pl) => (
                <NavLink
                  key={pl.id}
                  to={`/playlists/${pl.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-xs truncate transition-colors ${
                      isActive
                        ? 'text-white font-semibold bg-slate-800/60'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`
                  }
                >
                  <ListMusic className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="truncate">{pl.name}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Footer Offline Ready Badge */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-300" />
          <div className="min-w-0">
            <p className="font-semibold text-emerald-300 leading-none">100% Offline Ready</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Zero cloud streaming</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

