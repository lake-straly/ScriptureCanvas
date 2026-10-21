import type { LexiconNodeData } from '../../types';
import { Sparkles, Trash2, GitFork, BookMarked } from 'lucide-react';

interface LexiconNodeProps {
  node: LexiconNodeData;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onStartConnect: (nodeId: string) => void;
}

export const LexiconNode: React.FC<LexiconNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onStartConnect,
}) => {
  const { entry } = node;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`w-[300px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border backdrop-blur-xl shadow-2xl p-4 select-text ${
        isSelected
          ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BookMarked className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-300">
            {entry.language} Lexicon
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
            {entry.strongs}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartConnect(node.id)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300"
            title="Connect to verse"
          >
            <GitFork className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400"
            title="Remove card"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Script & Transliteration */}
      <div className="py-3 text-center border-b border-slate-800/80 bg-slate-950/40 rounded-xl my-2">
        <div className="font-serif text-3xl font-bold text-amber-300 tracking-wider">
          {entry.original}
        </div>
        <div className="text-xs font-medium text-slate-400 italic mt-0.5">
          /{entry.transliteration}/
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {entry.partOfSpeech} • {entry.occurrences}x in Scripture
        </div>
      </div>

      {/* Definition */}
      <div className="space-y-2 text-xs">
        <div>
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Definition
          </div>
          <p className="text-slate-200 mt-0.5 leading-relaxed font-sans">
            {entry.definition}
          </p>
        </div>

        {/* Theological Insight */}
        {entry.theologicalNote && (
          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-300 space-y-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400">
              <Sparkles className="w-3 h-3" />
              <span>Theological Significance</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              {entry.theologicalNote}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
