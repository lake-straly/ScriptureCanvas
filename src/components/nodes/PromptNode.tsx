import React, { useState, useRef } from 'react';
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
  const [cardWidth, setCardWidth] = useState<number>(400);
  const [threadMaxHeight, setThreadMaxHeight] = useState<number>(220);
  const cardRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  const startResizeCard = (
    e: React.PointerEvent,
    dir: 'right' | 'bottom' | 'corner'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const scale = rect.width / (el.offsetWidth || 400) || 1;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = cardWidth;
    const startH = threadRef.current ? threadRef.current.offsetHeight : threadMaxHeight;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / scale;
      const dy = (moveEvent.clientY - startY) / scale;

      if (dir === 'right' || dir === 'corner') {
        setCardWidth(Math.round(Math.min(850, Math.max(300, startW + dx))));
      }
      if (dir === 'bottom' || dir === 'corner') {
        setThreadMaxHeight(Math.round(Math.min(1200, Math.max(100, startH + dy))));
      }
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;
    onAddAnswer(newReply.trim());
    setNewReply('');
  };

  return (
    <div
      ref={cardRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{ width: `${cardWidth}px` }}
      className={`relative rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl p-4 select-text ${
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
      <div
        ref={threadRef}
        style={{ maxHeight: `${threadMaxHeight}px` }}
        className="space-y-2 overflow-y-auto pr-1"
      >
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
          className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!newReply.trim()}
          className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 transition-colors"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Right Edge Resize Handle */}
      <div
        onPointerDown={(e) => startResizeCard(e, 'right')}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute top-3 bottom-6 -right-1.5 w-3 cursor-ew-resize z-30 touch-none"
        title="Drag edge to resize card width"
      />

      {/* Bottom Edge Resize Handle */}
      <div
        onPointerDown={(e) => startResizeCard(e, 'bottom')}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        className="absolute left-4 right-7 -bottom-1.5 h-3 cursor-ns-resize z-30 touch-none"
        title="Drag bottom edge to resize discussion height"
      />

      {/* Bottom-Right Corner Resize Grip */}
      <div
        onPointerDown={(e) => startResizeCard(e, 'corner')}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setCardWidth(400);
          setThreadMaxHeight(220);
        }}
        className="absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize z-40 touch-none flex items-end justify-end p-1 text-slate-500 hover:text-indigo-400 transition-colors"
        title="Drag corner to resize card (Double-click to reset)"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M11 1L1 11M11 5.5L5.5 11M11 10L10 11"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
