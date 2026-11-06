import React, { useState } from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';

export default function VolumeControl({ showLabel = false, className = '' }) {
  const { volume, isMuted, setVolumeLevel, toggleMute } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);

  const effectiveVolume = isMuted ? 0 : volume;

  const getIcon = () => {
    if (effectiveVolume === 0 || isMuted) {
      return VolumeX;
    }
    if (effectiveVolume < 0.5) {
      return Volume1;
    }
    return Volume2;
  };

  const Icon = getIcon();

  return (
    <div
      className={`flex items-center gap-2 relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={toggleMute}
        className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/60"
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        <Icon className="w-5 h-5" />
      </button>

      <div className="relative flex items-center w-20 sm:w-24 group">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effectiveVolume}
          onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700/80 rounded-lg appearance-none cursor-pointer accent-[var(--color-accent)] focus:outline-none"
          title={`Volume: ${Math.round(effectiveVolume * 100)}%`}
          aria-label="Volume slider"
        />
      </div>

      {showLabel && (
        <span className="text-xs text-slate-400 font-mono w-8 text-right">
          {Math.round(effectiveVolume * 100)}%
        </span>
      )}
    </div>
  );
}

