import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';
import MiniPlayer from '../audio/MiniPlayer';
import FullScreenPlayer from '../audio/FullScreenPlayer';
import QueueDrawer from '../audio/QueueDrawer';
import FileImporter from '../library/FileImporter';
import CreatePlaylistModal from '../playlist/CreatePlaylistModal';
import PWAInstructionsModal from '../common/PWAInstructionsModal';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { usePlayer } from '../../context/PlayerContext';

export default function Layout() {
  // Initialize desktop keyboard hotkeys
  useKeyboardShortcuts();

  const { currentSong } = usePlayer();

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPWAOpen, setIsPWAOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0d12] text-slate-100">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar
          onOpenImport={() => setIsImportOpen(true)}
          onOpenCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        <Header
          onOpenImport={() => setIsImportOpen(true)}
          onOpenPWAInstructions={() => setIsPWAOpen(true)}
        />

        {/* Scrollable page body with bottom padding for miniplayer/bottomnav */}
        <main
          className={`flex-1 overflow-y-auto overflow-x-hidden ${
            currentSong ? 'pb-36 sm:pb-28' : 'pb-20 sm:pb-6'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
            <Outlet context={{ openImport: () => setIsImportOpen(true), openCreatePlaylist: () => setIsCreatePlaylistOpen(true) }} />
          </div>
        </main>

        {/* Persistent Bottom Player */}
        <MiniPlayer onOpenQueue={() => setIsQueueOpen(true)} />

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Full-screen Now Playing Overlay */}
      <FullScreenPlayer />

      {/* Up Next Queue Drawer */}
      <QueueDrawer isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />

      {/* Import Modal */}
      <FileImporter isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />

      {/* PWA Installation Instructions Modal */}
      <PWAInstructionsModal isOpen={isPWAOpen} onClose={() => setIsPWAOpen(false)} />
    </div>
  );
}

