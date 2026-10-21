import React, { useState } from 'react';
import { 
  MousePointer, 
  Hand, 
  BookOpen, 
  StickyNote, 
  BookMarked, 
  BookText,
  MessageSquareQuote, 
  GitFork, 
  Highlighter,
  Undo2,
  Redo2,
  WandSparkles,
  Keyboard
} from 'lucide-react';
import type { HighlightColor } from '../../types';

interface ToolbarProps {
  activeTool: 'select' | 'pan' | 'connect' | 'highlighter';
  setActiveTool: (tool: 'select' | 'pan' | 'connect' | 'highlighter') => void;
  activeColor: HighlightColor;
  setActiveColor: (color: HighlightColor) => void;
  onAddScripture: () => void;
  onAddSticky: (color: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple') => void;
  onAddLexicon: (strongs: string) => void;
  onOpenLexiconDrawer?: () => void;
  onOpenCommentaryDrawer?: () => void;
  onAddPrompt: (category: 'Observation' | 'Interpretation' | 'Application') => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onTidyCanvas?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  onAddScripture,
  onAddSticky,
  onAddLexicon,
  onOpenLexiconDrawer,
  onOpenCommentaryDrawer,
  onAddPrompt,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onTidyCanvas,
  onOpenShortcutsHelp,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showStickyPicker, setShowStickyPicker] = useState(false);
  const [showPromptPicker, setShowPromptPicker] = useState(false);
  const [showLexiconPicker, setShowLexiconPicker] = useState(false);

  const colors: { color: HighlightColor; bg: string }[] = [
    { color: 'yellow', bg: 'bg-amber-400' },
    { color: 'green', bg: 'bg-emerald-400' },
    { color: 'blue', bg: 'bg-sky-400' },
    { color: 'pink', bg: 'bg-pink-400' },
    { color: 'purple', bg: 'bg-purple-400' },
  ];

  const stickyColors: { id: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple'; label: string; bg: string }[] = [
    { id: 'amber', label: 'Yellow', bg: 'bg-amber-400' },
    { id: 'blue', label: 'Blue', bg: 'bg-sky-400' },
    { id: 'emerald', label: 'Green', bg: 'bg-emerald-400' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-400' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-400' },
  ];

