import React from 'react';
import Modal from '../common/Modal';
import { Moon, Clock, Check } from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext';
import { formatDuration } from '../../utils/formatters';

export default function SleepTimerModal({ isOpen, onClose }) {
  const { sleepTimerRemaining, startSleepTimer } = usePlayer();

  const options = [
    { label: '15 Minutes', value: 15 },
    { label: '30 Minutes', value: 30 },
    { label: '45 Minutes', value: 45 },
    { label: '1 Hour', value: 60 },
    { label: 'End of Track', value: 'end-of-track' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sleep Timer" maxWidth="max-w-sm">
      <div className="flex flex-col gap-4">
        {sleepTimerRemaining !== null && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200">
            <div className="flex items-center gap-2.5">
              <Moon className="w-5 h-5 text-purple-400 animate-pulse" />
              <span className="text-sm font-medium">Timer Active</span>
            </div>
            <span className="font-mono text-sm font-bold">
              {typeof sleepTimerRemaining === 'number'
                ? formatDuration(sleepTimerRemaining)
                : 'End of Track'}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                startSleepTimer(opt.value);
                onClose();
              }}
              className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 text-slate-200 transition-colors text-sm font-medium text-left"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{opt.label}</span>
              </div>
            </button>
          ))}

          {sleepTimerRemaining !== null && (
            <button
              onClick={() => {
                startSleepTimer(null);
                onClose();
              }}
              className="mt-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 transition-colors"
            >
              Turn Off Timer
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

