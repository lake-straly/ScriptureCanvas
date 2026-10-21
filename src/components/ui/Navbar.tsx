import React, { useState } from 'react';
import type { Collaborator, UserProfile } from '../../types';
import { BookOpen, ZoomIn, ZoomOut, Share2, LayoutGrid, ExternalLink, Download, Search } from 'lucide-react';
import { openTestCollaboratorWindow } from '../../services/multiplayer';

interface NavbarProps {
  roomTitle: string;
  onUpdateTitle: (title: string) => void;
  collaborators: Collaborator[];
  currentUser: UserProfile;
  roomCode: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onCenterCanvas: () => void;
  onOpenTemplates: () => void;
  onOpenShare: () => void;
  onOpenExport?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  roomTitle,
  onUpdateTitle,
  collaborators,
  currentUser,
  roomCode,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onCenterCanvas,
  onOpenTemplates,
  onOpenShare,
  onOpenExport,
  onOpenCommandPalette,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(roomTitle);

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim()) {
      onUpdateTitle(title.trim());
    } else {
      setTitle(roomTitle);
    }
  };

  const handleLaunchTestPeer = () => {
    openTestCollaboratorWindow(roomCode);
  };

  return (
    <header className="absolute top-0 inset-x-0 h-14 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 z-30 px-4 flex items-center justify-between select-none">
      {/* Brand & Room Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onCenterCanvas}
          className="flex items-center gap-2 pr-3 border-r border-slate-800 hover:opacity-80 transition-opacity text-left cursor-pointer"
          title="Click to re-center canvas"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              ScriptureCanvas
            </span>
          </div>
        </button>

        {/* Room Title (Editable) */}
        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="px-2 py-1 rounded bg-slate-900 border border-sky-500 text-xs font-medium text-slate-100 focus:outline-none"
          />
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="text-xs font-semibold text-slate-200 hover:text-sky-300 cursor-pointer px-2 py-1 rounded hover:bg-slate-900/60 transition-colors flex items-center gap-1.5"
            title="Click to rename study room"
          >
            <span>{roomTitle}</span>
            <span className="text-[10px] text-slate-400">✎</span>
          </div>
        )}
      </div>

      {/* Center: Search, Templates & Fast 1-Click Multiplayer Test */}
      <div className="hidden md:flex items-center gap-2">
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 transition-all flex items-center gap-2 shadow-sm hover:border-slate-600"
            title="Open Command Palette (Cmd+K / Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden lg:inline text-slate-400">Search cards & verses...</span>
            <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">⌘K</kbd>
          </button>
        )}

        <button
          onClick={onOpenTemplates}
          className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 shadow-sm hover:border-slate-600"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span>Templates</span>
        </button>

        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all flex items-center gap-1.5 shadow-sm hover:border-slate-600"
            title="Export Study Notes to Markdown or Print"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        <button
          onClick={handleLaunchTestPeer}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
          title="Opens a 2nd collaborator window to verify real-time multiplayer instantly"
        >
          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
          <span>Test 2-Player</span>
        </button>
      </div>

      {/* Right: User Profile, Collaborators, Zoom, and Share */}
      <div className="flex items-center gap-3">
        {/* Current User Badge */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-xs text-slate-200"
          title="Click to edit display name or color"
        >
          <div
            className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.avatar}
          </div>
          <span className="font-medium max-w-[80px] sm:max-w-[100px] truncate hidden xs:inline sm:inline">{currentUser.name}</span>
        </button>

        {/* Collaborators Stack (compact on mobile) */}
        <div className="hidden sm:flex items-center gap-1.5 pr-2 border-r border-slate-800">
          {collaborators.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {collaborators.map((c) => (
                <div
                  key={c.id}
                  className="w-7 h-7 rounded-full border-2 border-slate-950 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-white/10"
                  style={{ backgroundColor: c.color }}
                  title={`${c.name} (Active in study)`}
                >
                  {c.avatar}
                </div>
              ))}
              <div className="pl-3 text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{collaborators.length + 1} online</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Solo</span>
            </div>
          )}
        </div>

        {/* Search trigger on mobile */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Search cards & verses"
          >
            <Search className="w-4 h-4 text-sky-400" />
          </button>
        )}

        {/* Zoom Controls (hidden on mobile since touch users pinch to zoom) */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-slate-300">
          <button
            onClick={onZoomOut}
            className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetZoom}
            className="px-1.5 text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
            title="Reset to 100%"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={onZoomIn}
            className="p-1 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Share / Invite Button */}
        <button
          onClick={onOpenShare}
          className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 flex-shrink-0"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Collaborate</span>
        </button>
      </div>
    </header>
  );
};
