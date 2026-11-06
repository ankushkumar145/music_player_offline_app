import React, { createContext, useContext, useState, useEffect } from 'react';

export const ACCENT_PALETTES = {
  purple: {
    id: 'purple',
    name: 'Electric Violet',
    primary: '#8b5cf6',
    hover: '#7c3aed',
    light: 'rgba(139, 92, 246, 0.18)',
    glow: 'rgba(139, 92, 246, 0.4)',
    bgGradient: 'from-purple-900/40 via-purple-950/20 to-transparent',
  },
  emerald: {
    id: 'emerald',
    name: 'Neon Emerald',
    primary: '#10b981',
    hover: '#059669',
    light: 'rgba(16, 185, 129, 0.18)',
    glow: 'rgba(16, 185, 129, 0.4)',
    bgGradient: 'from-emerald-900/40 via-emerald-950/20 to-transparent',
  },
  cyan: {
    id: 'cyan',
    name: 'Cyber Cyan',
    primary: '#06b6d4',
    hover: '#0891b2',
    light: 'rgba(6, 182, 212, 0.18)',
    glow: 'rgba(6, 182, 212, 0.4)',
    bgGradient: 'from-cyan-900/40 via-cyan-950/20 to-transparent',
  },
  rose: {
    id: 'rose',
    name: 'Hot Rose',
    primary: '#f43f5e',
    hover: '#e11d48',
    light: 'rgba(244, 63, 94, 0.18)',
    glow: 'rgba(244, 63, 94, 0.4)',
    bgGradient: 'from-rose-900/40 via-rose-950/20 to-transparent',
  },
  amber: {
    id: 'amber',
    name: 'Sunset Amber',
    primary: '#f59e0b',
    hover: '#d97706',
    light: 'rgba(245, 158, 11, 0.18)',
    glow: 'rgba(245, 158, 11, 0.4)',
    bgGradient: 'from-amber-900/40 via-amber-950/20 to-transparent',
  },
  blue: {
    id: 'blue',
    name: 'Deep Blue',
    primary: '#3b82f6',
    hover: '#2563eb',
    light: 'rgba(59, 130, 246, 0.18)',
    glow: 'rgba(59, 130, 246, 0.4)',
    bgGradient: 'from-blue-900/40 via-blue-950/20 to-transparent',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('tf_dark_mode');
    return saved !== null ? saved === 'true' : true; // Default dark
  });

  const [accentKey, setAccentKey] = useState(() => {
    const saved = localStorage.getItem('tf_accent_key');
    return saved && ACCENT_PALETTES[saved] ? saved : 'purple';
  });

  useEffect(() => {
    localStorage.setItem('tf_dark_mode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('tf_accent_key', accentKey);
    const palette = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.purple;
    const root = document.documentElement;

    root.style.setProperty('--color-accent', palette.primary);
    root.style.setProperty('--color-accent-hover', palette.hover);
    root.style.setProperty('--color-accent-light', palette.light);
    root.style.setProperty('--color-accent-glow', palette.glow);
  }, [accentKey]);

  const toggleDarkMode = () => setIsDark(prev => !prev);
  const currentAccent = ACCENT_PALETTES[accentKey] || ACCENT_PALETTES.purple;

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        toggleDarkMode,
        setIsDark,
        accentKey,
        setAccentKey,
        currentAccent,
        palettes: ACCENT_PALETTES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

