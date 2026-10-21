import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';
import { unlockRoom } from '../../services/multiplayer';

interface RoomLockScreenProps {
  roomCode: string;
  onUnlocked: () => void;
  onSubmitPassword?: (password: string) => Promise<boolean> | boolean;
  errorMessage?: string | null;
}

export const RoomLockScreen: React.FC<RoomLockScreenProps> = ({
  roomCode,
  onUnlocked,
  onSubmitPassword,
  errorMessage,
}) => {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);

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

  const handleCreateNewRoom = () => {
    const newRoom = 'ROOM-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('room', newRoom);
    window.location.href = url.toString();
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 text-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Lock className="w-7 h-7" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-sky-300">
            <Shield className="w-3 h-3 text-sky-400" />
            <span>Room: {roomCode}</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Protected Scripture Room</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This study session is password-protected by the host. Enter the passcode to access the study board and collaborate.
          </p>
        </div>

        {/* Error notification banner */}
        {displayError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
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
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:opacity-50 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!password.trim() || isSubmitting}
            className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying with host...</span>
              </>
            ) : (
              <span>Unlock & Enter Study Board</span>
            )}
          </button>
        </form>

        {/* Footer info & alternative actions */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col items-center gap-2">
          <p className="text-[11px] text-slate-500 text-center">
            Ask the study group leader or room creator for the passcode.
          </p>
          <button
            onClick={handleCreateNewRoom}
            className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            <span>Or create a new open room</span>
          </button>
        </div>
      </div>
    </div>
  );
};
