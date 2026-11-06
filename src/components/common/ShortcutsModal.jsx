import React from 'react';
import Modal from './Modal';
import { Keyboard } from 'lucide-react';

export default function ShortcutsModal({ isOpen, onClose }) {
  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause toggle' },
    { key: 'Arrow Right', desc: 'Seek forward 5s (Shift: 10s)' },
    { key: 'Arrow Left', desc: 'Seek backward 5s (Shift: 10s)' },
    { key: 'Arrow Up', desc: 'Volume up (+5%)' },
    { key: 'Arrow Down', desc: 'Volume down (-5%)' },
    { key: 'M', desc: 'Mute / Unmute' },
    { key: 'N', desc: 'Next track' },
    { key: 'P', desc: 'Previous track' },
    { key: 'L', desc: 'Like / Favourite current track' },
    { key: 'S', desc: 'Toggle shuffle' },
    { key: 'R', desc: 'Cycle repeat (Off / All / One)' },
    { key: 'F', desc: 'Toggle full-screen Now Playing' },
    { key: 'Esc', desc: 'Close full-screen or modal' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" maxWidth="max-w-md">
      <div className="space-y-4">
        <p className="text-xs text-slate-400">
          Control your music player with desktop keyboard shortcuts:
        </p>

        <div className="divide-y divide-slate-800/60 bg-slate-900/50 rounded-2xl border border-slate-800 p-2">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between py-2 px-3 text-xs">
              <span className="text-slate-300">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono font-bold shadow-sm">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Got it
          </button>
        </div>
      </div>
    </Modal>
  );
}

