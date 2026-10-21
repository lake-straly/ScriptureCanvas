// Commentary Service for HelloAO Public Domain Bible Commentaries
// https://bible.helloao.org/api/

export interface CommentaryMeta {
  id: string;
  name: string;
  shortName: string;
  author: string;
  tagline: string;
  year?: string;
}

export const AVAILABLE_COMMENTARIES: CommentaryMeta[] = [
  {
    id: 'matthew-henry',
    name: 'Matthew Henry Bible Commentary',
    shortName: 'Matthew Henry',
    author: 'Matthew Henry',
    tagline: 'Classic Devotional & Practical Exposition',
    year: '1706'
  },
  {
    id: 'jamieson-fausset-brown',
    name: 'Jamieson-Fausset-Brown Bible Commentary',
    shortName: 'Jamieson-Fausset-Brown',
    author: 'Robert Jamieson, A. R. Fausset, David Brown',
    tagline: 'Critical, Explanatory & Verse-by-Verse',
    year: '1871'
  },
  {
    id: 'john-calvin',
    name: "John Calvin's Commentaries",
    shortName: 'John Calvin',
    author: 'John Calvin',
    tagline: 'Reformed Theology & Direct Exegesis',
    year: '1540-1564'
  },
  {
    id: 'john-gill',
    name: 'John Gill Bible Commentary',
    shortName: 'John Gill',
    author: 'John Gill',
    tagline: 'Exposition of the Entire Bible & Rabbinic Insights',
    year: '1746'
  },
  {
    id: 'tyndale',
    name: 'Tyndale Open Study Notes',
    shortName: 'Tyndale Notes',
    author: 'Tyndale Seminary & Open Scholars',
    tagline: 'Clear, Accessible Modern Study Notes'
  },
  {
    id: 'adam-clarke',
    name: 'Adam Clarke Bible Commentary',
    shortName: 'Adam Clarke',
    author: 'Adam Clarke',
    tagline: 'Historical, Textual & Methodological Analysis',
    year: '1810'
  },
  {
    id: 'keil-delitzsch',
    name: 'Keil & Delitzsch OT Commentary',
    shortName: 'Keil & Delitzsch',
    author: 'Carl Friedrich Keil & Franz Delitzsch',
    tagline: 'Old Testament Linguistic & Grammatical Exegesis (OT Only)',
    year: '1866'
  }
];

