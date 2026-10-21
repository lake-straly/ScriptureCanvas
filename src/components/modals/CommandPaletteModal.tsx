import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  BookMarked,
  StickyNote,
  MessageSquareQuote,
  Download,
  Crosshair,
  BookText,
  ArrowRight,
  Sparkles,
  WandSparkles,
  Keyboard
} from 'lucide-react';
import { ResizableModal } from '../ui/ResizableModal';
import type { CanvasNode, ScriptureNodeData, StickyNoteData, LexiconNodeData } from '../../types';
import { searchLexicon } from '../../data/lexiconData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Record<string, CanvasNode>;
  onFocusNode: (nodeId: string) => void;
  onAddScripture: (reference: string) => void;
  onAddLexicon: (strongs: string) => void;
  onAddSticky: () => void;
  onAddPrompt: () => void;
  onOpenCommentary: () => void;
  onOpenExport: () => void;
  onCenterCanvas: () => void;
  onTidyCanvas?: () => void;
  onOpenShortcutsHelp?: () => void;
}

interface PaletteItem {
  id: string;
  category: 'Canvas Cards' | 'Passages' | 'Greek & Hebrew' | 'Actions';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  nodes,
  onFocusNode,
  onAddScripture,
  onAddLexicon,
  onAddSticky,
  onAddPrompt,
  onOpenCommentary,
  onOpenExport,
  onCenterCanvas,
  onTidyCanvas,
  onOpenShortcutsHelp,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd+K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const items: PaletteItem[] = [];

  // 1. Matching existing nodes on the canvas
  Object.values(nodes).forEach((n) => {
    let title = '';
    let subtitle = '';
    let icon = <BookOpen className="w-4 h-4 text-sky-400" />;

    if (n.type === 'scripture') {
      const sn = n as ScriptureNodeData;
      title = sn.passage.reference;
      subtitle = `${sn.passage.translation} • ${sn.passage.verses.length} verses`;
      icon = <BookOpen className="w-4 h-4 text-sky-400" />;
    } else if (n.type === 'sticky') {
      const st = n as StickyNoteData;
      title = st.content.slice(0, 40) || 'Study Note';
      subtitle = `Note by ${st.author}${st.targetVerseRef ? ` (${st.targetVerseRef})` : ''}`;
      icon = <StickyNote className="w-4 h-4 text-amber-400" />;
    } else if (n.type === 'lexicon') {
      const lx = n as LexiconNodeData;
      title = `${lx.entry.original} (${lx.entry.transliteration})`;
      subtitle = `Strong’s ${lx.entry.strongs} • ${lx.entry.shortDef}`;
      icon = <BookMarked className="w-4 h-4 text-emerald-400" />;
    } else {
      title = (n as any).title || (n as any).question || 'Study Node';
      subtitle = n.type;
      icon = <MessageSquareQuote className="w-4 h-4 text-purple-400" />;
    }

    if (!q || title.toLowerCase().includes(q) || subtitle.toLowerCase().includes(q)) {
      items.push({
        id: `node-${n.id}`,
        category: 'Canvas Cards',
        title,
        subtitle: `Jump to card • ${subtitle}`,
        icon,
        action: () => {
          onFocusNode(n.id);
          onClose();
        },
      });
    }
  });

  // 2. Dynamic Scripture fetcher if query contains numbers or book reference
  if (q.length >= 2) {
    items.push({
      id: `add-scripture-${q}`,
      category: 'Passages',
      title: `Add Scripture: "${query.trim()}"`,
      subtitle: `Fetch and place passage onto canvas`,
      icon: <BookOpen className="w-4 h-4 text-sky-400" />,
      action: () => {
        onAddScripture(query.trim());
        onClose();
      },
    });
  }

  // 3. Greek & Hebrew Lexicon search
  if (q.length >= 2) {
    const lexiconMatches = searchLexicon(query.trim()).slice(0, 4);
    lexiconMatches.forEach((entry) => {
      items.push({
        id: `lexicon-${entry.strongs}`,
        category: 'Greek & Hebrew',
        title: `${entry.original} (${entry.transliteration})`,
        subtitle: `Strong’s ${entry.strongs} • ${entry.shortDef}`,
        icon: <BookMarked className="w-4 h-4 text-amber-400" />,
        action: () => {
          onAddLexicon(entry.strongs);
          onClose();
        },
      });
    });
  }

