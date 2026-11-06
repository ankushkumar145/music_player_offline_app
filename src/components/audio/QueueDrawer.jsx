import React from 'react';
import { X, Play, Trash2, Music2, ArrowUp, ArrowDown } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatters';

export default function QueueDrawer({ isOpen, onClose }) {
  const {
    queue,
    queueIndex,
    currentSong,
    playQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue,
  } = usePlayer();

  if (!isOpen) return null;

  const moveItem = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= queue.length) return;
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIdx, 1);
    newQueue.splice(toIdx, 0, moved);
    reorderQueue(newQueue);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative z-10 w-full max-w-md bg-[#13151e] border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">Play Queue</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1.5 rounded-lg hover:bg-rose-950/40 transition-colors flex items-center gap-1.5"
                title="Clear queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Close queue"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Currently Playing Card */}
          {currentSong && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
                Now Playing
              </h4>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
                <div className="w-12 h-12 rounded-lg bg-slate-800 shrink-0 overflow-hidden shadow">
                  {currentSong.coverArtwork ? (
                    <img
                      src={currentSong.coverArtwork}
                      alt={currentSong.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                      <Music2 className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-100 truncate">
                    {currentSong.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">{currentSong.artist}</p>
                </div>
                <span className="text-xs font-mono text-purple-300">
                  {formatDuration(currentSong.duration)}
                </span>
              </div>
            </div>
          )}

          {/* Up Next List */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
              Next in Queue
            </h4>

            {queue.length === 0 ? (
              <p className="text-sm text-slate-500 italic p-4 text-center">
                Queue is empty. Select songs to play.
              </p>
            ) : (
              <div className="space-y-1">
                {queue.map((song, idx) => {
                  const isCurrent = idx === queueIndex;
                  return (
                    <div
                      key={`${song.id}-${idx}`}
                      className={`group flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                        isCurrent
                          ? 'bg-slate-800/60 border-purple-500/40 text-purple-200'
                          : 'hover:bg-slate-800/40 border-transparent text-slate-300'
                      }`}
                    >
                      {/* Play trigger */}
                      <button
                        onClick={() => playQueue(queue, idx)}
                        className="w-9 h-9 rounded-lg bg-slate-800 shrink-0 overflow-hidden relative group/btn flex items-center justify-center"
                        title="Play track"
                      >
                        {song.coverArtwork ? (
                          <img
                            src={song.coverArtwork}
                            alt={song.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Music2 className="w-4 h-4 text-slate-500" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/btn:opacity-100 flex items-center justify-center transition-opacity">
                          <Play className="w-4 h-4 text-white fill-current" />
                        </div>
                      </button>

                      {/* Song details */}
                      <div
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => playQueue(queue, idx)}
                      >
                        <p
                          className={`text-sm font-medium truncate ${
                            isCurrent ? 'text-purple-300 font-semibold' : 'text-slate-200'
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{song.artist}</p>
                      </div>

                      {/* Duration */}
                      <span className="text-xs font-mono text-slate-500 group-hover:hidden">
                        {formatDuration(song.duration)}
                      </span>

                      {/* Action buttons (shown on hover) */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={() => moveItem(idx, idx - 1)}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveItem(idx, idx + 1)}
                          disabled={idx === queue.length - 1}
                          className="p-1 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-700/50"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeFromQueue(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300 rounded hover:bg-rose-950/40"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