  return (
    <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center items-center pointer-events-none z-30 select-none px-2">
      <div className="pointer-events-auto bg-slate-950/95 backdrop-blur-2xl border border-slate-800/90 rounded-2xl shadow-2xl p-1 sm:p-1.5 flex items-center gap-0.5 sm:gap-1 max-w-[calc(100vw-16px)] overflow-x-auto no-scrollbar">
        {/* Pointer / Hand toggle */}
        <button
          onClick={() => setActiveTool('select')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'select'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Select & Move (V)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTool('pan')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'pan'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Pan Canvas (H)"
        >
          <Hand className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-slate-800 mx-0.5 sm:mx-1 flex-shrink-0" />

        {/* Add Scripture Passage */}
        <button
          onClick={onAddScripture}
          className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold group flex-shrink-0"
          title="Add Scripture Passage"
        >
          <div className="p-1 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500/20">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span className="hidden md:inline">Passage</span>
        </button>

        {/* Add Sticky Note Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              setShowStickyPicker(!showStickyPicker);
              setShowColorPicker(false);
              setShowPromptPicker(false);
              setShowLexiconPicker(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold group"
            title="Add Sticky Note"
          >
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <StickyNote className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Note</span>
          </button>

          {showStickyPicker && (
            <div className="absolute bottom-12 left-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 flex gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {stickyColors.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    onAddSticky(sc.id);
                    setShowStickyPicker(false);
                  }}
                  className={`w-6 h-6 rounded-lg ${sc.bg} hover:scale-110 transition-transform`}
                  title={sc.label}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Word Study / Lexicon */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              setShowLexiconPicker(!showLexiconPicker);
              setShowColorPicker(false);
              setShowStickyPicker(false);
              setShowPromptPicker(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold group"
            title="Word Study / Lexicon"
          >
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20">
              <BookMarked className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Word Study</span>
          </button>

          {showLexiconPicker && (
            <div className="absolute bottom-12 left-0 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs">
              <button
                onClick={() => {
                  onAddLexicon('G26');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>ἀγάπη (Agapē - Love)</span>
                <span className="text-amber-400 font-mono">G26</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('G3056');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>λόγος (Logos - Word)</span>
                <span className="text-amber-400 font-mono">G3056</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('G5485');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>χάρις (Charis - Grace)</span>
                <span className="text-amber-400 font-mono">G5485</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('G4102');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>πίστις (Pistis - Faith)</span>
                <span className="text-amber-400 font-mono">G4102</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('H7965');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>שָׁלוֹם (Shalom - Peace)</span>
                <span className="text-amber-400 font-mono">H7965</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('H2617');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>חֶסֶד (Hesed - Mercy)</span>
                <span className="text-amber-400 font-mono">H2617</span>
              </button>
              <button
                onClick={() => {
                  onAddLexicon('H7307');
                  setShowLexiconPicker(false);
                }}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 flex justify-between"
              >
                <span>רוּחַ (Ruach - Spirit)</span>
                <span className="text-amber-400 font-mono">H7307</span>
              </button>

              {onOpenLexiconDrawer && (
                <button
                  onClick={() => {
                    onOpenLexiconDrawer();
                    setShowLexiconPicker(false);
                  }}
                  className="w-full mt-1.5 pt-1.5 border-t border-slate-800 text-center text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                >
                  Search All Greek & Hebrew...
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expository Commentary Drawer Trigger */}
        {onOpenCommentaryDrawer && (
          <button
            onClick={() => {
              onOpenCommentaryDrawer();
              setShowColorPicker(false);
              setShowStickyPicker(false);
              setShowPromptPicker(false);
              setShowLexiconPicker(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-amber-200 hover:bg-slate-900 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold group flex-shrink-0"
            title="Open Biblical Commentary Notes"
          >
            <BookText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline">Commentary</span>
          </button>
        )}

        {/* Add Socratic Question */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => {
              setShowPromptPicker(!showPromptPicker);
              setShowColorPicker(false);
              setShowStickyPicker(false);
              setShowLexiconPicker(false);
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-900 transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-semibold group"
            title="Discussion Prompt"
          >
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
              <MessageSquareQuote className="w-3.5 h-3.5" />
            </div>
            <span className="hidden md:inline">Question</span>
          </button>

          {showPromptPicker && (
            <div className="absolute bottom-12 left-0 w-44 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-150 text-xs">
              <button
                onClick={() => {
                  onAddPrompt('Observation');
                  setShowPromptPicker(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-amber-300"
              >
                Observation Prompt
              </button>
              <button
                onClick={() => {
                  onAddPrompt('Interpretation');
                  setShowPromptPicker(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-sky-300"
              >
                Interpretation Prompt
              </button>
              <button
                onClick={() => {
                  onAddPrompt('Application');
                  setShowPromptPicker(false);
                }}
                className="w-full text-left p-2 rounded-lg hover:bg-slate-800 text-emerald-300"
              >
                Application Prompt
              </button>
            </div>
          )}
        </div>

        {/* Connection Tool */}
        <button
          onClick={() => setActiveTool(activeTool === 'connect' ? 'select' : 'connect')}
          className={`p-2 rounded-xl transition-all ${
            activeTool === 'connect'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Connect Link Tool (C)"
        >
          <GitFork className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-6 bg-slate-800 mx-1" />

        {/* Highlighter Tool with color palette */}
        <div className="relative">
          <button
            onClick={() => {
              setActiveTool(activeTool === 'highlighter' ? 'select' : 'highlighter');
              setShowColorPicker(!showColorPicker);
            }}
            className={`p-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTool === 'highlighter'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
            title="Highlighter Tool"
          >
            <Highlighter className="w-4 h-4" />
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                colors.find((c) => c.color === activeColor)?.bg || 'bg-amber-400'
              }`}
            />
          </button>

          {showColorPicker && (
            <div className="absolute bottom-12 right-0 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 flex gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {colors.map((c) => (
                <button
                  key={c.color}
                  onClick={() => {
                    setActiveColor(c.color);
                    setActiveTool('highlighter');
                    setShowColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-full ${c.bg} hover:scale-125 transition-transform ${
                    activeColor === c.color ? 'ring-2 ring-white scale-110' : ''
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-6 bg-slate-800 mx-0.5 sm:mx-1 flex-shrink-0" />

        {/* Undo / Redo Buttons */}
        {onUndo && (
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all flex-shrink-0"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
        )}

        {onRedo && (
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 disabled:opacity-30 disabled:pointer-events-none transition-all flex-shrink-0"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        )}

        {/* Tidy / Auto-Arrange Board */}
        {onTidyCanvas && (
          <button
            onClick={onTidyCanvas}
            className="p-2 sm:px-2.5 sm:py-2 rounded-xl text-indigo-300 hover:text-white hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
            title="Tidy & Auto-Arrange All Cards (Shift+A)"
          >
            <WandSparkles className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline">Tidy</span>
          </button>
        )}

        {/* Keyboard Shortcuts Cheat-Sheet */}
        {onOpenShortcutsHelp && (
          <button
            onClick={onOpenShortcutsHelp}
            className="p-2 rounded-xl text-slate-400 hover:text-sky-300 hover:bg-slate-900 transition-all flex-shrink-0"
            title="Keyboard Shortcuts & Guide (?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
