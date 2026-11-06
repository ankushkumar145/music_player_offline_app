import React, { useState } from 'react';
import Modal from './Modal';
import { Smartphone, Monitor, Apple, CheckCircle2, Share2, PlusSquare, MoreVertical, Download } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export default function PWAInstructionsModal({ isOpen, onClose }) {
  const { platform, isInstallable, triggerInstall } = usePWAInstall();
  const [activeTab, setActiveTab] = useState(() => {
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'windows';
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Install TuneFlow App" maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-slate-300">
          TuneFlow is a Progressive Web App (PWA). You can install it on your device for a full-screen, native-like experience that works completely offline.
        </p>

        {/* Quick trigger if browser captured prompt */}
        {isInstallable && (
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">One-Click Install Ready</p>
              <p className="text-xs text-slate-300">Your browser supports instant installation.</p>
            </div>
            <button
              onClick={() => {
                triggerInstall();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Install Now
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'android'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            Android
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'ios'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Apple className="w-3.5 h-3.5 text-slate-200" />
            iPhone / iPad
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'windows'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            PC / Mac
          </button>
        </div>

        {/* Tab Guides */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm space-y-3">
          {activeTab === 'android' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Chrome on Android:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                <li>
                  Tap the browser menu (three dots <MoreVertical className="w-3 h-3 inline" /> in top right).
                </li>
                <li>
                  Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                </li>
                <li>
                  Confirm by tapping <strong>Install</strong>.
                </li>
                <li>TuneFlow will appear as an app icon in your app drawer and home screen.</li>
              </ol>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Apple className="w-4 h-4 text-slate-200" />
                Safari on iPhone & iPad:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                <li>
                  Tap the <strong>Share</strong> button (<Share2 className="w-3 h-3 inline" /> at the bottom of Safari).
                </li>
                <li>
                  Scroll down and tap <strong>"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline" />).
                </li>
                <li>
                  Tap <strong>Add</strong> in the top right corner.
                </li>
                <li>Launch TuneFlow from your iPhone home screen for the full-screen offline experience!</li>
              </ol>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-400" />
                Chrome & Edge on Windows / Mac:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                <li>
                  Look for the <strong>Install</strong> icon (<Download className="w-3 h-3 inline" />) on the right side of the URL address bar.
                </li>
                <li>
                  Or open the browser menu (<MoreVertical className="w-3 h-3 inline" />) &rarr; <strong>"Install TuneFlow..."</strong>.
                </li>
                <li>Confirm by clicking <strong>Install</strong>.</li>
                <li>TuneFlow opens in its own window without browser toolbars, pinned to your taskbar or start menu.</li>
              </ol>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

