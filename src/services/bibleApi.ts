import type { PassageData, Verse, Translation } from '../types';
import { PRELOADED_PASSAGES, CROSS_REFERENCES } from '../data/bibleData';
import { matchStrongsForWord } from '../data/lexiconData';

const OT_BOOKS = new Set([
  'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
  'joshua', 'judges', 'ruth', '1 samuel', '2 samuel', '1 kings', '2 kings',
  '1 chronicles', '2 chronicles', 'ezra', 'nehemiah', 'esther', 'job',
  'psalms', 'psalm', 'proverbs', 'ecclesiastes', 'song of solomon', 'song of songs',
  'isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel',
  'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
  'haggai', 'zechariah', 'malachi'
]);

function getBookGenreContext(bookName: string): { context: string; themes: string[] } {
  const b = bookName.toLowerCase();

  if (['genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy'].includes(b)) {
    return {
      context: `${bookName} belongs to the Torah (Pentateuch), establishing covenant origins, divine holiness, and God's sovereign promises.`,
      themes: ['Covenant Origins', 'Sovereignty of God', 'Divine Holiness', 'Faith & Obedience']
    };
  }
  if (['joshua', 'judges', 'ruth', '1 samuel', '2 samuel', '1 kings', '2 kings', '1 chronicles', '2 chronicles', 'ezra', 'nehemiah', 'esther'].includes(b)) {
    return {
      context: `${bookName} records covenant history, the Davidic kingdom, exile, and God's steadfast faithfulness across generations.`,
      themes: ['Providence', 'Kingdom & Covenant', 'Faithfulness in Adversity', 'Restoration']
    };
  }
  if (['job', 'psalms', 'psalm', 'proverbs', 'ecclesiastes', 'song of solomon', 'song of songs'].includes(b)) {
    return {
      context: `${bookName} is Hebrew Wisdom & Poetic literature, expressing honest lament, praise, reverent awe, and practical life in God's fear.`,
      themes: ['Worship & Prayer', 'Divine Wisdom', 'Lament & Trust', 'Heart Allegiance']
    };
  }
  if (['isaiah', 'jeremiah', 'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos', 'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah', 'haggai', 'zechariah', 'malachi'].includes(b)) {
    return {
      context: `${bookName} is prophetic literature, calling God's covenant people back to righteousness while promising the Messianic hope and future restoration.`,
      themes: ['Prophetic Justice', 'Messianic Hope', 'Judgment & Mercy', 'Eschatological Renewal']
    };
  }
  if (['matthew', 'mark', 'luke', 'john', 'acts'].includes(b)) {
    return {
      context: `${bookName} proclaims the historic arrival of the Kingdom of God in Jesus Christ, His sacrificial death, resurrection, and the Holy Spirit's empowerment.`,
      themes: ['Inaugurated Kingdom', 'Gospel of Grace', 'Incarnation & Atonement', 'Discipleship & Mission']
    };
  }
  if (['romans', '1 corinthians', '2 corinthians', 'galatians', 'ephesians', 'philippians', 'colossians', '1 thessalonians', '2 thessalonians', '1 timothy', '2 timothy', 'titus', 'philemon'].includes(b)) {
    return {
      context: `Pauline epistle written to early Christian congregations, expounding systematic gospel theology, justification by faith, and unified holy living.`,
      themes: ['Justification by Faith', 'Life in the Spirit', 'Covenant Unity', 'Christian Ethics']
    };
  }
  if (['hebrews', 'james', '1 peter', '2 peter', '1 john', '2 john', '3 john', 'jude'].includes(b)) {
    return {
      context: `General Apostolic letter encouraging persevering faithfulness, genuine love, and spiritual vigilance in the face of trials and false teaching.`,
      themes: ['Persevering Faith', 'Authentic Love', 'Christ the Ultimate High Priest', 'Living Hope']
    };
  }
  if (['revelation'].includes(b)) {
    return {
      context: `Apocalyptic prophecy unveiling the cosmic reign of the slain and risen Lamb, the defeat of demonic evil, and the eternal new heavens and earth.`,
      themes: ['Christ Victorious', 'Faithful Witness', 'Overcoming the World', 'New Creation']
    };
  }

  return {
    context: `Biblical text from ${bookName}, reflecting the divine revelation of Scripture.`,
    themes: ['Scripture Study', 'Biblical Truth', 'Prayer & Meditation']
  };
}

