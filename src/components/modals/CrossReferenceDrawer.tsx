import React, { useState } from 'react';
import { GitFork, X, Plus, Sparkles, BookOpen, Link, ArrowRight } from 'lucide-react';
import { ResizableDrawer } from '../ui/ResizableModal';
import { CROSS_REFERENCES } from '../../data/bibleData';
import type { CrossReferenceRelation } from '../../data/bibleData';
import type { ConnectionType } from '../../types';

interface CrossReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVerseRef: string | null;
  onSpawnAndConnect: (relation: CrossReferenceRelation) => void;
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  direct_quote: { label: 'Direct OT Citation', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  prophecy_fulfillment: { label: 'Prophecy & Fulfillment', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  thematic_motif: { label: 'Thematic Echo & Motif', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  parallel_passage: { label: 'Parallel Passage', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  inductive_link: { label: 'Inductive Link', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
};

export const CrossReferenceDrawer: React.FC<CrossReferenceDrawerProps> = ({
  isOpen,
  onClose,
  selectedVerseRef,
  onSpawnAndConnect,
}) => {
  const [customTarget, setCustomTarget] = useState('');
  const [customType, setCustomType] = useState<ConnectionType>('thematic_motif');
  const [customExplanation, setCustomExplanation] = useState('');

  if (!isOpen || !selectedVerseRef) return null;

  // Filter cross-references that mention this verse as source or target
  const matchedRefs = CROSS_REFERENCES.filter((r) => {
    const s = r.sourceRef.toLowerCase();
    const t = r.targetRef.toLowerCase();
    const q = selectedVerseRef.toLowerCase();
    return s.includes(q) || t.includes(q) || q.includes(s) || q.includes(t);
  });

  const handleCustomConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTarget.trim()) return;

    const customRel: CrossReferenceRelation = {
      id: `custom-xr-${Date.now()}`,
      sourceRef: selectedVerseRef,
      targetRef: customTarget.trim(),
      type: customType,
      title: `${selectedVerseRef} ➔ ${customTarget.trim()}`,
      explanation: customExplanation.trim() || 'User connected theological cross-reference.',
    };

    onSpawnAndConnect(customRel);
    setCustomTarget('');
    setCustomExplanation('');
    onClose();
  };

  return (
    <ResizableDrawer
      defaultWidth={460}
      className="bg-slate-900/98 border-l border-slate-800 shadow-2xl backdrop-blur-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200"
    >
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Biblical Hyperlinks
              </h2>
              <span className="text-xs text-sky-400 font-mono font-medium">
                {selectedVerseRef}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Quick Link Section */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
            <Link className="w-3.5 h-3.5 text-sky-400" />
            <span>Connect Any Custom Passage</span>
          </div>

          <form onSubmit={handleCustomConnect} className="space-y-2.5">
            <div>
              <input
                type="text"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                placeholder="Target reference (e.g. Genesis 15:6, James 1:2)..."
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as ConnectionType)}
                className="flex-1 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
              >
                <option value="thematic_motif">Thematic Echo</option>
                <option value="prophecy_fulfillment">Prophecy / Fulfillment</option>
                <option value="direct_quote">Direct Quote</option>
                <option value="parallel_passage">Parallel Passage</option>
                <option value="inductive_link">Inductive Link</option>
              </select>

              <button
                type="submit"
                disabled={!customTarget.trim()}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-xs transition-colors flex items-center gap-1"
              >
                <span>Connect</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <input
              type="text"
              value={customExplanation}
              onChange={(e) => setCustomExplanation(e.target.value)}
              placeholder="Brief theological note (optional)"
              className="w-full px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-slate-700"
            />
          </form>
        </div>

        {/* Content list */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Indexed Canonical Connections
          </div>

          {matchedRefs.length > 0 ? (
            matchedRefs.map((rel) => {
              const badge = TYPE_BADGES[rel.type] || TYPE_BADGES.thematic_motif;
              const isSource = rel.sourceRef.toLowerCase().includes(selectedVerseRef.toLowerCase());
              const otherRef = isSource ? rel.targetRef : rel.sourceRef;

              return (
                <div
                  key={rel.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/40 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-sky-300">
                      {otherRef}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1 font-sans">
                      {rel.explanation}
                    </p>
                  </div>

                  {/* Spawn button */}
                  <button
                    onClick={() => {
                      onSpawnAndConnect(rel);
                      onClose();
                    }}
                    className="w-full py-1.5 px-3 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Spawn {otherRef} & Draw Link</span>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800 text-center space-y-2">
              <Sparkles className="w-6 h-6 text-slate-500 mx-auto" />
              <div className="text-xs text-slate-400">
                You can link this verse to any other passage in Scripture using the form above, or drag connecting lines on the canvas!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer tip */}
      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
        <span>Tip: Drag connection handles between cards to create visual thematic arcs.</span>
      </div>
    </ResizableDrawer>
  );
};
