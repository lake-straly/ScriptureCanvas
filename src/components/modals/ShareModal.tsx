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
  UserCheck,
  Radio,
  LogOut,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import type { CanvasState, UserProfile } from '../../types';
import { 
  openTestCollaboratorWindow, 
  getRoomPassword, 
  setRoomPassword 
} from '../../services/multiplayer';
import { ResizableModal } from '../ui/ResizableModal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  onStartCollaborativeRoom: () => string;
  onJoinRoom: (codeToJoin: string) => void;
  onLeaveRoom: () => void;
  currentUser: UserProfile;
  onUpdateCurrentUser: (name: string, color?: string) => void;
  isSimulatingCollab: boolean;
  onToggleCollabSimulation: () => void;
  canvasState: CanvasState;
  onPasswordChange?: (password: string) => void;
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
  onStartCollaborativeRoom,
  onJoinRoom,
  onLeaveRoom,
  currentUser,
  onUpdateCurrentUser,
  isSimulatingCollab,
  onToggleCollabSimulation,
  canvasState,
  onPasswordChange,
}) => {
  const [copied, setCopied] = useState(false);
  const [tempName, setTempName] = useState(currentUser.name);
  const [roomPassword, setRoomPasswordState] = useState(
    roomCode ? getRoomPassword(roomCode) || '' : ''
  );
  const [showPasswordSaved, setShowPasswordSaved] = useState(false);
  const [joinRoomInput, setJoinRoomInput] = useState('');

  if (!isOpen) return null;

  const isLiveRoom = Boolean(roomCode);

  const getInviteUrl = (code = roomCode) => {
    const url = new URL(window.location.origin + window.location.pathname);
    if (code) {
      url.searchParams.set('room', code);
    }
    return url.toString();
  };

  const inviteUrlString = getInviteUrl();

  const handleCopyLink = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(getInviteUrl(roomCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateLiveRoom = () => {
    const activeCode = onStartCollaborativeRoom();
    setRoomPasswordState(getRoomPassword(activeCode) || '');
  };

  const handleJoinExistingRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomInput.trim()) return;
    onJoinRoom(joinRoomInput.trim());
    setJoinRoomInput('');
    onClose();
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onUpdateCurrentUser(tempName.trim());
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode) return;
    const cleanPwd = roomPassword.trim();
    setRoomPassword(roomCode, cleanPwd);
    onPasswordChange?.(cleanPwd);
    setShowPasswordSaved(true);
    setTimeout(() => setShowPasswordSaved(false), 2000);
  };

  const handleLaunchTestPeer = () => {
    const code = roomCode || onStartCollaborativeRoom();
    openTestCollaboratorWindow(code);
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
    <ResizableModal defaultWidth={520} onBackdropClick={onClose}>
      <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Multiplayer & Collaboration</h2>
              <p className="text-xs text-slate-400">
                {isLiveRoom
                  ? `Connected to live room #${roomCode}`
                  : 'Currently in Private Study mode (local to your browser)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIVATE MODE vs LIVE ROOM GATE */}
        {!isLiveRoom ? (
          <div className="space-y-4">
            {/* Convert Private Study to Live Collaborative Room */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/70 via-slate-900 to-indigo-950/70 border border-sky-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-300">
                  <Radio className="w-4 h-4 text-sky-400" />
                  <span>Convert Private Board to Live Collaborative Room</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Private Mode
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your workspace is currently private and offline from other users. Click below to generate a unique 6-character room code and shareable link.
              </p>
              <button
                type="button"
                onClick={handleCreateLiveRoom}
                className="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/30 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Create 6-Character Room Code & Go Live</span>
              </button>
            </div>

            {/* Join Existing Room by Code */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Have a 6-Character Room Code from a Friend?</span>
              </label>
              <form onSubmit={handleJoinExistingRoom} className="flex gap-2">
                <input
                  type="text"
                  maxLength={12}
                  value={joinRoomInput}
                  onChange={(e) => setJoinRoomInput(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code (e.g. 7K4X9M)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase tracking-wider"
                />
                <button
                  type="submit"
                  disabled={!joinRoomInput.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs text-white font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Join</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Active Live Room Status Bar */}
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div className="truncate">
                  <div className="text-xs font-bold text-emerald-300 font-mono truncate">
                    #{roomCode}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Live P2P session active
                  </div>
                </div>
              </div>
              <button
                onClick={onLeaveRoom}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                title="Disconnect from this shared room and return to Private Study mode"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Go Private</span>
              </button>
            </div>

            {/* Room Invite Link */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Room Invite Link</label>
                <span className="text-[10px] text-slate-400">
                  {roomPassword ? '🔐 Requires password to join' : '🌐 Open access'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 truncate select-all">
                  {inviteUrlString}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md flex-shrink-0 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                </button>
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
                Set a room password so only people with the secret phrase can join this room. Leave empty for open access.
              </p>

              <form onSubmit={handleSavePassword} className="flex gap-2">
                <input
                  type="password"
                  value={roomPassword}
                  onChange={(e) => setRoomPasswordState(e.target.value)}
                  placeholder="Enter room password (leave blank to unlock)"
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium transition-colors shadow-sm cursor-pointer"
                >
                  Set Password
                </button>
              </form>
            </div>

            {/* 1-Click Multiplayer Verification Card */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-950/50 to-indigo-950/50 border border-sky-500/25 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-300">
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  <span>Test 2-Player Window</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Opens a 2nd tab connected to #{roomCode} to preview live cursors and sync.
                </p>
              </div>
              <button
                onClick={handleLaunchTestPeer}
                className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all flex-shrink-0 shadow-sm cursor-pointer"
              >
                Open 2nd Tab
              </button>
            </div>
          </div>
        )}

        {/* Temporary Profile / Display Name */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-amber-400" />
              <span>Your Display Name & Cursor Color:</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">No signup needed</span>
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
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors border border-slate-700 cursor-pointer"
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
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                    currentUser.color === col ? 'ring-2 ring-white scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
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
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1 cursor-pointer"
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
            className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center justify-between transition-colors text-xs text-slate-300 hover:text-white cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export Board as JSON Study File</span>
            </div>
            <span className="text-[10px] text-slate-400">.json</span>
          </button>
        </div>
      </div>
    </ResizableModal>
  );
};
