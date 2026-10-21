export type NodeType = 'scripture' | 'sticky' | 'lexicon' | 'prompt' | 'motif';

export type Translation = 'WEB' | 'KJV' | 'ASV' | 'BBE' | 'OEB' | 'ESV' | 'YLT' | 'BSB';

export interface Verse {
  verseNum: number;
  text: string;
  crossRefs?: string[];
  words?: {
    word: string;
    lemma?: string;
    strongs?: string;
    meaning?: string;
  }[];
}

export interface PassageData {
  reference: string;
  book: string;
  chapter: number;
  startVerse: number;
  endVerse: number;
  translation: Translation;
  verses: Verse[];
  historicalContext?: string;
  keyThemes?: string[];
}

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export interface VerseHighlight {
  verseNum: number;
  text: string;
  color: HighlightColor;
  tag?: 'Observation' | 'Interpretation' | 'Application' | 'Question' | 'Promise' | 'Christ';
  note?: string;
  author: string;
}

export interface CanvasNodeBase {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  zIndex?: number;
}

export interface ScriptureNodeData extends CanvasNodeBase {
  type: 'scripture';
  passage: PassageData;
  highlights: Record<number, VerseHighlight[]>; // verseNum -> highlights
  selectedVerse?: number;
}

export interface StickyNoteData extends CanvasNodeBase {
  type: 'sticky';
  content: string;
  color: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple';
  author: string;
  authorColor: string;
  category?: 'Observation' | 'Interpretation' | 'Application' | 'Question';
  targetVerseRef?: string;
}

export interface LexiconEntry {
  strongs: string;
  original: string;
  transliteration: string;
  language: 'Hebrew' | 'Greek';
  partOfSpeech: string;
  definition: string;
  shortDef: string;
  theologicalNote: string;
  occurrences: number;
}

export interface LexiconNodeData extends CanvasNodeBase {
  type: 'lexicon';
  entry: LexiconEntry;
}

export interface PromptNodeData extends CanvasNodeBase {
  type: 'prompt';
  category: 'Observation' | 'Interpretation' | 'Application' | 'Theology';
  question: string;
  contextHint?: string;
  answers: {
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }[];
}

export interface MotifNodeData extends CanvasNodeBase {
  type: 'motif';
  title: string;
  description: string;
  biblicalArc: string[];
  symbolEmoji: string;
  color: string;
}

export type CanvasNode = 
  | ScriptureNodeData 
  | StickyNoteData 
  | LexiconNodeData 
  | PromptNodeData 
  | MotifNodeData;

export type ConnectionType = 
  | 'prophecy_fulfillment' 
  | 'direct_quote' 
  | 'thematic_motif' 
  | 'parallel_passage' 
  | 'inductive_link';

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceVerse?: number;
  targetNodeId: string;
  targetVerse?: number;
  label?: string;
  type: ConnectionType;
  description?: string;
  color?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor: { x: number; y: number };
  activeNodeId?: string;
  isOnline: boolean;
  lastSeen?: number;
  hidden?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  color: string;
  avatar: string;
}

export interface RoomMeta {
  roomCode: string;
  roomTitle: string;
  hasPassword?: boolean;
}

export type PeerMessage = (
  | { type: 'PEER_JOIN'; user: UserProfile }
  | { type: 'PEER_LEAVE'; userId: string }
  | { type: 'PEER_HEARTBEAT'; user: UserProfile; cursor?: { x: number; y: number } }
  | { type: 'CURSOR_MOVE'; userId: string; cursor: { x: number; y: number } }
  | { type: 'CURSOR_LEAVE'; userId: string }
  | { type: 'NODE_MOVE'; nodeId: string; x: number; y: number; senderId: string }
  | { type: 'NODE_ADD'; node: CanvasNode; senderId: string }
  | { type: 'NODE_DELETE'; nodeId: string; senderId: string }
  | { type: 'CONNECTION_ADD'; connection: Connection; senderId: string }
  | { type: 'CONNECTION_UPDATE'; connection: Connection; senderId: string }
  | { type: 'CONNECTION_DELETE'; connectionId: string; senderId: string }
  | { type: 'SPOTLIGHT_SUMMON'; senderId: string; senderName: string; senderColor: string; worldCenter: { x: number; y: number }; zoom: number }
  | { type: 'HIGHLIGHT_UPDATE'; nodeId: string; verseNum: number; color: HighlightColor; tag?: string; author: string; senderId: string }
  | { type: 'STICKY_UPDATE'; nodeId: string; content?: string; category?: any; color?: any; senderId: string }
  | { type: 'PROMPT_ANSWER'; nodeId: string; answer: { id: string; author: string; text: string; timestamp: string }; senderId: string }
  | { type: 'TITLE_UPDATE'; title: string; senderId: string }
  | { type: 'SYNC_REQUEST'; senderId: string }
  | { type: 'SYNC_RESPONSE'; targetId: string; nodes: Record<string, CanvasNode>; connections: Connection[]; title: string; senderId: string }
  | { type: 'AUTH_CHALLENGE'; challenge: string; senderId: string; targetId?: string }
  | { type: 'AUTH_VERIFY'; challenge: string; proof: string; senderId: string; targetId?: string; user?: UserProfile }
  | { type: 'AUTH_SUCCESS'; targetId: string; senderId: string }
  | { type: 'AUTH_FAIL'; targetId: string; senderId: string; error?: string }
  | { type: 'ROOM_LOCK_STATUS'; isLocked: boolean; senderId: string }
) & { msgId?: string };

export interface CanvasState {
  nodes: Record<string, CanvasNode>;
  connections: Connection[];
  zoom: number;
  pan: { x: number; y: number };
  selectedNodeId: string | null;
  activeTool: 'select' | 'pan' | 'connect' | 'highlighter';
  roomTitle: string;
  roomCode: string;
  collaborators: Collaborator[];
}