// Mapping common book names to standard 3-letter USFM codes
const BOOK_TO_USFM: Record<string, string> = {
  // Old Testament
  'genesis': 'GEN', 'gen': 'GEN',
  'exodus': 'EXO', 'exo': 'EXO', 'ex': 'EXO',
  'leviticus': 'LEV', 'lev': 'LEV',
  'numbers': 'NUM', 'num': 'NUM',
  'deuteronomy': 'DEU', 'deut': 'DEU', 'deu': 'DEU',
  'joshua': 'JOS', 'josh': 'JOS', 'jos': 'JOS',
  'judges': 'JDG', 'judg': 'JDG', 'jdg': 'JDG',
  'ruth': 'RUT', 'rut': 'RUT',
  '1 samuel': '1SA', '1 sam': '1SA', '1sa': '1SA',
  '2 samuel': '2SA', '2 sam': '2SA', '2sa': '2SA',
  '1 kings': '1KI', '1 kgs': '1KI', '1ki': '1KI',
  '2 kings': '2KI', '2 kgs': '2KI', '2ki': '2KI',
  '1 chronicles': '1CH', '1 chron': '1CH', '1ch': '1CH',
  '2 chronicles': '2CH', '2 chron': '2CH', '2ch': '2CH',
  'ezra': 'EZR', 'ezr': 'EZR',
  'nehemiah': 'NEH', 'neh': 'NEH',
  'esther': 'EST', 'est': 'EST',
  'job': 'JOB',
  'psalms': 'PSA', 'psalm': 'PSA', 'ps': 'PSA', 'psa': 'PSA',
  'proverbs': 'PRO', 'prov': 'PRO', 'pro': 'PRO',
  'ecclesiastes': 'ECC', 'eccl': 'ECC', 'ecc': 'ECC',
  'song of solomon': 'SNG', 'song of songs': 'SNG', 'song': 'SNG', 'sng': 'SNG', 'canticles': 'SNG',
  'isaiah': 'ISA', 'isa': 'ISA',
  'jeremiah': 'JER', 'jer': 'JER',
  'lamentations': 'LAM', 'lam': 'LAM',
  'ezekiel': 'EZK', 'ezek': 'EZK', 'ezk': 'EZK',
  'daniel': 'DAN', 'dan': 'DAN',
  'hosea': 'HOS', 'hos': 'HOS',
  'joel': 'JOL', 'jol': 'JOL',
  'amos': 'AMO', 'amo': 'AMO',
  'obadiah': 'OBA', 'obad': 'OBA', 'oba': 'OBA',
  'jonah': 'JON', 'jon': 'JON',
  'micah': 'MIC', 'mic': 'MIC',
  'nahum': 'NAM', 'nah': 'NAM', 'nam': 'NAM',
  'habakkuk': 'HAB', 'hab': 'HAB',
  'zephaniah': 'ZEP', 'zeph': 'ZEP', 'zep': 'ZEP',
  'haggai': 'HAG', 'hag': 'HAG',
  'zechariah': 'ZEC', 'zech': 'ZEC', 'zec': 'ZEC',
  'malachi': 'MAL', 'mal': 'MAL',

  // New Testament
  'matthew': 'MAT', 'matt': 'MAT', 'mat': 'MAT',
  'mark': 'MRK', 'mrk': 'MRK', 'mk': 'MRK',
  'luke': 'LUK', 'luk': 'LUK', 'lk': 'LUK',
  'john': 'JHN', 'jhn': 'JHN', 'jn': 'JHN',
  'acts': 'ACT', 'act': 'ACT',
  'romans': 'ROM', 'rom': 'ROM',
  '1 corinthians': '1CO', '1 cor': '1CO', '1co': '1CO',
  '2 corinthians': '2CO', '2 cor': '2CO', '2co': '2CO',
  'galatians': 'GAL', 'gal': 'GAL',
  'ephesians': 'EPH', 'eph': 'EPH',
  'philippians': 'PHP', 'phil': 'PHP', 'php': 'PHP',
  'colossians': 'COL', 'col': 'COL',
  '1 thessalonians': '1TH', '1 thess': '1TH', '1th': '1TH',
  '2 thessalonians': '2TH', '2 thess': '2TH', '2th': '2TH',
  '1 timothy': '1TI', '1 tim': '1TI', '1ti': '1TI',
  '2 timothy': '2TI', '2 tim': '2TI', '2ti': '2TI',
  'titus': 'TIT', 'tit': 'TIT',
  'philemon': 'PHM', 'philem': 'PHM', 'phm': 'PHM',
  'hebrews': 'HEB', 'heb': 'HEB',
  'james': 'JAS', 'jas': 'JAS',
  '1 peter': '1PE', '1 pet': '1PE', '1pe': '1PE',
  '2 peter': '2PE', '2 pet': '2PE', '2pe': '2PE',
  '1 john': '1JN', '1 jn': '1JN', '1jn': '1JN',
  '2 john': '2JN', '2 jn': '2JN', '2jn': '2JN',
  '3 john': '3JN', '3 jn': '3JN', '3jn': '3JN',
  'jude': 'JUD', 'jud': 'JUD',
  'revelation': 'REV', 'rev': 'REV', 'revelations': 'REV'
};

