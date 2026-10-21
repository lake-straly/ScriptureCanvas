import type { PassageData, ConnectionType } from '../types';

export interface CrossReferenceRelation {
  id: string;
  sourceRef: string; // e.g. "Romans 8:36"
  targetRef: string; // e.g. "Psalm 44:22"
  type: ConnectionType;
  title: string;
  explanation: string;
}

export const CROSS_REFERENCES: CrossReferenceRelation[] = [
  {
    id: 'xr-1',
    sourceRef: 'Romans 8:36',
    targetRef: 'Psalm 44:22',
    type: 'direct_quote',
    title: 'Direct OT Citation: Sheep for the Slaughter',
    explanation: 'Paul directly quotes Psalm 44:22 to show that suffering has always been the experience of God’s covenant people, yet in all these things we are more than conquerors through Christ.',
  },
  {
    id: 'xr-2',
    sourceRef: 'Romans 8:28',
    targetRef: 'Genesis 50:20',
    type: 'thematic_motif',
    title: 'Sovereign Providence: God Working for Good',
    explanation: 'Joseph’s declaration ("You intended to harm me, but God intended it for good") is the Old Testament narrative archetype of Romans 8:28.',
  },
  {
    id: 'xr-3',
    sourceRef: 'Romans 8:15',
    targetRef: 'Galatians 4:6',
    type: 'parallel_passage',
    title: 'Spirit of Adoption: "Abba, Father"',
    explanation: 'Both passages reflect the intimate Aramaic cry of the adopted child through the indwelling Holy Spirit.',
  },
  {
    id: 'xr-4',
    sourceRef: 'Romans 8:32',
    targetRef: 'Genesis 22:12',
    type: 'prophecy_fulfillment',
    title: 'The Isaac Typology: He Did Not Spare His Own Son',
    explanation: 'Paul echoes God’s words to Abraham on Mount Moriah ("you have not withheld your son, your only son"), revealing the ultimate Father who gave His Son for us all.',
  },
  {
    id: 'xr-5',
    sourceRef: 'John 1:1',
    targetRef: 'Genesis 1:1',
    type: 'thematic_motif',
    title: 'In The Beginning: The Cosmic Echo',
    explanation: 'John deliberately mimics Genesis 1:1 "Bereshit" (In the beginning) to establish Jesus Christ as the uncreated eternal Creator existing before time.',
  },
  {
    id: 'xr-6',
    sourceRef: 'John 1:4',
    targetRef: 'Genesis 1:3',
    type: 'thematic_motif',
    title: 'Light in the Darkness',
    explanation: 'The primeval command "Let there be light" finds its theological fulfillment in Christ as the light of men shining in the darkness that cannot overcome it.',
  },
  {
    id: 'xr-7',
    sourceRef: 'John 1:14',
    targetRef: 'Exodus 25:8',
    type: 'thematic_motif',
    title: 'The Tabernacle Presence: God Dwelling Among Us',
    explanation: 'John writes that the Word "eskenosen" (tabernacled/pitched His tent) among us, fulfilling the Old Testament Tabernacle and Temple where Yahweh’s glory resided.',
  },
  {
    id: 'xr-8',
    sourceRef: 'Isaiah 53:5',
    targetRef: '1 Peter 2:24',
    type: 'prophecy_fulfillment',
    title: 'Pierced for Our Transgressions',
    explanation: 'Peter directly applies Isaiah 53’s Servant Song to Jesus’ crucifixion: "by his wounds you have been healed."',
  },
  {
    id: 'xr-9',
    sourceRef: 'Isaiah 53:7',
    targetRef: 'Acts 8:32',
    type: 'direct_quote',
    title: 'Led Like a Sheep to the Slaughter',
    explanation: 'The Ethiopian eunuch was reading this exact passage in Isaiah when Philip explained the good news of Jesus Christ.',
  },
  {
    id: 'xr-10',
    sourceRef: 'Psalm 23:1',
    targetRef: 'John 10:11',
    type: 'thematic_motif',
    title: 'The Good Shepherd',
    explanation: 'Yahweh as the Shepherd of Israel in Psalm 23 is claimed directly by Jesus: "I am the good shepherd. The good shepherd lays down his life for the sheep."',
  },
  {
    id: 'xr-11',
    sourceRef: 'Revelation 21:1',
    targetRef: 'Isaiah 65:17',
    type: 'prophecy_fulfillment',
    title: 'A New Heaven and a New Earth',
    explanation: 'John’s vision of the consummation in Revelation 21 fulfills Isaiah’s prophecy of the renewed cosmos where former things are remembered no more.',
  },
  {
    id: 'xr-12',
    sourceRef: 'Revelation 22:2',
    targetRef: 'Genesis 2:9',
    type: 'thematic_motif',
    title: 'The Tree of Life: Eden Restored',
    explanation: 'The Tree of Life from which humanity was barred in Genesis 3 reappears in Revelation 22 on both sides of the river, bearing fruit for the healing of the nations.',
  }
];

