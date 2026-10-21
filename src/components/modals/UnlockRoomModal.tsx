import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { unlockRoom } from '../../services/multiplayer';

interface UnlockRoomModalProps {
  isOpen: boolean;
  roomCode: string;
  onUnlocked: () => void;
  onSubmitPassword?: (password: string) => Promise<boolean> | boolean;
  errorMessage?: string | null;
}

export const UnlockRoomModal: React.FC<UnlockRoomModalProps> = ({
  isOpen,
  roomCode,
  onUnlocked,
  onSubmitPassword,
  errorMessage,
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting) return;

    if (onSubmitPassword) {
      setIsSubmitting(true);
      try {
        const success = await onSubmitPassword(password.trim());
        if (success) {
          setError(false);
          onUnlocked();
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const success = unlockRoom(roomCode, password);
      if (success) {
        setError(false);
        onUnlocked();
      } else {
        setError(true);
      }
    }
  };

  const displayError = errorMessage || (error ? 'Incorrect password. Please try again.' : null);

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

        {displayError && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{displayError}</span>
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
              disabled={isSubmitting}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying with host...</span>
              </>
            ) : (
              <span>Unlock & Enter Study Board</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
