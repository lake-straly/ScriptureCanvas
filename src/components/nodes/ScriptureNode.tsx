import React, { useState } from 'react';
import type { ScriptureNodeData, HighlightColor } from '../../types';
import { BookOpen, GitFork, Info, Trash2, Sparkles, MessageSquare, BookMarked, BookText } from 'lucide-react';

interface ScriptureNodeProps {
  node: ScriptureNodeData;
  isSelected?: boolean;
  activeColor: HighlightColor;
  activeTool: string;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateHighlights: (verseNum: number, color: HighlightColor, tag?: string) => void;
  onOpenCrossRefs: (verseRef: string, verseNum: number, nodeId?: string) => void;
  onOpenLexicon: (strongs: string) => void;
  onStartConnect: (nodeId: string, verseNum?: number) => void;
  onAddStickyForVerse?: (verseRef: string) => void;
  onOpenCommentary?: (book: string, chapter: number, verse: number, verseText?: string) => void;
}

const HIGHLIGHT_CLASSES: Record<HighlightColor, string> = {
  yellow: 'bg-amber-400/20 text-amber-100 border-l-4 border-amber-400 pl-2 rounded-r',
  green: 'bg-emerald-400/20 text-emerald-100 border-l-4 border-emerald-400 pl-2 rounded-r',
  blue: 'bg-sky-400/20 text-sky-100 border-l-4 border-sky-400 pl-2 rounded-r',
  pink: 'bg-pink-400/20 text-pink-100 border-l-4 border-pink-400 pl-2 rounded-r',
  purple: 'bg-purple-400/20 text-purple-100 border-l-4 border-purple-400 pl-2 rounded-r',
  orange: 'bg-orange-400/20 text-orange-100 border-l-4 border-orange-400 pl-2 rounded-r',
};

