import React from 'react';
import { BookOpen, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';

interface RoomConnectingScreenProps {
  roomCode: string;
  onEnterDirectly?: () => void;
}

export const RoomConnectingScreen: React.FC<RoomConnectingScreenProps> = ({
  roomCode,
  onEnterDirectly,
}) => {
  return (
    <div className="min-h-screen w-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 select-none relative overflow-hidden">
      {/* Background ambient glowing gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* App Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-sky-500/20 border border-sky-400/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow">
            <Loader2 className="w-3.5 h-3.5 text-sky-400 animate-spin" />
          </div>
        </div>

        {/* Room Title & Brand */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-sky-400">
            <ShieldCheck className="w-3 h-3 text-sky-400" />
            <span>Room: {roomCode}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">ScriptureCanvas</h1>
          <p className="text-xs text-slate-400">
            Connecting to peer mesh & verifying room security...
          </p>
        </div>

        {/* Progress Spinner Indicator */}
        <div className="w-full p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-center gap-3 shadow-lg">
          <Loader2 className="w-4 h-4 text-sky-400 animate-spin flex-shrink-0" />
          <span className="text-xs text-slate-300 font-medium">Establishing secure session...</span>
        </div>

        {/* Optional Skip / Start button */}
        {onEnterDirectly && (
          <button
            onClick={onEnterDirectly}
            className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 pt-2"
          >
            <span>Starting a new study board? Open immediately</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
