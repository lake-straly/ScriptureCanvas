import React, { useState } from 'react';
import type { Translation } from '../../types';
import { Search, BookOpen, X, Sparkles, Loader2, Book, Compass, AlertCircle } from 'lucide-react';
import { ResizableModal } from '../ui/ResizableModal';

interface AddPassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPassage: (reference: string, translation: Translation) => Promise<void>;
}

const TRANSLATION_OPTIONS: { id: Translation; name: string; tag: string }[] = [
  { id: 'WEB', name: 'World English Bible', tag: 'Clear & Modern' },
  { id: 'KJV', name: 'King James Version', tag: 'Literary & Classic' },
  { id: 'ASV', name: 'American Standard', tag: 'Literal & Exact' },
  { id: 'BBE', name: 'Basic English', tag: 'Simple Language' },
  { id: 'OEB', name: 'Open English Bible', tag: 'Contemporary' },
  { id: 'ESV', name: 'English Standard', tag: 'Formal Equivalence' },
  { id: 'YLT', name: "Young's Literal", tag: 'Strictly Literal' },
  { id: 'BSB', name: 'Berean Standard', tag: 'Expository Study' },
];

const CANON_BOOKS = [
  {
    category: 'Gospels & Acts',
    books: ['Matthew', 'Mark', 'Luke', 'John', 'Acts'],
  },
  {
    category: 'Pauline Epistles',
    books: ['Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '1 Timothy'],
  },
  {
    category: 'General & Revelation',
    books: ['Hebrews', 'James', '1 Peter', '1 John', 'Revelation'],
  },
  {
    category: 'Old Testament Key Books',
    books: ['Genesis', 'Exodus', 'Deuteronomy', 'Psalms', 'Proverbs', 'Isaiah', 'Jeremiah'],
  },
];

const QUICK_SUGGESTIONS = [
  { ref: 'Romans 8:28-39', desc: 'The Golden Chain & Unbreakable Love' },
  { ref: 'John 1:1-14', desc: 'The Word Became Flesh (Logos Incarnate)' },
  { ref: 'Genesis 1:1-5', desc: 'Creation: Spirit Hovering over the Deep' },
  { ref: 'Psalm 23:1-6', desc: 'The Lord is My Shepherd' },
  { ref: '1 Corinthians 13:4-8', desc: 'The Great Hymn to Love (Agapē)' },
  { ref: 'Ephesians 2:4-10', desc: 'Saved by Grace Through Faith' },
  { ref: 'Isaiah 53:3-7', desc: 'The Suffering Servant & Prophetic Atonement' },
  { ref: 'Philippians 2:5-11', desc: 'The Carmen Christi / Christ Hymn' },
];

export const AddPassageModal: React.FC<AddPassageModalProps> = ({
  isOpen,
  onClose,
  onAddPassage,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'browse'>('search');
  const [reference, setReference] = useState('');
  const [translation, setTranslation] = useState<Translation>('WEB');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!reference.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      await onAddPassage(reference.trim(), translation);
      onClose();
      setReference('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load passage. Please verify book and chapter.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuick = async (ref: string) => {
    setReference(ref);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await onAddPassage(ref, translation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not load passage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookClick = (book: string) => {
    setReference(`${book} 1`);
    setActiveTab('search');
  };

  return (
    <ResizableModal defaultWidth={580} onBackdropClick={onClose}>
      <div className="w-full h-full rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 text-slate-100 flex flex-col gap-5 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Add Scripture Passage</h2>
              <p className="text-xs text-slate-400">Search any book, chapter, or verse range in any translation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'search'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Reference</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'browse'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Browse Biblical Canon</span>
          </button>
        </div>

        {/* Translation Selector Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Bible Translation:</span>
            <span className="text-[11px] text-sky-400">
              {TRANSLATION_OPTIONS.find(t => t.id === translation)?.name} ({TRANSLATION_OPTIONS.find(t => t.id === translation)?.tag})
            </span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
            {TRANSLATION_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTranslation(t.id)}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border text-center transition-all ${
                  translation === t.id
                    ? 'bg-sky-500/25 border-sky-400 text-sky-200 shadow-sm'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
                title={`${t.name} - ${t.tag}`}
              >
                {t.id}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search View */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. John 3:16, Romans 8:28-39, Psalm 23, Ephesians 2:8-10..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={!reference.trim() || isLoading}
                className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading Passage from Scripture API...</span>
                  </>
                ) : (
                  <span>Drop Passage onto Canvas</span>
                )}
              </button>
            </form>

            {/* Quick Suggestions */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Featured Scripture Studies</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item.ref}
                    onClick={() => handleSelectQuick(item.ref)}
                    disabled={isLoading}
                    className="text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-800/40 transition-all group"
                  >
                    <div className="text-xs font-semibold text-sky-300 group-hover:text-sky-200">
                      {item.ref}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Canon Browser View */}
        {activeTab === 'browse' && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <p className="text-xs text-slate-400">
              Select any biblical book to start studying. You can refine chapter and verse numbers directly on the canvas!
            </p>
            <div className="space-y-3 flex-1 min-h-[260px] overflow-y-auto pr-1">
              {CANON_BOOKS.map((section) => (
                <div key={section.category} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-sky-400 tracking-wider uppercase">
                    {section.category}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {section.books.map((b) => (
                      <button
                        key={b}
                        onClick={() => handleBookClick(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/60 text-xs text-slate-200 transition-colors flex items-center gap-1.5"
                      >
                        <Book className="w-3 h-3 text-slate-400" />
                        <span>{b}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ResizableModal>
  );
};
