import React, { useState } from 'react';
import { 
  Share2, 
  X, 
  Copy, 
  Check, 
  Users, 
  Download, 
  ToggleLeft, 
  ToggleRight, 
  ExternalLink, 
  Lock, 
  Unlock, 
  UserCheck 
} from 'lucide-react';
import type { CanvasState, UserProfile } from '../../types';
import { 
  openTestCollaboratorWindow, 
  getRoomPassword, 
  setRoomPassword 
} from '../../services/multiplayer';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  currentUser: UserProfile;
  onUpdateCurrentUser: (name: string, color?: string) => void;
  isSimulatingCollab: boolean;
  onToggleCollabSimulation: () => void;
  canvasState: CanvasState;
}

const COLOR_CHOICES = [
  '#0284c7', // Sky Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  roomCode,
  currentUser,
  onUpdateCurrentUser,
  isSimulatingCollab,
  onToggleCollabSimulation,
  canvasState,
}) => {
  const [copied, setCopied] = useState(false);
  const [tempName, setTempName] = useState(currentUser.name);
  const [roomPassword, setRoomPasswordState] = useState(getRoomPassword(roomCode) || '');
  const [showPasswordSaved, setShowPasswordSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateCurrentUser(tempName.trim());
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRoomPassword(roomCode, roomPassword);
    setShowPasswordSaved(true);
    setTimeout(() => setShowPasswordSaved(false), 2000);
  };

  const handleLaunchTestPeer = () => {
    openTestCollaboratorWindow(roomCode);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(canvasState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${canvasState.roomTitle.replace(/\s+/g, '_')}_study.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Multiplayer & Collaboration</h2>
              <p className="text-xs text-slate-400">Real-time multi-user study room (No account required)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Multiplayer Verification Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
              <Users className="w-4 h-4 text-sky-400" />
              <span>Verify Real-Time Multiplayer Now</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Live Cross-Tab Sync
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Click below to open a 2nd collaborator window (as "Pastor Mark"). Place both windows side-by-side to watch real-time cursors, card movements, highlights, and notes sync instantly!
          </p>
          <button
            onClick={handleLaunchTestPeer}
            className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open 2nd Collaborator Window</span>
          </button>
        </div>

        {/* Temporary Profile / Display Name */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Your Temporary Guest Name:</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">No password or signup needed</span>
          </div>

          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Enter your name..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700"
            >
              Update
            </button>
          </form>

          {/* Color choices */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Cursor Color:</span>
            <div className="flex gap-1.5">
              {COLOR_CHOICES.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => onUpdateCurrentUser(currentUser.name, col)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    currentUser.color === col ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Room Password Protection */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              {roomPassword ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-slate-400" />}
              <span>Room Password Protection (Optional)</span>
            </div>
            {showPasswordSaved && (
              <span className="text-[10px] text-emerald-400 font-medium">Saved!</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Set an instance password so random people cannot enter without knowing the secret phrase. Leave empty for open access.
          </p>

          <form onSubmit={handleSavePassword} className="flex gap-2">
            <input
              type="password"
              value={roomPassword}
              onChange={(e) => setRoomPasswordState(e.target.value)}
              placeholder="e.g. fellowship777 (leave blank to unlock)"
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium transition-colors shadow-sm"
            >
              Set Password
            </button>
          </form>
        </div>

        {/* Room Invite Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Room Invite Link</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 truncate">
              {window.location.origin}?room={roomCode}
            </div>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-md flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Link' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Solo Simulation Toggle */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Simulate Virtual Small Group</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Generate simulated bot members (Sarah, David, Pastor Mark) moving on canvas.
            </p>
          </div>
          <button
            onClick={onToggleCollabSimulation}
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
          >
            {isSimulatingCollab ? (
              <ToggleRight className="w-7 h-7 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-7 h-7 text-slate-600" />
            )}
          </button>
        </div>

        {/* Export JSON */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleExportJson}
            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors text-xs text-slate-300 hover:text-white"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Board as JSON Study File</span>
            </div>
            <span className="text-[10px] text-slate-400">.json</span>
          </button>
        </div>
      </div>
    </div>
  );
};
