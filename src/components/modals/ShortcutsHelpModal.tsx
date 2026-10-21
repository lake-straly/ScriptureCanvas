import React from 'react';
import { Keyboard, X, MousePointer, Sparkles, Command } from 'lucide-react';
import { ResizableModal } from '../ui/ResizableModal';

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUT_SECTIONS = [
  {
    title: 'Canvas Navigation & Layout',
    items: [
      { keys: ['Space', 'Drag'], desc: 'Hold Spacebar & drag anywhere to pan canvas' },
      { keys: ['Scroll'], desc: 'Zoom in / out centered at mouse cursor' },
      { keys: ['F'], desc: 'Fit View — frame all study cards on screen' },
      { keys: ['Shift', 'A'], desc: 'Tidy & Auto-Arrange all cards into clean columns' },
      { keys: ['+ / -'], desc: 'Zoom in or out incrementally' },
      { keys: ['Ctrl', '0'], desc: 'Reset zoom to 100%' },
    ],
  },
  {
    title: 'Study Tools & Quick Actions',
    items: [
      { keys: ['V'], desc: 'Select & Move Tool' },
      { keys: ['H'], desc: 'Hand / Pan Tool' },
      { keys: ['C'], desc: 'Connect Cards / Inductive Link Tool' },
      { keys: ['⌘ / Ctrl', 'K'], desc: 'Open Quick Command Palette & Verse Search' },
      { keys: ['?'], desc: 'Toggle this Keyboard Shortcuts Cheat-Sheet' },
    ],
  },
  {
    title: 'Editing & History',
    items: [
      { keys: ['⌘ / Ctrl', 'Z'], desc: 'Undo last card, note, or connection change' },
      { keys: ['⌘ / Ctrl', 'Y'], desc: 'Redo change (or Cmd+Shift+Z)' },
      { keys: ['Delete / ⌫'], desc: 'Delete selected card or connection link' },
      { keys: ['Esc'], desc: 'Clear selection, cancel link drawing, or close modal' },
    ],
  },
];

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <ResizableModal defaultWidth={580} onBackdropClick={onClose}>
      <div className="w-full flex-1 min-h-0 min-w-0 max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-slate-100 space-y-5 overflow-y-auto overflow-x-hidden break-words">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Keyboard Shortcuts & Canvas Guide
              </h2>
              <p className="text-xs text-slate-400">
                Navigate, organize, and study at the speed of thought
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {SHORTCUT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-2.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5" />
                <span>{section.title}</span>
              </h3>
              <div className="grid grid-cols-1 gap-1.5 bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-900/80 transition-colors text-xs"
                  >
                    <span className="text-slate-300 min-w-0 break-words">{item.desc}</span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.keys.map((k, kIdx) => (
                        <React.Fragment key={kIdx}>
                          <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-800 text-slate-200 rounded-md border border-slate-700 shadow-inner">
                            {k}
                          </kbd>
                          {kIdx < item.keys.length - 1 && (
                            <span className="text-slate-500 text-[10px]">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Multiplayer & Touch Tip Footer */}
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-slate-300">
          <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-indigo-200 flex items-center gap-1.5">
              <MousePointer className="w-3.5 h-3.5" />
              <span>Small Group & Connection Tips</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Click any <strong>collaborator avatar</strong> in the top bar to jump to their cursor or follow their screen in real time. Click any <strong>connection line</strong> on the canvas to rename its label, pick a color, or switch between solid and dashed styles.
            </p>
          </div>
        </div>
      </div>
    </ResizableModal>
  );
};