const TRANSLATION_MAP: Record<Translation, string> = {
  WEB: 'web',
  KJV: 'kjv',
  ASV: 'asv',
  BBE: 'bbe',
  OEB: 'oeb-us',
  BSB: 'web',
  ESV: 'web', // Fallback for bible-api.com
  YLT: 'kjv', // Fallback for bible-api.com
};

export async function fetchPassage(reference: string, translation: Translation = 'WEB'): Promise<PassageData> {
  const cleanRef = reference.trim();

  // If requesting exact preloaded passage with BSB
  if (translation === 'BSB' && PRELOADED_PASSAGES[cleanRef]) {
    return PRELOADED_PASSAGES[cleanRef];
  }

  const apiTrans = TRANSLATION_MAP[translation] || 'web';

  // Fetch dynamically from bible-api.com
  try {
    const formattedRef = encodeURIComponent(cleanRef);
    const url = `https://bible-api.com/${formattedRef}?translation=${apiTrans}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Passage "${cleanRef}" not found on Bible service. Status: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.error) {
      throw new Error(json.error);
    }

    const firstVerse = json.verses?.[0];
    const bookName = firstVerse?.book_name || json.reference?.split(' ')[0] || 'Scripture';
    const isOT = OT_BOOKS.has(bookName.toLowerCase());
    const chapterNum = firstVerse?.chapter || 1;

    const verses: Verse[] = (json.verses || []).map((v: { verse: number; text: string }) => {
      const cleanText = v.text.replace(/\r?\n+/g, ' ').replace(/\s+/g, ' ').trim();
      const rawWords = cleanText.split(/\s+/);

      // Check cross-references from indexed database for this verse
      const verseRefStr = `${bookName} ${chapterNum}:${v.verse}`;
      const matchedCrossRefs = CROSS_REFERENCES
        .filter(r => r.sourceRef.toLowerCase() === verseRefStr.toLowerCase() || r.targetRef.toLowerCase() === verseRefStr.toLowerCase())
        .map(r => (r.sourceRef.toLowerCase() === verseRefStr.toLowerCase() ? r.targetRef : r.sourceRef));

      // Tokenize all words and dynamically detect Strong's concordance key terms
      const words = rawWords.map(w => {
        const cleanWord = w.replace(/[^a-zA-Z]/g, '');
        const entry = matchStrongsForWord(cleanWord, isOT);
        return {
          word: w,
          lemma: entry ? entry.transliteration : undefined,
          strongs: entry ? entry.strongs : undefined,
          meaning: entry ? entry.shortDef : undefined,
        };
      });

      return {
        verseNum: v.verse,
        text: cleanText,
        crossRefs: matchedCrossRefs.length > 0 ? matchedCrossRefs : undefined,
        words,
      };
    });

    const genreInfo = getBookGenreContext(bookName);

    return {
      reference: json.reference || cleanRef,
      book: bookName,
      chapter: chapterNum,
      startVerse: verses[0]?.verseNum || 1,
      endVerse: verses[verses.length - 1]?.verseNum || 1,
      translation,
      verses,
      historicalContext: genreInfo.context,
      keyThemes: genreInfo.themes,
    };
  } catch (err: any) {
    console.warn(`Dynamic fetch failed for "${cleanRef}" (${translation}):`, err);

    // If preloaded matches partially, use it as fallback
    for (const [key, data] of Object.entries(PRELOADED_PASSAGES)) {
      if (key.toLowerCase().includes(cleanRef.toLowerCase()) || cleanRef.toLowerCase().includes(key.toLowerCase())) {
        return { ...data, translation };
      }
    }

    // Default fallback to Romans 8
    const fallback = PRELOADED_PASSAGES['Romans 8:28-39'];
    return {
      ...fallback,
      translation,
    };
  }
}
