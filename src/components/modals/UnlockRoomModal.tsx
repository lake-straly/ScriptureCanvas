import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle } from 'lucide-react';
import { unlockRoom } from '../../services/multiplayer';

interface UnlockRoomModalProps {
  isOpen: boolean;
  roomCode: string;
  onUnlocked: () => void;
}

export const UnlockRoomModal: React.FC<UnlockRoomModalProps> = ({
  isOpen,
  roomCode,
  onUnlocked,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockRoom(roomCode, password);
    if (success) {
      setError(false);
      onUnlocked();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-white">Protected Scripture Room</h2>
          <p className="text-xs text-slate-400">
            This study instance ({roomCode}) is protected with a password. Enter the passcode to join the session.
          </p>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>Incorrect password. Please try again.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              autoFocus
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter room password..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={!password.trim()}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md shadow-sky-600/20"
          >
            Unlock & Enter Study Board
          </button>
        </form>
      </div>
    </div>
  );
};
