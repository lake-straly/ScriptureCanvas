import React, { useState, useEffect } from 'react';
import {
  BookText,
  X,
  Sparkles,
  Loader2,
  Copy,
  Check,
  StickyNote,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Info
} from 'lucide-react';
import {
  AVAILABLE_COMMENTARIES,
  fetchChapterCommentary,
  getCommentaryForVerse,
  type ChapterCommentaryResult
} from '../../services/commentaryApi';

interface CommentaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reference: {
    book: string;
    chapter: number;
    verse: number;
    verseText?: string;
  } | null;
  onPinAsNote?: (content: string, author: string, verseRef: string) => void;
}

export const CommentaryDrawer: React.FC<CommentaryDrawerProps> = ({
  isOpen,
  onClose,
  reference,
  onPinAsNote
}) => {
  const [selectedCommentaryId, setSelectedCommentaryId] = useState<string>('matthew-henry');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chapterData, setChapterData] = useState<ChapterCommentaryResult | null>(null);
  const [selectedVerseOverride, setSelectedVerseOverride] = useState<number | null>(null);
  const [showIntroduction, setShowIntroduction] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const book = reference?.book;
  const chapter = reference?.chapter;
  const verse = reference?.verse;

  const activeVerseNum = selectedVerseOverride ?? (verse || 1);

  // Fetch commentary whenever reference or commentator changes
  useEffect(() => {
    if (!isOpen || !book || !chapter) return;

    let isCurrent = true;
    setLoading(true);
    setError(null);

    fetchChapterCommentary(selectedCommentaryId, book, chapter)
      .then((data) => {
        if (!isCurrent) return;
        setChapterData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.warn('Commentary load error:', err);
        setError(err.message || 'Failed to load commentary.');
        setChapterData(null);
        setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [isOpen, book, chapter, selectedCommentaryId]);

  if (!isOpen || !reference) return null;

  const activeCommentaryMeta =
    AVAILABLE_COMMENTARIES.find((c) => c.id === selectedCommentaryId) ||
    AVAILABLE_COMMENTARIES[0];

  const { matchedItem, isGroupSection } = chapterData
    ? getCommentaryForVerse(chapterData, activeVerseNum)
    : { matchedItem: null, isGroupSection: false };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullCommentaryText = matchedItem
    ? matchedItem.content.join('\n\n')
    : '';

  const handlePinSticky = () => {
    if (!onPinAsNote || !fullCommentaryText) return;
    const shortExcerpt =
      fullCommentaryText.length > 350
        ? fullCommentaryText.slice(0, 347) + '...'
        : fullCommentaryText;
    const citation = `— ${activeCommentaryMeta.shortName} (${reference.book} ${reference.chapter}:${activeVerseNum})`;
    onPinAsNote(`${shortExcerpt}\n\n${citation}`, activeCommentaryMeta.shortName, `${reference.book} ${reference.chapter}:${activeVerseNum}`);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg md:max-w-xl bg-slate-900/98 border-l border-slate-800 shadow-2xl backdrop-blur-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
      {/* Top Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/80">
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">Expository Commentary</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                  Open Study
                </span>
              </div>
              <p className="text-xs text-sky-400 font-mono font-medium">
                {reference.book} {reference.chapter}:{activeVerseNum}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Close commentary drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Verse Preview */}
        {reference.verseText && (
          <div className="mt-1 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs font-serif italic text-slate-300 line-clamp-2">
            "{reference.verseText}"
          </div>
        )}

        {/* Commentator Selector Tabs / Pills */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Select Exposition
            </span>
            <span className="text-[11px] text-slate-500 italic">
              {activeCommentaryMeta.tagline}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {AVAILABLE_COMMENTARIES.map((c) => {
              const isSelected = c.id === selectedCommentaryId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCommentaryId(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-200 shadow-sm shadow-amber-500/10'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  <span>{c.shortName}</span>
                  {c.year && (
                    <span className="text-[10px] opacity-60 font-mono">({c.year})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs">Fetching {activeCommentaryMeta.shortName} notes...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-200 space-y-3">
            <div className="flex items-center gap-2 font-medium text-xs text-rose-300">
              <Info className="w-4 h-4 text-rose-400" />
              <span>Commentary Notice</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-300">{error}</p>
            {selectedCommentaryId === 'keil-delitzsch' && (
              <div className="pt-2 border-t border-rose-900/40">
                <p className="text-[11px] text-slate-400 mb-2">
                  Note: Keil & Delitzsch only covers the Old Testament. Switch to a complete commentary:
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCommentaryId('matthew-henry')}
                    className="px-2.5 py-1 rounded bg-slate-800 text-xs text-amber-300 hover:bg-slate-700"
                  >
                    Matthew Henry
                  </button>
                  <button
                    onClick={() => setSelectedCommentaryId('jamieson-fausset-brown')}
                    className="px-2.5 py-1 rounded bg-slate-800 text-xs text-sky-300 hover:bg-slate-700"
                  >
                    Jamieson-Fausset-Brown
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loaded Commentary Content */}
        {!loading && !error && chapterData && (
          <>
            {/* Quick Verse Navigation Strip */}
            {chapterData.items.length > 1 && (
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Commentary Notes Available in {chapterData.bookName} {chapterData.chapter}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {chapterData.items.map((item) => {
                    const isCurrent =
                      item.number === activeVerseNum ||
                      (isGroupSection && matchedItem?.number === item.number);
                    return (
                      <button
                        key={item.number}
                        onClick={() => setSelectedVerseOverride(item.number)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium transition-all ${
                          isCurrent
                            ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                            : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                        }`}
                      >
                        v.{item.number}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chapter Introduction Banner (if available from commentator) */}
            {chapterData.introduction && (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                <button
                  onClick={() => setShowIntroduction(!showIntroduction)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{chapterData.bookName} Chapter {chapterData.chapter} Introduction</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      showIntroduction ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {showIntroduction && (
                  <div className="px-4 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed font-serif border-t border-slate-800/60 whitespace-pre-line">
                    {chapterData.introduction}
                  </div>
                )}
              </div>
            )}

            {/* Verse Commentary Body */}
            {matchedItem ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-300 font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {isGroupSection
                        ? `Section for v.${matchedItem.number}+`
                        : `Verse ${matchedItem.number}`}
                    </span>
                    <span className="text-xs text-slate-400 font-serif">
                      by {activeCommentaryMeta.author}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyText(fullCommentaryText)}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors flex items-center gap-1"
                      title="Copy commentary text"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10px] text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Copy</span>
                        </>
                      )}
                    </button>

                    {onPinAsNote && (
                      <button
                        onClick={handlePinSticky}
                        className="px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-300 text-xs transition-colors flex items-center gap-1"
                        title="Pin this commentary excerpt as a study note card on the canvas"
                      >
                        <StickyNote className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">Pin as Note</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expository paragraphs */}
                <div className="rounded-2xl bg-slate-950/80 border border-slate-800/80 p-5 space-y-3.5 text-slate-200 font-serif text-[14px] leading-relaxed select-text">
                  {matchedItem.content.map((paragraph, idx) => (
                    <p key={idx} className="whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No specific commentary entry found for verse {activeVerseNum}. Select another verse number above or switch commentators.
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer info bar */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Public Domain Biblical Exposition • Powered by HelloAO API</span>
        </div>
        <a
          href="https://bible.helloao.org"
          target="_blank"
          rel="noreferrer"
          className="hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          <span>helloao.org</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