export const PRELOADED_PASSAGES: Record<string, PassageData> = {
  'Romans 8:28-39': {
    reference: 'Romans 8:28-39',
    book: 'Romans',
    chapter: 8,
    startVerse: 28,
    endVerse: 39,
    translation: 'BSB',
    historicalContext: 'Written by the Apostle Paul around 57 AD from Corinth to believers in Rome facing imperial hostility and internal ethnic friction between Jewish and Gentile Christians.',
    keyThemes: ['Providence', 'Sovereignty of God', 'Eternal Security', 'Inseparable Love', 'Victory over Suffering'],
    verses: [
      {
        verseNum: 28,
        text: 'And we know that God works all things together for the good of those who love Him, who are called according to His purpose.',
        crossRefs: ['Genesis 50:20', 'Ephesians 1:11'],
        words: [
          { word: 'God', lemma: 'Theos' },
          { word: 'works', lemma: 'sunergei' },
          { word: 'together', lemma: 'panta' },
          { word: 'good', lemma: 'agathon' },
          { word: 'love', lemma: 'agaposi', strongs: 'G26' },
          { word: 'purpose', lemma: 'prothesin' }
        ]
      },
      {
        verseNum: 29,
        text: 'For those God foreknew, He also predestined to be conformed to the image of His Son, so that He might be the firstborn among many brothers.',
        crossRefs: ['Jeremiah 1:5', 'Colossians 1:18'],
        words: [
          { word: 'foreknew', lemma: 'proegno' },
          { word: 'predestined', lemma: 'proorisen' },
          { word: 'conformed', lemma: 'summorphos' },
          { word: 'image', lemma: 'eikon' },
          { word: 'firstborn', lemma: 'prototokon' }
        ]
      },
      {
        verseNum: 30,
        text: 'And those He predestined, He also called; those He called, He also justified; those He justified, He also glorified.',
        crossRefs: ['1 Corinthians 1:9', 'Romans 3:24'],
        words: [
          { word: 'called', lemma: 'ekalesen' },
          { word: 'justified', lemma: 'edikaiosen', strongs: 'G1343' },
          { word: 'glorified', lemma: 'edoxasen' }
        ]
      },
      {
        verseNum: 31,
        text: 'What then shall we say in response to these things? If God is for us, who can be against us?',
        crossRefs: ['Psalm 118:6', 'Isaiah 54:17'],
        words: [
          { word: 'say', lemma: 'eroumen' },
          { word: 'against', lemma: 'kath' }
        ]
      },
      {
        verseNum: 32,
        text: 'He who did not spare His own Son, but gave Him up for us all, how will He not also, along with Him, freely give us all things?',
        crossRefs: ['Genesis 22:12', 'John 3:16'],
        words: [
          { word: 'spare', lemma: 'epheisato' },
          { word: 'Son', lemma: 'huiou' },
          { word: 'freely give', lemma: 'charisetai', strongs: 'G5485' }
        ]
      },
      {
        verseNum: 33,
        text: 'Who will bring any charge against God’s elect? It is God who justifies.',
        crossRefs: ['Isaiah 50:8-9'],
        words: [
          { word: 'charge', lemma: 'enkalesei' },
          { word: 'elect', lemma: 'eklekton' },
          { word: 'justifies', lemma: 'dikaion', strongs: 'G1343' }
        ]
      },
      {
        verseNum: 34,
        text: 'Who is he that condemns? Christ Jesus, who died, and more than that was raised to life, is at the right hand of God and is interceding for us.',
        crossRefs: ['Hebrews 7:25', '1 John 2:1'],
        words: [
          { word: 'condemns', lemma: 'katakrinon' },
          { word: 'raised', lemma: 'egertheis' },
          { word: 'interceding', lemma: 'entynchanei' }
        ]
      },
      {
        verseNum: 35,
        text: 'Who shall separate us from the love of Christ? Shall trouble or distress or persecution or famine or nakedness or danger or sword?',
        crossRefs: ['Psalm 44:22', '2 Corinthians 11:26'],
        words: [
          { word: 'separate', lemma: 'chorisei' },
          { word: 'love', lemma: 'agapes', strongs: 'G26' },
          { word: 'trouble', lemma: 'thlipsis' },
          { word: 'distress', lemma: 'stenochoria' }
        ]
      },
      {
        verseNum: 36,
        text: 'As it is written: “For Your sake we face death all day long; we are considered as sheep to be slaughtered.”',
        crossRefs: ['Psalm 44:22'],
        words: [
          { word: 'written', lemma: 'gegraptai' },
          { word: 'slaughter', lemma: 'sphages' }
        ]
      },
      {
        verseNum: 37,
        text: 'No, in all these things we are more than conquerors through Him who loved us.',
        crossRefs: ['1 Corinthians 15:57', '1 John 5:4'],
        words: [
          { word: 'conquerors', lemma: 'hypernikomen' },
          { word: 'loved', lemma: 'agapesantos', strongs: 'G26' }
        ]
      },
      {
        verseNum: 38,
        text: 'For I am convinced that neither death nor life, neither angels nor principalities, neither the present nor the future, nor any powers,',
        crossRefs: ['Ephesians 6:12'],
        words: [
          { word: 'convinced', lemma: 'pepeismai' },
          { word: 'death', lemma: 'thanatos' },
          { word: 'life', lemma: 'zoe', strongs: 'G2222' }
        ]
      },
      {
        verseNum: 39,
        text: 'neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
        crossRefs: ['Romans 5:5', 'Colossians 3:3'],
        words: [
          { word: 'creation', lemma: 'ktisis' },
          { word: 'separate', lemma: 'chorisai' },
          { word: 'love', lemma: 'agapes', strongs: 'G26' },
          { word: 'Lord', lemma: 'Kyrio' }
        ]
      }
    ]
  },
  'Psalm 44:20-26': {
    reference: 'Psalm 44:20-26',
    book: 'Psalms',
    chapter: 44,
    startVerse: 20,
    endVerse: 26,
    translation: 'BSB',
    historicalContext: 'A national lament written by the Sons of Korah. The covenant people suffer military setback despite remaining faithful to Yahweh’s covenant law.',
    keyThemes: ['Lament', 'Persecution for God’s Sake', 'Cry for Redemption', 'Hesed'],
    verses: [
      {
        verseNum: 20,
        text: 'If we had forgotten the name of our God or spread out our hands to a foreign god,',
        words: [{ word: 'God', lemma: 'Elohim' }]
      },
      {
        verseNum: 21,
        text: 'would not God have discovered, since He knows the secrets of the heart?',
        words: [{ word: 'heart', lemma: 'lev' }]
      },
      {
        verseNum: 22,
        text: 'Yet for Your sake we face death all day long; we are considered as sheep to be slaughtered.',
        crossRefs: ['Romans 8:36'],
        words: [
          { word: 'death', lemma: 'muth' },
          { word: 'sheep', lemma: 'tson' },
          { word: 'slaughter', lemma: 'tivchah' }
        ]
      },
      {
        verseNum: 23,
        text: 'Awake, O Lord! Why do You sleep? Arise! Do not reject us forever.',
        words: [{ word: 'Lord', lemma: 'Adonai' }]
      },
      {
        verseNum: 26,
        text: 'Rise up and help us; redeem us because of Your loving devotion.',
        crossRefs: ['Exodus 34:6'],
        words: [
          { word: 'redeem', lemma: 'padah' },
          { word: 'loving devotion', lemma: 'hesed', strongs: 'H2617' }
        ]
      }
    ]
  },
  'Genesis 50:18-21': {
    reference: 'Genesis 50:18-21',
    book: 'Genesis',
    chapter: 50,
    startVerse: 18,
    endVerse: 21,
    translation: 'BSB',
    historicalContext: 'The climax of the patriarchal narrative in Egypt following Jacob’s death. Joseph speaks to his terrified brothers who sold him into slavery decades prior.',
    keyThemes: ['Providence', 'Forgiveness', 'Evil turned to Good'],
    verses: [
      {
        verseNum: 19,
        text: 'But Joseph said to them, “Do not be afraid, for am I in the place of God?”',
        words: [{ word: 'God', lemma: 'Elohim' }]
      },
      {
        verseNum: 20,
        text: '“As for you, you meant evil against me, but God meant it for good, in order to bring about this present result, to preserve many people alive.”',
        crossRefs: ['Romans 8:28'],
        words: [
          { word: 'evil', lemma: 'raah' },
          { word: 'good', lemma: 'tov' },
          { word: 'preserve', lemma: 'chayah' }
        ]
      },
      {
        verseNum: 21,
        text: '“So now, do not be afraid; I will provide for you and your little ones.” And he comforted them and spoke kindly to them.',
        words: [{ word: 'comforted', lemma: 'nacham' }]
      }
    ]
  },
  'John 1:1-14': {
    reference: 'John 1:1-14',
    book: 'John',
    chapter: 1,
    startVerse: 1,
    endVerse: 14,
    translation: 'BSB',
    historicalContext: 'The Prologue to the Fourth Gospel written by the Apostle John around 85-90 AD from Ephesus, establishing the deity and incarnation of Jesus Christ.',
    keyThemes: ['The Logos', 'Creation', 'Life and Light', 'Incarnation', 'Glory and Grace'],
    verses: [
      {
        verseNum: 1,
        text: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
        crossRefs: ['Genesis 1:1', '1 John 1:1'],
        words: [
          { word: 'beginning', lemma: 'arche' },
          { word: 'Word', lemma: 'Logos', strongs: 'G3056' },
          { word: 'God', lemma: 'Theos' }
        ]
      },
      {
        verseNum: 2,
        text: 'He was with God in the beginning.',
        words: [{ word: 'beginning', lemma: 'arche' }]
      },
      {
        verseNum: 3,
        text: 'Through Him all things were made, and without Him nothing was made that has been made.',
        crossRefs: ['Colossians 1:16', 'Hebrews 1:2'],
        words: [{ word: 'made', lemma: 'egeneto' }]
      },
      {
        verseNum: 4,
        text: 'In Him was life, and that life was the light of men.',
        crossRefs: ['Genesis 1:3', 'John 8:12'],
        words: [
          { word: 'life', lemma: 'zoe', strongs: 'G2222' },
          { word: 'light', lemma: 'phos' }
        ]
      },
      {
        verseNum: 5,
        text: 'The Light shines in the darkness, and the darkness has not overcome it.',
        crossRefs: ['Genesis 1:4', '1 John 2:8'],
        words: [
          { word: 'shines', lemma: 'phainei' },
          { word: 'darkness', lemma: 'skotia' },
          { word: 'overcome', lemma: 'katelaben' }
        ]
      },
      {
        verseNum: 14,
        text: 'The Word became flesh and made His dwelling among us. We have seen His glory, the glory of the one and only Son from the Father, full of grace and truth.',
        crossRefs: ['Exodus 25:8', 'Exodus 33:18-19'],
        words: [
          { word: 'Word', lemma: 'Logos', strongs: 'G3056' },
          { word: 'flesh', lemma: 'sarx' },
          { word: 'dwelling', lemma: 'eskenosen' },
          { word: 'glory', lemma: 'doxa' },
          { word: 'grace', lemma: 'charis', strongs: 'G5485' },
          { word: 'truth', lemma: 'aletheia' }
        ]
      }
    ]
  },
  'Genesis 1:1-5': {
    reference: 'Genesis 1:1-5',
    book: 'Genesis',
    chapter: 1,
    startVerse: 1,
    endVerse: 5,
    translation: 'BSB',
    historicalContext: 'The opening narrative of the Hebrew Scriptures establishing Yahweh as the sole transcendent Creator of the cosmos out of nothing (creatio ex nihilo).',
    keyThemes: ['Creation', 'The Spirit of God', 'Divine Speech', 'Light and Darkness'],
    verses: [
      {
        verseNum: 1,
        text: 'In the beginning God created the heavens and the earth.',
        crossRefs: ['John 1:1', 'Hebrews 11:3'],
        words: [
          { word: 'beginning', lemma: 'Bereshit' },
          { word: 'God', lemma: 'Elohim' },
          { word: 'created', lemma: 'bara', strongs: 'H1254' }
        ]
      },
      {
        verseNum: 2,
        text: 'Now the earth was formless and void, and darkness was over the surface of the deep. And the Spirit of God was hovering over the surface of the waters.',
        crossRefs: ['Psalm 104:30'],
        words: [
          { word: 'formless', lemma: 'tohu' },
          { word: 'void', lemma: 'bohu' },
          { word: 'Spirit', lemma: 'ruach', strongs: 'H7307' },
          { word: 'hovering', lemma: 'merachephet' }
        ]
      },
      {
        verseNum: 3,
        text: 'And God said, “Let there be light,” and there was light.',
        crossRefs: ['John 1:4', '2 Corinthians 4:6'],
        words: [
          { word: 'said', lemma: 'wayyomer' },
          { word: 'light', lemma: 'or' }
        ]
      },
      {
        verseNum: 4,
        text: 'And God saw that the light was good, and He separated the light from the darkness.',
        words: [
          { word: 'good', lemma: 'tov' },
          { word: 'separated', lemma: 'wayyavdel' }
        ]
      },
      {
        verseNum: 5,
        text: 'God called the light “day,” and the darkness He called “night.” And there was evening, and there was morning—the first day.',
        words: [
          { word: 'day', lemma: 'yom' },
          { word: 'night', lemma: 'laylah' }
        ]
      }
    ]
  },
  'Isaiah 53:3-7': {
    reference: 'Isaiah 53:3-7',
    book: 'Isaiah',
    chapter: 53,
    startVerse: 3,
    endVerse: 7,
    translation: 'BSB',
    historicalContext: 'The Fourth Servant Song written around 700 BC. Prophetically depicts the substitutionary atonement of Yahweh’s Servant.',
    keyThemes: ['Substitutionary Atonement', 'Suffering Servant', 'Iniquity Laid on Him'],
    verses: [
      {
        verseNum: 3,
        text: 'He was despised and rejected by men, a man of sorrows, acquainted with grief. Like one from whom men hide their faces he was despised, and we esteemed him not.',
        crossRefs: ['John 1:11'],
        words: [{ word: 'despised', lemma: 'nivzeh' }]
      },
      {
        verseNum: 4,
        text: 'Surely he took up our pain and bore our suffering, yet we considered him punished by God, stricken by him, and afflicted.',
        crossRefs: ['Matthew 8:17'],
        words: [{ word: 'bore', lemma: 'sabal' }]
      },
      {
        verseNum: 5,
        text: 'But he was pierced for our transgressions, he was crushed for our iniquities; the punishment that brought us peace was on him, and by his wounds we are healed.',
        crossRefs: ['1 Peter 2:24', 'Romans 4:25'],
        words: [
          { word: 'pierced', lemma: 'mecholal' },
          { word: 'peace', lemma: 'shalom', strongs: 'H7965' },
          { word: 'healed', lemma: 'nirpa' }
        ]
      },
      {
        verseNum: 6,
        text: 'We all, like sheep, have gone astray, each of us has turned to our own way; and the LORD has laid on him the iniquity of us all.',
        crossRefs: ['1 Peter 2:25'],
        words: [
          { word: 'sheep', lemma: 'tson' },
          { word: 'iniquity', lemma: 'avon' }
        ]
      },
      {
        verseNum: 7,
        text: 'He was oppressed and afflicted, yet he did not open his mouth; he was led like a lamb to the slaughter, and as a sheep before its shearers is silent, so he did not open his mouth.',
        crossRefs: ['Acts 8:32-33', '1 Peter 2:23'],
        words: [
          { word: 'lamb', lemma: 'seh' },
          { word: 'slaughter', lemma: 'tevach' }
        ]
      }
    ]
  }
};