export function getBookUsfmCode(bookName: string): string | null {
  const clean = bookName.trim().toLowerCase();
  if (BOOK_TO_USFM[clean]) return BOOK_TO_USFM[clean];

  // Try matching stripped prefix/suffix (e.g., "The First Epistle to Corinthians")
  for (const [key, code] of Object.entries(BOOK_TO_USFM)) {
    if (clean.includes(key) || key.includes(clean)) {
      return code;
    }
  }

  // Fallback uppercase 3 letters if already code
  if (clean.length === 3) return clean.toUpperCase();

  return null;
}

export interface VerseCommentaryItem {
  type: string;
  number: number;
  content: string[];
}

export interface ChapterCommentaryResult {
  commentaryId: string;
  commentaryName: string;
  bookCode: string;
  bookName: string;
  chapter: number;
  introduction?: string;
  items: VerseCommentaryItem[];
}

// In-memory cache for fetched commentaries
const commentaryCache = new Map<string, ChapterCommentaryResult>();

export async function fetchChapterCommentary(
  commentaryId: string,
  bookNameOrCode: string,
  chapter: number
): Promise<ChapterCommentaryResult> {
  const usfm = getBookUsfmCode(bookNameOrCode) || bookNameOrCode.toUpperCase();
  const cacheKey = `${commentaryId}_${usfm}_${chapter}`;

  if (commentaryCache.has(cacheKey)) {
    return commentaryCache.get(cacheKey)!;
  }

  const url = `https://bible.helloao.org/api/c/${commentaryId}/${usfm}/${chapter}.json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Commentary for ${bookNameOrCode} chapter ${chapter} is not available in ${commentaryId} (HTTP ${res.status}).`
    );
  }

  const json = await res.json();
  const commentaryMeta = json.commentary || {};
  const bookMeta = json.book || {};
  const chapterData = json.chapter || {};

  const items: VerseCommentaryItem[] = [];
  if (Array.isArray(chapterData.content)) {
    for (const entry of chapterData.content) {
      if (entry && (entry.type === 'verse' || entry.number !== undefined)) {
        const rawContent = Array.isArray(entry.content)
          ? entry.content.map((c: any) => (typeof c === 'string' ? c : JSON.stringify(c)))
          : typeof entry.content === 'string'
          ? [entry.content]
          : [];

        items.push({
          type: entry.type || 'verse',
          number: Number(entry.number) || 1,
          content: rawContent
        });
      }
    }
  }

  const result: ChapterCommentaryResult = {
    commentaryId,
    commentaryName: commentaryMeta.englishName || commentaryMeta.name || commentaryId,
    bookCode: usfm,
    bookName: bookMeta.name || bookNameOrCode,
    chapter: Number(chapterData.number) || chapter,
    introduction: chapterData.introduction || undefined,
    items
  };

  commentaryCache.set(cacheKey, result);
  return result;
}

/**
 * Finds the commentary section corresponding to a specific verse.
 * If there's an exact verse match, returns it.
 * If the commentary groups verses (e.g., Matthew Henry v1 covers 1-9), finds the closest section <= verseNum.
 */
export function getCommentaryForVerse(
  chapterResult: ChapterCommentaryResult,
  verseNum: number
): { matchedItem: VerseCommentaryItem | null; isGroupSection: boolean } {
  if (!chapterResult.items || chapterResult.items.length === 0) {
    return { matchedItem: null, isGroupSection: false };
  }

  // 1. Direct match
  const exact = chapterResult.items.find((i) => i.number === verseNum);
  if (exact) {
    return { matchedItem: exact, isGroupSection: false };
  }

  // 2. Section enclosing this verse (largest number <= verseNum)
  const sorted = [...chapterResult.items].sort((a, b) => a.number - b.number);
  let bestCandidate: VerseCommentaryItem | null = null;
  for (const item of sorted) {
    if (item.number <= verseNum) {
      bestCandidate = item;
    } else {
      break;
    }
  }

  if (bestCandidate) {
    return { matchedItem: bestCandidate, isGroupSection: true };
  }

  // Fallback to first section if verse is before first numbered heading
  return { matchedItem: sorted[0] || null, isGroupSection: true };
}
