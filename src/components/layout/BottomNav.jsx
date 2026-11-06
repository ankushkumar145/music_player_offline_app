import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Music, ListMusic, HardDrive } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function BottomNav() {
  const { currentSong } = usePlayer();

  const links = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Library', path: '/songs', icon: Music },
    { label: 'Playlists', path: '/playlists', icon: ListMusic },
    { label: 'Storage', path: '/storage', icon: HardDrive },
  ];

  return (
    <nav
      className={`fixed left-0 right-0 z-30 bg-[#0f1118]/95 backdrop-blur-xl border-t border-slate-800/80 md:hidden transition-all ${
        currentSong ? 'bottom-[65px]' : 'bottom-0'
      }`}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl text-[11px] font-medium transition-all ${
                  isActive
                    ? 'text-[var(--color-accent)] font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