  // 4. Quick Actions
  const actions: PaletteItem[] = [
    {
      id: 'action-commentary',
      category: 'Actions',
      title: 'Open Expository Commentary',
      subtitle: 'Matthew Henry, Calvin, Gill, Jamieson-Fausset-Brown...',
      icon: <BookText className="w-4 h-4 text-amber-400" />,
      action: () => {
        onOpenCommentary();
        onClose();
      },
    },
    {
      id: 'action-sticky',
      category: 'Actions',
      title: 'Add Study Note Card',
      subtitle: 'Create a new reflection card on canvas',
      icon: <StickyNote className="w-4 h-4 text-amber-400" />,
      action: () => {
        onAddSticky();
        onClose();
      },
    },
    {
      id: 'action-prompt',
      category: 'Actions',
      title: 'Add Socratic Question Prompt',
      subtitle: 'Observation, Interpretation, or Application inquiry',
      icon: <MessageSquareQuote className="w-4 h-4 text-purple-400" />,
      action: () => {
        onAddPrompt();
        onClose();
      },
    },
    {
      id: 'action-export',
      category: 'Actions',
      title: 'Export Study Notes to Markdown',
      subtitle: 'Download or copy for Obsidian, Notion, or printing',
      icon: <Download className="w-4 h-4 text-sky-400" />,
      action: () => {
        onOpenExport();
        onClose();
      },
    },
    {
      id: 'action-center',
      category: 'Actions',
      title: 'Fit View / Frame All Cards (F)',
      subtitle: 'Auto-center pan and zoom to frame all study cards',
      icon: <Crosshair className="w-4 h-4 text-indigo-400" />,
      action: () => {
        onCenterCanvas();
        onClose();
      },
    },
    ...(onTidyCanvas
      ? [
          {
            id: 'action-tidy',
            category: 'Actions' as const,
            title: 'Tidy & Auto-Arrange Canvas (Shift+A)',
            subtitle: 'Neatly organize Scripture, Lexicon, and Note cards into columns',
            icon: <WandSparkles className="w-4 h-4 text-indigo-400" />,
            action: () => {
              onTidyCanvas();
              onClose();
            },
          },
        ]
      : []),
    ...(onOpenShortcutsHelp
      ? [
          {
            id: 'action-shortcuts',
            category: 'Actions' as const,
            title: 'Keyboard Shortcuts & Gestures Guide (?)',
            subtitle: 'View all canvas hotkeys, tools, and small group tips',
            icon: <Keyboard className="w-4 h-4 text-sky-400" />,
            action: () => {
              onOpenShortcutsHelp();
              onClose();
            },
          },
        ]
      : []),
  ];

  actions.forEach((a) => {
    if (!q || a.title.toLowerCase().includes(q) || (a.subtitle && a.subtitle.toLowerCase().includes(q))) {
      items.push(a);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <ResizableModal defaultWidth={580} onBackdropClick={onClose}>
      <div className="w-full flex-1 min-h-0 min-w-0 max-h-[85vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col break-words">
        {/* Search Input Bar */}
        <div className="relative border-b border-slate-800 flex items-center px-4 py-3 bg-slate-950/90">
          <Search className="w-4 h-4 text-sky-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search verses, cards, Greek/Hebrew words, or actions..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 select-none">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-[260px] max-h-[70vh] overflow-y-auto p-2 space-y-1">
          {items.length > 0 ? (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2.5 rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-semibold truncate flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                          {item.category}
                        </span>
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching cards or actions found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>ESC to dismiss</span>
          </div>
          <div className="flex items-center gap-1 text-sky-400">
            <Sparkles className="w-3 h-3" />
            <span>Quick Palette</span>
          </div>
        </div>
      </div>
    </ResizableModal>
  );
};
