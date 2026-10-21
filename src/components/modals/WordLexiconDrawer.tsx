import React, { useState } from 'react';
import type { LexiconEntry } from '../../types';
import { LEXICON_DATABASE, searchLexicon } from '../../data/lexiconData';
import { BookMarked, X, Plus, Sparkles, Search } from 'lucide-react';

interface WordLexiconDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  strongs: string | null;
  onPinToCanvas: (entry: LexiconEntry) => void;
}

export const WordLexiconDrawer: React.FC<WordLexiconDrawerProps> = ({
  isOpen,
  onClose,
  strongs,
  onPinToCanvas,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideStrongs, setOverrideStrongs] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeStrongs = overrideStrongs || strongs;
  const currentEntry = activeStrongs ? LEXICON_DATABASE[activeStrongs] : Object.values(LEXICON_DATABASE)[0];
  const searchResults = searchLexicon(searchQuery);

  const handleClose = () => {
    setOverrideStrongs(null);
    setSearchQuery('');
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-slate-900/98 border-l border-slate-800 shadow-2xl backdrop-blur-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
      <div className="flex-1 overflow-y-auto pr-1">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Biblical Lexicon & Word Study
              </h2>
              {currentEntry && (
                <span className="text-xs text-amber-400 font-mono font-medium">
                  {currentEntry.language} • Strong’s {currentEntry.strongs}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Hebrew/Greek word, Strong's #, or theme (love, grace...)"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Quick Word Suggestions if searching */}
        {searchQuery.trim() && (
          <div className="mt-2 p-1.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 max-h-40 overflow-y-auto text-xs">
            {searchResults.length > 0 ? (
              searchResults.map((e) => (
                <button
                  key={e.strongs}
                  onClick={() => {
                    setOverrideStrongs(e.strongs);
                    setSearchQuery('');
                  }}
                  className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800 flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-amber-300 font-serif">
                    {e.original} ({e.transliteration})
                  </span>
                  <span className="text-[10px] text-slate-400">{e.shortDef}</span>
                </button>
              ))
            ) : (
              <div className="p-2 text-center text-[11px] text-slate-400">
                No matching lexicon entries found.
              </div>
            )}
          </div>
        )}

        {/* Word Display Hero */}
        {currentEntry && (
          <>
            <div className="my-5 p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800 text-center space-y-1.5 shadow-inner">
              <div className="font-serif text-5xl font-bold text-amber-300 tracking-wider">
                {currentEntry.original}
              </div>
              <div className="text-sm font-medium text-slate-400 italic">
                /{currentEntry.transliteration}/
              </div>
              <div className="text-xs text-slate-400">
                {currentEntry.partOfSpeech} • {currentEntry.occurrences}x occurrences in Scripture
              </div>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Literal Meaning
                </div>
                <p className="text-slate-200 mt-1 leading-relaxed text-sm">
                  {currentEntry.definition}
                </p>
              </div>

              {currentEntry.theologicalNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-slate-300 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Theological Nuance</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-300">
                    {currentEntry.theologicalNote}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pin to Canvas Action */}
      {currentEntry && (
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onPinToCanvas(currentEntry);
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Pin Word Card ({currentEntry.transliteration}) to Board</span>
          </button>
        </div>
      )}
    </div>
  );
};
