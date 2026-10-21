import React, { useState } from 'react';
import type { PromptNodeData } from '../../types';
import { Send, Trash2, GitFork, MessageSquareQuote } from 'lucide-react';

interface PromptNodeProps {
  node: PromptNodeData;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onAddAnswer: (text: string) => void;
  onStartConnect: (nodeId: string) => void;
}

const CATEGORY_COLORS = {
  Observation: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  Interpretation: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
  Application: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  Theology: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
};

export const PromptNode: React.FC<PromptNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onAddAnswer,
  onStartConnect,
}) => {
  const [newReply, setNewReply] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    onAddAnswer(newReply.trim());
    setNewReply('');
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`w-[400px] rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl p-4 select-text ${
        isSelected
          ? 'border-indigo-400 ring-2 ring-indigo-400/20 shadow-indigo-500/10'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MessageSquareQuote className="w-4 h-4" />
          </div>
          <div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                CATEGORY_COLORS[node.category] || CATEGORY_COLORS.Interpretation
              }`}
            >
              {node.category} Question
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onStartConnect(node.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
            title="Connect question to verse"
          >
            <GitFork className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            title="Remove prompt"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Question */}
      <div className="py-3">
        <h4 className="font-semibold text-slate-100 text-sm leading-snug">
          {node.question}
        </h4>
        {node.contextHint && (
          <p className="text-[11px] text-slate-400 mt-1 italic">
            💡 Hint: {node.contextHint}
          </p>
        )}
      </div>

      {/* Group Discussion Thread */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {node.answers && node.answers.length > 0 ? (
          node.answers.map((ans) => (
            <div
              key={ans.id}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">{ans.author}</span>
                <span className="text-[10px]">{ans.timestamp}</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{ans.text}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-xs text-slate-400 italic">
            No group responses yet. Add yours below!
          </div>
        )}
      </div>

      {/* Add Reply Input */}
      <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={newReply}
          onChange={(e) => setNewReply(e.target.value)}
          placeholder="Share your insight with the group..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newReply.trim()}
          className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
