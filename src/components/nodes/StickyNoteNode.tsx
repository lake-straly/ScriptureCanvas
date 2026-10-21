import React, { useState } from 'react';
import type { StickyNoteData } from '../../types';
import { Trash2, GitFork, Tag } from 'lucide-react';

interface StickyNoteProps {
  node: StickyNoteData;
  isSelected?: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateContent: (content: string) => void;
  onUpdateCategory: (cat: StickyNoteData['category']) => void;
  onUpdateColor?: (color: StickyNoteData['color']) => void;
  onStartConnect: (nodeId: string) => void;
}

const COLOR_STYLES = {
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-950/80',
    border: 'border-amber-300 dark:border-amber-700/60',
    text: 'text-amber-900 dark:text-amber-100',
    badge: 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/80',
    border: 'border-emerald-300 dark:border-emerald-700/60',
    text: 'text-emerald-900 dark:text-emerald-100',
    badge: 'bg-emerald-200/80 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200',
  },
  blue: {
    bg: 'bg-sky-100 dark:bg-sky-950/80',
    border: 'border-sky-300 dark:border-sky-700/60',
    text: 'text-sky-900 dark:text-sky-100',
    badge: 'bg-sky-200/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200',
  },
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-950/80',
    border: 'border-rose-300 dark:border-rose-700/60',
    text: 'text-rose-900 dark:text-rose-100',
    badge: 'bg-rose-200/80 dark:bg-rose-900/60 text-rose-900 dark:text-rose-200',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-950/80',
    border: 'border-purple-300 dark:border-purple-700/60',
    text: 'text-purple-900 dark:text-purple-100',
    badge: 'bg-purple-200/80 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200',
  },
};

export const StickyNoteNode: React.FC<StickyNoteProps> = ({
  node,
  isSelected,
  onSelect,
  onDelete,
  onUpdateContent,
  onUpdateCategory,
  onUpdateColor,
  onStartConnect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(node.content);
  const style = COLOR_STYLES[node.color || 'amber'];

  const noteColors: { id: StickyNoteData['color']; bg: string }[] = [
    { id: 'amber', bg: 'bg-amber-400' },
    { id: 'blue', bg: 'bg-sky-400' },
    { id: 'emerald', bg: 'bg-emerald-400' },
    { id: 'rose', bg: 'bg-rose-400' },
    { id: 'purple', bg: 'bg-purple-400' },
  ];

  const categories: StickyNoteData['category'][] = [
    'Observation',
    'Interpretation',
    'Application',
    'Question',
  ];

  const handleBlur = () => {
    setIsEditing(false);
    onUpdateContent(content);
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`w-64 rounded-xl border p-4 shadow-xl backdrop-blur-md select-text ${style.bg} ${style.border} ${
        isSelected ? 'ring-2 ring-sky-400 scale-102' : 'hover:shadow-2xl'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/10 dark:border-white/10 drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-1.5">
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: node.authorColor || '#f59e0b' }}
          >
            {node.author ? node.author[0] : 'U'}
          </div>
          <span className="text-xs font-semibold opacity-90 truncate max-w-[90px]">
            {node.author}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isSelected && onUpdateColor && (
            <div className="flex items-center gap-1 mr-1 px-1 py-0.5 rounded-full bg-black/10 dark:bg-white/10 animate-in fade-in duration-150">
              {noteColors.map((nc) => (
                <button
                  key={nc.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateColor(nc.id);
                  }}
                  className={`w-2.5 h-2.5 rounded-full ${nc.bg} transition-transform hover:scale-125 ${
                    node.color === nc.id ? 'ring-1 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={`Color: ${nc.id}`}
                />
              ))}
            </div>
          )}
          <button
            onClick={() => onStartConnect(node.id)}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition-opacity"
            title="Connect note to verse"
          >
            <GitFork className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:text-rose-400 transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Category Pill */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onUpdateCategory(cat)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${
                node.category === cat
                  ? style.badge + ' font-bold ring-1 ring-black/20'
                  : 'opacity-40 hover:opacity-80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Note Content */}
      {isEditing ? (
        <textarea
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={handleBlur}
          rows={5}
          className="w-full bg-transparent border-0 resize-none text-xs leading-relaxed break-words focus:outline-none font-sans"
        />
      ) : (
        <div
          onDoubleClick={() => setIsEditing(true)}
          className={`text-xs leading-relaxed whitespace-pre-wrap break-words overflow-hidden font-sans cursor-text min-h-[70px] ${style.text}`}
        >
          {content || 'Double click to add note...'}
        </div>
      )}

      {/* Target reference footer if attached to a verse */}
      {node.targetVerseRef && (
        <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 flex items-center gap-1 text-[10px] opacity-75">
          <Tag className="w-2.5 h-2.5" />
          <span>{node.targetVerseRef}</span>
        </div>
      )}
    </div>
  );
};