export const ScriptureNode: React.FC<ScriptureNodeProps> = ({
  node,
  isSelected,
  activeColor,
  activeTool,
  onSelect,
  onDelete,
  onUpdateHighlights,
  onOpenCrossRefs,
  onOpenLexicon,
  onStartConnect,
  onAddStickyForVerse,
  onOpenCommentary,
}) => {
  const [showContext, setShowContext] = useState(false);
  const [showLexiconBadges, setShowLexiconBadges] = useState(true);
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const { passage, highlights } = node;

  const handleVerseClick = (verseNum: number) => {
    setActiveVerse(verseNum === activeVerse ? null : verseNum);
    if (activeTool === 'highlighter') {
      onUpdateHighlights(verseNum, activeColor);
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`w-[calc(100vw-32px)] max-w-[520px] sm:w-[520px] rounded-2xl bg-slate-900/95 border backdrop-blur-xl shadow-2xl select-text ${
        isSelected
          ? 'border-sky-500 shadow-sky-500/15 ring-2 ring-sky-500/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/70 rounded-t-2xl drag-handle cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-100 text-sm tracking-wide">
              {passage.reference}
            </h3>
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {passage.translation} • {passage.book}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Toggle Lexicon Badges */}
          <button
            onClick={() => setShowLexiconBadges(!showLexiconBadges)}
            className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              showLexiconBadges
                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Greek/Hebrew Word Study Badges"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium hidden sm:inline">Lexicon</span>
          </button>

          {/* Commentary Button */}
          {onOpenCommentary && (
            <button
              onClick={() => onOpenCommentary(passage.book, passage.chapter, passage.startVerse || 1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors flex items-center gap-1"
              title="Open Expository Commentary (Matthew Henry, Calvin, etc.)"
            >
              <BookText className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-medium hidden sm:inline">Notes</span>
            </button>
          )}

          {passage.historicalContext && (
            <button
              onClick={() => setShowContext(!showContext)}
              className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                showContext
                  ? 'bg-sky-500/20 text-sky-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Historical Context & Themes"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Connection drag button */}
          <button
            onClick={() => onStartConnect(node.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
            title="Drag to connect with another card"
          >
            <GitFork className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Remove card"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Historical Context Dropdown */}
      {showContext && passage.historicalContext && (
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Historical & Cultural Setting</span>
          </div>
          <p>{passage.historicalContext}</p>
          {passage.keyThemes && (
            <div className="flex flex-wrap gap-1 pt-1">
              {passage.keyThemes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] border border-slate-700/50"
                >
                  #{theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verses Container */}
      <div className="p-4 max-h-[520px] overflow-y-auto space-y-3.5 text-slate-200 text-sm leading-relaxed">
        {passage.verses.map((verse) => {
          const verseHighlights = highlights[verse.verseNum] || [];
          const hasHighlight = verseHighlights.length > 0;
          const highlightClass = hasHighlight
            ? HIGHLIGHT_CLASSES[verseHighlights[0].color]
            : '';

          // Find key words with Strong's entries
          const strongsWords = (verse.words || []).filter((w) => !!w.strongs);

          return (
            <div
              key={verse.verseNum}
              className={`group relative rounded-xl p-2 transition-colors ${highlightClass} ${
                activeVerse === verse.verseNum ? 'bg-slate-800/60 ring-1 ring-slate-700' : 'hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {/* Verse number */}
                <button
                  onClick={() => handleVerseClick(verse.verseNum)}
                  className="text-xs font-sans font-bold text-sky-400 pt-0.5 select-none hover:text-sky-300 min-w-[20px]"
                  title="Click to select or highlight verse"
                >
                  {verse.verseNum}
                </button>

                {/* Complete Verse text (NEVER truncated or cut off) */}
                <div 
                  onClick={() => handleVerseClick(verse.verseNum)}
                  className="flex-1 font-serif text-[15px] leading-relaxed text-slate-100 cursor-pointer"
                >
                  {verse.text}
                </div>

                {/* Commentary quick trigger badge */}
                {onOpenCommentary && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCommentary(passage.book, passage.chapter, verse.verseNum, verse.text);
                    }}
                    className="opacity-60 group-hover:opacity-100 p-1 rounded-md text-[11px] font-sans font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900 transition-all flex items-center gap-1 select-none flex-shrink-0"
                    title={`Open commentary on ${passage.book} ${passage.chapter}:${verse.verseNum}`}
                  >
                    <BookText className="w-3 h-3 text-amber-400" />
                  </button>
                )}

                {/* Cross-reference trigger badge */}
                {verse.crossRefs && verse.crossRefs.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCrossRefs(`${passage.book} ${passage.chapter}:${verse.verseNum}`, verse.verseNum, node.id);
                    }}
                    className="opacity-70 group-hover:opacity-100 px-2 py-0.5 rounded-md text-[11px] font-sans font-medium bg-sky-950/90 text-sky-300 border border-sky-800/70 hover:bg-sky-900 transition-all flex items-center gap-1 select-none flex-shrink-0"
                    title={`View ${verse.crossRefs.length} biblical cross-references`}
                  >
                    <GitFork className="w-3 h-3 text-sky-400" />
                    <span>{verse.crossRefs.length}</span>
                  </button>
                )}
              </div>

              {/* Greek / Hebrew Word Study Badges for this Verse */}
              {showLexiconBadges && strongsWords.length > 0 && (
                <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
                  {strongsWords.map((sw, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenLexicon(sw.strongs!);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-sans flex items-center gap-1.5 transition-all shadow-sm"
                      title={`Open Word Study: ${sw.lemma} (${sw.strongs})`}
                    >
                      <span className="font-serif font-semibold">{sw.lemma || sw.word}</span>
                      <span className="text-[10px] opacity-75 font-mono">({sw.strongs})</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Action Toolbar on Selected Verse */}
              {activeVerse === verse.verseNum && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs font-sans pl-7">
                  {/* Highlighter color dots */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 mr-1">Color:</span>
                    {(['yellow', 'green', 'blue', 'pink', 'purple'] as HighlightColor[]).map((c) => (
                      <button
                        key={c}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateHighlights(verse.verseNum, c);
                        }}
                        className={`w-4 h-4 rounded-full border border-white/20 transition-transform hover:scale-125 ${
                          c === 'yellow' ? 'bg-amber-400' :
                          c === 'green' ? 'bg-emerald-400' :
                          c === 'blue' ? 'bg-sky-400' :
                          c === 'pink' ? 'bg-pink-400' : 'bg-purple-400'
                        }`}
                        title={`Highlight with ${c}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    {onOpenCommentary && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCommentary(passage.book, passage.chapter, verse.verseNum, verse.text);
                        }}
                        className="hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors"
                      >
                        <BookText className="w-3 h-3 text-amber-400" />
                        <span>Commentary</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddStickyForVerse?.(`${passage.book} ${passage.chapter}:${verse.verseNum}`);
                      }}
                      className="hover:text-amber-300 flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Add Note</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCrossRefs(`${passage.book} ${passage.chapter}:${verse.verseNum}`, verse.verseNum, node.id);
                      }}
                      className="hover:text-sky-300 flex items-center gap-1 text-[11px] transition-colors"
                    >
                      <GitFork className="w-3 h-3" />
                      <span>Cross-Refs</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
