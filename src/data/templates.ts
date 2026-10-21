import type { CanvasNode, Connection } from '../types';
import { PRELOADED_PASSAGES } from './bibleData';
import { LEXICON_DATABASE } from './lexiconData';

export interface StudyTemplate {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  nodes: Record<string, CanvasNode>;
  connections: Connection[];
}

export const STUDY_TEMPLATES: StudyTemplate[] = [
  {
    id: 'romans-8',
    title: 'Romans 8: The Golden Chain & Inseparable Love',
    subtitle: 'Paul’s climax of redemption, sovereignty, and perseverance',
    badge: 'Popular Study',
    description: 'Explore the unbreakable golden chain of salvation (v28-30), the Old Testament quote from Psalm 44, and the triumph of God’s agape love.',
    nodes: {
      'scripture-romans8': {
        id: 'scripture-romans8',
        type: 'scripture',
        x: 420,
        y: 120,
        zIndex: 10,
        passage: PRELOADED_PASSAGES['Romans 8:28-39'],
        highlights: {
          28: [
            {
              verseNum: 28,
              text: 'God works all things together for the good of those who love Him',
              color: 'yellow',
              tag: 'Promise',
              author: 'Sarah M.'
            }
          ],
          36: [
            {
              verseNum: 36,
              text: 'we are considered as sheep to be slaughtered',
              color: 'blue',
              tag: 'Observation',
              author: 'David L.'
            }
          ],
          37: [
            {
              verseNum: 37,
              text: 'in all these things we are more than conquerors',
              color: 'green',
              tag: 'Application',
              author: 'You'
            }
          ]
        }
      },
      'scripture-psalm44': {
        id: 'scripture-psalm44',
        type: 'scripture',
        x: 1060,
        y: 80,
        zIndex: 5,
        passage: PRELOADED_PASSAGES['Psalm 44:20-26'],
        highlights: {
          22: [
            {
              verseNum: 22,
              text: 'we are considered as sheep to be slaughtered',
              color: 'blue',
              tag: 'Observation',
              author: 'Pastor Mark'
            }
          ]
        }
      },
      'scripture-genesis50': {
        id: 'scripture-genesis50',
        type: 'scripture',
        x: 1060,
        y: 520,
        zIndex: 5,
        passage: PRELOADED_PASSAGES['Genesis 50:18-21'],
        highlights: {
          20: [
            {
              verseNum: 20,
              text: 'you meant evil against me, but God meant it for good',
              color: 'yellow',
              tag: 'Observation',
              author: 'Sarah M.'
            }
          ]
        }
      },
      'lexicon-agape': {
        id: 'lexicon-agape',
        type: 'lexicon',
        x: 20,
        y: 120,
        zIndex: 4,
        entry: LEXICON_DATABASE['G26']
      },
      'lexicon-dikaiosyne': {
        id: 'lexicon-dikaiosyne',
        type: 'lexicon',
        x: 20,
        y: 440,
        zIndex: 4,
        entry: LEXICON_DATABASE['G1343']
      },
      'sticky-observation': {
        id: 'sticky-observation',
        type: 'sticky',
        x: 430,
        y: 690,
        zIndex: 8,
        content: 'Notice the 5 links of the Golden Chain in v29-30:\n1. Foreknew\n2. Predestined\n3. Called\n4. Justified\n5. Glorified (spoken of in past tense as already secure!)',
        color: 'amber',
        category: 'Observation',
        author: 'Pastor Mark',
        authorColor: '#f59e0b'
      },
      'sticky-application': {
        id: 'sticky-application',
        type: 'sticky',
        x: 730,
        y: 690,
        zIndex: 8,
        content: 'In v35 Paul asks "Who shall separate us from the love of Christ?" He does not promise escape from suffering, but companionship through it: "in all these things we are more than conquerors."',
        color: 'emerald',
        category: 'Application',
        author: 'Sarah M.',
        authorColor: '#10b981'
      },
      'prompt-socratic': {
        id: 'prompt-socratic',
        type: 'prompt',
        x: 380,
        y: 800,
        zIndex: 7,
        category: 'Interpretation',
        question: 'Why does Paul quote Psalm 44:22 in verse 36 right in the middle of talking about God’s triumph?',
        contextHint: 'Look at the tone of Psalm 44—it is an innocent lament where faithful believers suffer.',
        answers: [
          {
            id: 'ans-1',
            author: 'David L.',
            text: 'To remind the Roman believers that persecution isn’t evidence that God abandoned them. Even the godly in Psalm 44 suffered.',
            timestamp: '10m ago'
          },
          {
            id: 'ans-2',
            author: 'You',
            text: 'Because the victory isn’t absence of sword or trouble, but that nothing cuts us off from Christ’s love!',
            timestamp: 'Just now'
          }
        ]
      }
    },
    connections: [
      {
        id: 'conn-1',
        sourceNodeId: 'scripture-romans8',
        sourceVerse: 36,
        targetNodeId: 'scripture-psalm44',
        targetVerse: 22,
        label: 'Direct OT Citation',
        type: 'direct_quote',
        description: 'Paul quotes Psalm 44:22 word-for-word from the Septuagint.',
        color: '#38bdf8'
      },
      {
        id: 'conn-2',
        sourceNodeId: 'scripture-romans8',
        sourceVerse: 28,
        targetNodeId: 'scripture-genesis50',
        targetVerse: 20,
        label: 'Thematic Echo',
        type: 'thematic_motif',
        description: 'God working evil intentions into redemptive good.',
        color: '#f59e0b'
      },
      {
        id: 'conn-3',
        sourceNodeId: 'lexicon-agape',
        targetNodeId: 'scripture-romans8',
        targetVerse: 35,
        label: 'Word Study: Agapē',
        type: 'inductive_link',
        description: 'Unbreakable divine love that anchors verse 35 & 39.',
        color: '#ec4899'
      }
    ]
  },
  {
    id: 'creation-word',
    title: 'The Logos & Creation: John 1 & Genesis 1',
    subtitle: 'Connecting the Primeval Creation to the New Creation in Christ',
    badge: 'Cosmic Christology',
    description: 'Trace how John’s Prologue mirrors Genesis 1 word for word: In the beginning, Speech, Spirit, Light, and Darkness.',
    nodes: {
      'scripture-john1': {
        id: 'scripture-john1',
        type: 'scripture',
        x: 520,
        y: 120,
        zIndex: 10,
        passage: PRELOADED_PASSAGES['John 1:1-14'],
        highlights: {
          1: [
            {
              verseNum: 1,
              text: 'In the beginning was the Word',
              color: 'purple',
              tag: 'Christ',
              author: 'Sarah M.'
            }
          ],
          5: [
            {
              verseNum: 5,
              text: 'The Light shines in the darkness, and the darkness has not overcome it',
              color: 'yellow',
              tag: 'Promise',
              author: 'David L.'
            }
          ]
        }
      },
      'scripture-gen1': {
        id: 'scripture-gen1',
        type: 'scripture',
        x: 1100,
        y: 120,
        zIndex: 5,
        passage: PRELOADED_PASSAGES['Genesis 1:1-5'],
        highlights: {
          1: [
            {
              verseNum: 1,
              text: 'In the beginning God created the heavens and the earth',
              color: 'purple',
              tag: 'Observation',
              author: 'Pastor Mark'
            }
          ],
          3: [
            {
              verseNum: 3,
              text: 'And God said, “Let there be light,” and there was light',
              color: 'yellow',
              tag: 'Observation',
              author: 'You'
            }
          ]
        }
      },
      'lexicon-logos': {
        id: 'lexicon-logos',
        type: 'lexicon',
        x: 60,
        y: 100,
        zIndex: 4,
        entry: LEXICON_DATABASE['G3056']
      },
      'lexicon-bara': {
        id: 'lexicon-bara',
        type: 'lexicon',
        x: 60,
        y: 430,
        zIndex: 4,
        entry: LEXICON_DATABASE['H1254']
      },
      'lexicon-ruach': {
        id: 'lexicon-ruach',
        type: 'lexicon',
        x: 1100,
        y: 540,
        zIndex: 4,
        entry: LEXICON_DATABASE['H7307']
      },
      'sticky-motif': {
        id: 'sticky-motif',
        type: 'sticky',
        x: 520,
        y: 640,
        zIndex: 8,
        content: 'In Genesis 1, God speaks 10 times ("And God said"). In John 1, that very Divine Word is revealed to be a Person: Jesus Christ, who became flesh and tabernacled among us!',
        color: 'rose',
        category: 'Interpretation',
        author: 'Sarah M.',
        authorColor: '#f43f5e'
      }
    },
    connections: [
      {
        id: 'conn-j1-g1',
        sourceNodeId: 'scripture-john1',
        sourceVerse: 1,
        targetNodeId: 'scripture-gen1',
        targetVerse: 1,
        label: 'Primeval Parallel: In The Beginning',
        type: 'thematic_motif',
        description: 'John uses the exact Greek LXX phrasing "En arche" to match Genesis 1:1.',
        color: '#a855f7'
      },
      {
        id: 'conn-j4-g3',
        sourceNodeId: 'scripture-john1',
        sourceVerse: 4,
        targetNodeId: 'scripture-gen1',
        targetVerse: 3,
        label: 'Light vs Darkness',
        type: 'thematic_motif',
        description: 'Physical light created in Genesis 1 corresponds to Spiritual light in Christ.',
        color: '#eab308'
      }
    ]
  }
];
