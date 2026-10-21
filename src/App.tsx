import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { 
  CanvasNode, 
  Connection, 
  HighlightColor, 
  Collaborator, 
  Translation,
  UserProfile,
  PeerMessage,
  ScriptureNodeData,
  StickyNoteData
} from './types';
import { STUDY_TEMPLATES } from './data/templates';
import type { StudyTemplate } from './data/templates';
import type { CrossReferenceRelation } from './data/bibleData';
import { LEXICON_DATABASE } from './data/lexiconData';
import { fetchPassage } from './services/bibleApi';
import { 
  getLocalUser, 
  updateLocalUser, 
  PeerSyncChannel, 
  isRoomUnlocked 
} from './services/multiplayer';

import { Navbar } from './components/ui/Navbar';
import { Toolbar } from './components/ui/Toolbar';
import { InfiniteCanvas } from './components/canvas/InfiniteCanvas';
import { MiniMap } from './components/canvas/MiniMap';
import { PresenceCursors } from './components/canvas/PresenceCursors';

import { AddPassageModal } from './components/modals/AddPassageModal';
import { CrossReferenceDrawer } from './components/modals/CrossReferenceDrawer';
import { WordLexiconDrawer } from './components/modals/WordLexiconDrawer';
import { CommentaryDrawer } from './components/modals/CommentaryDrawer';
import { TemplatePickerModal } from './components/modals/TemplatePickerModal';
import { ShareModal } from './components/modals/ShareModal';
import { UnlockRoomModal } from './components/modals/UnlockRoomModal';
import { ExportStudyModal } from './components/modals/ExportStudyModal';
import { CommandPaletteModal } from './components/modals/CommandPaletteModal';

export const App: React.FC = () => {
  // Extract roomCode from URL search param e.g. ?room=FELLOWSHIP-777
  const [roomCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('room') || 'SCRIPTURE-ROOM-777';
    }
    return 'SCRIPTURE-ROOM-777';
  });

  const STORAGE_KEY = `scripture_study_room_${roomCode}`;

  // Load saved session from localStorage or fallback to default template (Romans 8)
  const getInitialBoard = () => {
    const defaultTemplate = STUDY_TEMPLATES[0];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && Object.keys(parsed.nodes).length > 0) {
          return {
            nodes: parsed.nodes as Record<string, CanvasNode>,
            connections: (parsed.connections || []) as Connection[],
            roomTitle: parsed.roomTitle || defaultTemplate.title,
            pan: parsed.pan || { x: 180, y: 140 },
            zoom: typeof parsed.zoom === 'number' ? parsed.zoom : 0.85,
          };
        }
      }
    } catch (e) {
      console.warn('Failed to load saved board from localStorage:', e);
    }

    return {
      nodes: defaultTemplate.nodes,
      connections: defaultTemplate.connections,
      roomTitle: defaultTemplate.title,
      pan: { x: 180, y: 140 },
      zoom: 0.85,
    };
  };

  const [boardData] = useState(() => getInitialBoard());

  const [nodes, setNodes] = useState<Record<string, CanvasNode>>(boardData.nodes);
  const [connections, setConnections] = useState<Connection[]>(boardData.connections);
  const [roomTitle, setRoomTitle] = useState(boardData.roomTitle);

  // Local user guest profile
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getLocalUser());

  // Room Password Lock state
  const [isRoomLocked, setIsRoomLocked] = useState(() => !isRoomUnlocked(roomCode));

  // Canvas Viewport State (persisted across reloads)
  const [pan, setPan] = useState(boardData.pan);
  const [zoom, setZoom] = useState(boardData.zoom);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Auto-save board state to localStorage to prevent progress loss on accidental refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const payload = {
          nodes,
          connections,
          roomTitle,
          pan,
          zoom,
          lastSaved: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        console.warn('Could not auto-save to localStorage:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [nodes, connections, roomTitle, pan, zoom, STORAGE_KEY]);

  // Active Tool & Highlighter State
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'connect' | 'highlighter'>('select');
  const [activeColor, setActiveColor] = useState<HighlightColor>('yellow');

  // Modals & Drawers
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [activeCrossRef, setActiveCrossRef] = useState<{
    verseRef: string;
    verseNum: number;
    nodeId: string;
  } | null>(null);
  const [activeStrongsWord, setActiveStrongsWord] = useState<string | null>(null);
  const [activeCommentaryRef, setActiveCommentaryRef] = useState<{
    book: string;
    chapter: number;
    verse: number;
    verseText?: string;
  } | null>(null);

  // Command palette focus node handler
  const handleFocusNode = useCallback((nodeId: string) => {
    const node = nodes[nodeId];
    if (!node) return;
    const targetPanX = window.innerWidth / 2 - (node.x + 240) * zoom;
    const targetPanY = window.innerHeight / 2 - (node.y + 180) * zoom;
    setPan({ x: Math.round(targetPanX), y: Math.round(targetPanY) });
    setSelectedNodeId(nodeId);
  }, [nodes, zoom]);

  // Global listener to open command palette from anywhere
  useEffect(() => {
    const handler = () => setIsCommandPaletteOpen(true);
    window.addEventListener('open-command-palette', handler);
    return () => window.removeEventListener('open-command-palette', handler);
  }, []);

  const handleOpenCommentary = useCallback(
    (book: string, chapter: number, verse: number, verseText?: string) => {
      setActiveCommentaryRef({ book, chapter, verse, verseText });
    },
    []
  );

  const handleOpenCommentaryFromToolbar = useCallback(() => {
    // If a scripture node is already on canvas, use it; otherwise default to Romans 8:28
    const scriptureNode = Object.values(nodes).find((n) => n.type === 'scripture') as ScriptureNodeData | undefined;
    if (scriptureNode) {
      setActiveCommentaryRef({
        book: scriptureNode.passage.book,
        chapter: scriptureNode.passage.chapter,
        verse: scriptureNode.passage.startVerse || 1,
        verseText: scriptureNode.passage.verses[0]?.text,
      });
    } else {
      setActiveCommentaryRef({
        book: 'Romans',
        chapter: 8,
        verse: 28,
        verseText: 'And we know that all things work together for good to them that love God, to them who are the called according to his purpose.',
      });
    }
  }, [nodes]);

  const handlePinCommentaryAsSticky = useCallback(
    (content: string, author: string, verseRef: string) => {
      const id = `sticky-comm-${Date.now()}`;
      const x = -pan.x + window.innerWidth / 2 - 140;
      const y = -pan.y + window.innerHeight / 2 - 100;

      const newSticky: StickyNoteData = {
        id,
        type: 'sticky',
        x,
        y,
        content,
        color: 'amber',
        author: `${author}`,
        authorColor: '#f59e0b',
        category: 'Interpretation',
        targetVerseRef: verseRef,
      };

      setNodes((prev) => ({ ...prev, [id]: newSticky }));

      // Automatically connect to matching scripture node if available on canvas
      const matchingScripture = Object.values(nodes).find(
        (n) => n.type === 'scripture' && (n as ScriptureNodeData).passage.reference.toLowerCase().includes(verseRef.toLowerCase().split(':')[0])
      ) as ScriptureNodeData | undefined;

      if (matchingScripture) {
        const verseNum = parseInt(verseRef.split(':')[1], 10);
        const newConn: Connection = {
          id: `conn-comm-${Date.now()}`,
          sourceNodeId: matchingScripture.id,
          sourceVerse: !isNaN(verseNum) ? verseNum : undefined,
          targetNodeId: id,
          type: 'inductive_link',
          label: `${author} Note`,
          color: '#f59e0b',
        };
        setConnections((prev) => [...prev, newConn]);
        peerSyncRef.current?.sendConnectionAdd(newConn);
      }

      peerSyncRef.current?.sendNodeAdd(newSticky);
    },
    [pan, nodes]
  );

  // Multiplayer Collaborators State (Real peers connected via BroadcastChannel + simulated bots if enabled)
  const [realPeers, setRealPeers] = useState<Record<string, Collaborator>>({});
  const [isSimulatingCollab, setIsSimulatingCollab] = useState(false);
  const [simulatedPeers, setSimulatedPeers] = useState<Collaborator[]>([]);

  const peerSyncRef = useRef<PeerSyncChannel | null>(null);
  const lastCursorSend = useRef<number>(0);

  // References for current state inside peer callbacks
  const stateRef = useRef({ nodes, connections, roomTitle, currentUser });
  useEffect(() => {
    stateRef.current = { nodes, connections, roomTitle, currentUser };
  }, [nodes, connections, roomTitle, currentUser]);

  // Deduplication cache for cross-channel messages (BroadcastChannel + WebRTC)
  const seenMessagesRef = useRef<Set<string>>(new Set());

  // Handle incoming real-time peer messages
  const handlePeerMessage = useCallback((msg: PeerMessage) => {
    if (msg.msgId) {
      if (seenMessagesRef.current.has(msg.msgId)) return;
      seenMessagesRef.current.add(msg.msgId);
      if (seenMessagesRef.current.size > 300) {
        const first = seenMessagesRef.current.values().next().value;
        if (first) seenMessagesRef.current.delete(first);
      }
    }

    switch (msg.type) {
      case 'PEER_JOIN': {
        if (msg.user.id === stateRef.current.currentUser.id) return;
        setRealPeers((prev) => ({
          ...prev,
          [msg.user.id]: {
            id: msg.user.id,
            name: msg.user.name,
            avatar: msg.user.avatar,
            color: msg.user.color,
            cursor: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
            isOnline: true,
          },
        }));
        // Reply with current canvas state so the newcomer syncs instantly
        peerSyncRef.current?.sendSyncResponse(
          msg.user.id,
          stateRef.current.nodes,
          stateRef.current.connections,
          stateRef.current.roomTitle
        );
        break;
      }

      case 'PEER_LEAVE': {
        setRealPeers((prev) => {
          const next = { ...prev };
          delete next[msg.userId];
          return next;
        });
        break;
      }

      case 'PEER_HEARTBEAT': {
        if (msg.user.id === stateRef.current.currentUser.id) return;
        setRealPeers((prev) => ({
          ...prev,
          [msg.user.id]: {
            id: msg.user.id,
            name: msg.user.name,
            avatar: msg.user.avatar,
            color: msg.user.color,
            cursor: msg.cursor || prev[msg.user.id]?.cursor || { x: 300, y: 300 },
            isOnline: true,
          },
        }));
        break;
      }

      case 'CURSOR_MOVE': {
        if (msg.userId === stateRef.current.currentUser.id) return;
        setRealPeers((prev) => {
          const peer = prev[msg.userId];
          if (!peer) return prev;
          return {
            ...prev,
            [msg.userId]: {
              ...peer,
              cursor: msg.cursor,
            },
          };
        });
        break;
      }

      case 'NODE_MOVE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => {
          if (!prev[msg.nodeId]) return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...prev[msg.nodeId],
              x: msg.x,
              y: msg.y,
            },
          };
        });
        break;
      }

      case 'NODE_ADD': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => ({ ...prev, [msg.node.id]: msg.node }));
        break;
      }

      case 'NODE_DELETE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => {
          const next = { ...prev };
          delete next[msg.nodeId];
          return next;
        });
        setConnections((prev) =>
          prev.filter((c) => c.sourceNodeId !== msg.nodeId && c.targetNodeId !== msg.nodeId)
        );
        break;
      }

      case 'CONNECTION_ADD': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setConnections((prev) => [...prev.filter((c) => c.id !== msg.connection.id), msg.connection]);
        break;
      }

      case 'CONNECTION_DELETE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setConnections((prev) => prev.filter((c) => c.id !== msg.connectionId));
        break;
      }

      case 'HIGHLIGHT_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'scripture') return prev;
          const currentHighlights = node.highlights[msg.verseNum] || [];
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              highlights: {
                ...node.highlights,
                [msg.verseNum]: [
                  ...currentHighlights,
                  {
                    verseNum: msg.verseNum,
                    text: '',
                    color: msg.color,
                    tag: msg.tag as any,
                    author: msg.author,
                  },
                ],
              },
            },
          };
        });
        break;
      }

      case 'STICKY_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'sticky') return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              ...(msg.content !== undefined ? { content: msg.content } : {}),
              ...(msg.category !== undefined ? { category: msg.category } : {}),
            },
          };
        });
        break;
      }

      case 'PROMPT_ANSWER': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setNodes((prev) => {
          const node = prev[msg.nodeId];
          if (!node || node.type !== 'prompt') return prev;
          return {
            ...prev,
            [msg.nodeId]: {
              ...node,
              answers: [...node.answers, msg.answer],
            },
          };
        });
        break;
      }

      case 'TITLE_UPDATE': {
        if (msg.senderId === stateRef.current.currentUser.id) return;
        setRoomTitle(msg.title);
        break;
      }

      case 'SYNC_REQUEST': {
        if (msg.senderId !== stateRef.current.currentUser.id) {
          peerSyncRef.current?.sendSyncResponse(
            msg.senderId,
            stateRef.current.nodes,
            stateRef.current.connections,
            stateRef.current.roomTitle
          );
        }
        break;
      }

      case 'SYNC_RESPONSE': {
        if (msg.targetId === stateRef.current.currentUser.id) {
          setNodes(msg.nodes);
          setConnections(msg.connections);
          setRoomTitle(msg.title);
        }
        break;
      }
    }
  }, []);

  // Initialize Real-time PeerSyncChannel
  useEffect(() => {
    const channel = new PeerSyncChannel(roomCode, currentUser, handlePeerMessage);
    peerSyncRef.current = channel;

    // Send initial sync request
    channel.requestSync();

    return () => {
      channel.destroy();
      peerSyncRef.current = null;
    };
  }, [roomCode, currentUser, handlePeerMessage]);

  // Update profile handler
  const handleUpdateCurrentUser = (name: string, color?: string) => {
    const updated = updateLocalUser(name, color);
    setCurrentUser(updated);
  };

  // Broadcast cursor movements with throttle
  const handleCursorMove = (x: number, y: number) => {
    const now = Date.now();
    if (now - lastCursorSend.current > 40) { // ~25 fps broadcast
      lastCursorSend.current = now;
      peerSyncRef.current?.sendCursor(x, y);
    }
  };

  // Bot Small Group Simulation (Solo mode demonstration)
  const handleToggleCollabSimulation = () => {
    if (!isSimulatingCollab) {
      setIsSimulatingCollab(true);
      setSimulatedPeers([
        {
          id: 'sim_1',
          name: 'Sarah M.',
          avatar: 'S',
          color: '#ec4899',
          cursor: { x: 580, y: 340 },
          isOnline: true,
        },
        {
          id: 'sim_2',
          name: 'Pastor Mark',
          avatar: 'M',
          color: '#f59e0b',
          cursor: { x: 920, y: 260 },
          isOnline: true,
        },
        {
          id: 'sim_3',
          name: 'David L.',
          avatar: 'D',
          color: '#10b981',
          cursor: { x: 740, y: 480 },
          isOnline: true,
        },
      ]);
    } else {
      setIsSimulatingCollab(false);
      setSimulatedPeers([]);
    }
  };

  // Bot wander animation
  useEffect(() => {
    if (!isSimulatingCollab || simulatedPeers.length === 0) return;

    const interval = setInterval(() => {
      setSimulatedPeers((prev) =>
        prev.map((c) => {
          const deltaX = (Math.random() - 0.5) * 80;
          const deltaY = (Math.random() - 0.5) * 60;
          return {
            ...c,
            cursor: {
              x: Math.max(120, Math.min(window.innerWidth - 120, c.cursor.x + deltaX)),
              y: Math.max(100, Math.min(window.innerHeight - 100, c.cursor.y + deltaY)),
            },
          };
        })
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isSimulatingCollab, simulatedPeers.length]);

  // Combined active collaborators
  const activeCollaborators: Collaborator[] = [
    ...Object.values(realPeers),
    ...simulatedPeers,
  ];

  const handleCenterCanvas = () => {
    setPan({ x: 120, y: 60 });
    setZoom(0.85);
  };

  // Node Position Updater
  const handleUpdateNodePosition = (nodeId: string, x: number, y: number) => {
    setNodes((prev) => {
      if (!prev[nodeId]) return prev;
      return {
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          x,
          y,
        },
      };
    });
    // Broadcast node position
    peerSyncRef.current?.sendNodeMove(nodeId, x, y);
  };

  // Node Deletion
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => {
      const next = { ...prev };
      delete next[nodeId];
      return next;
    });
    setConnections((prev) =>
      prev.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId)
    );
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    peerSyncRef.current?.sendNodeDelete(nodeId);
  };

  // Connection Deletion
  const handleDeleteConnection = (connectionId: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== connectionId));
    peerSyncRef.current?.sendConnectionDelete(connectionId);
  };

  // Highlights Updater
  const handleUpdateHighlights = (
    nodeId: string,
    verseNum: number,
    color: HighlightColor,
    tag?: string
  ) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'scripture') return prev;

      const currentHighlights = node.highlights[verseNum] || [];
      const updatedHighlights = [
        ...currentHighlights,
        {
          verseNum,
          text: '',
          color,
          tag: tag as any,
          author: currentUser.name,
        },
      ];

      return {
        ...prev,
        [nodeId]: {
          ...node,
          highlights: {
            ...node.highlights,
            [verseNum]: updatedHighlights,
          },
        },
      };
    });

    peerSyncRef.current?.sendHighlightUpdate(nodeId, verseNum, color, tag);
  };

  // Sticky Note Content & Category
  const handleUpdateStickyContent = (nodeId: string, content: string) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'sticky') return prev;
      return { ...prev, [nodeId]: { ...node, content } };
    });
    peerSyncRef.current?.sendStickyUpdate(nodeId, content, undefined);
  };

  const handleUpdateStickyCategory = (nodeId: string, category: any) => {
    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'sticky') return prev;
      return { ...prev, [nodeId]: { ...node, category } };
    });
    peerSyncRef.current?.sendStickyUpdate(nodeId, undefined, category);
  };

  // Prompt Question Answer
  const handleAddPromptAnswer = (nodeId: string, text: string) => {
    const answer = {
      id: `ans-${Date.now()}`,
      author: currentUser.name,
      text,
      timestamp: 'Just now',
    };

    setNodes((prev) => {
      const node = prev[nodeId];
      if (!node || node.type !== 'prompt') return prev;
      return {
        ...prev,
        [nodeId]: {
          ...node,
          answers: [...node.answers, answer],
        },
      };
    });

    peerSyncRef.current?.sendPromptAnswer(nodeId, answer);
  };

  // Connect Two Nodes Manually
  const handleConnectNodes = (sourceId: string, targetId: string) => {
    const newConn: Connection = {
      id: `conn-${Date.now()}`,
      sourceNodeId: sourceId,
      targetNodeId: targetId,
      label: 'Thematic Link',
      type: 'thematic_motif',
      color: '#38bdf8',
    };
    setConnections((prev) => [...prev, newConn]);
    peerSyncRef.current?.sendConnectionAdd(newConn);
  };

  // Add Scripture Passage to Canvas
  const handleAddPassage = async (reference: string, translation: Translation) => {
    const passage = await fetchPassage(reference, translation);
    const id = `scripture-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'scripture',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 240),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 180),
      zIndex: 10,
      passage,
      highlights: {},
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Sticky Note
  const handleAddSticky = (color: 'amber' | 'blue' | 'emerald' | 'rose' | 'purple') => {
    const id = `sticky-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'sticky',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 100),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 80),
      zIndex: 15,
      content: '',
      color,
      author: currentUser.name,
      authorColor: currentUser.color,
      category: 'Observation',
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Word Study / Lexicon Node
  const handleAddLexicon = (strongs: string) => {
    const entry = LEXICON_DATABASE[strongs];
    if (!entry) return;

    const id = `lexicon-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'lexicon',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 150),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 120),
      zIndex: 12,
      entry,
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Add Socratic Prompt
  const handleAddPrompt = (category: 'Observation' | 'Interpretation' | 'Application') => {
    const id = `prompt-${Date.now()}`;
    const questions = {
      Observation: 'What repeated phrases, contrasting words, or logical connectives stand out in this text?',
      Interpretation: 'What is the author trying to communicate to their original audience in this specific historical setting?',
      Application: 'How does the truth of this passage call you to think, pray, or live differently this week?',
    };

    const newNode: CanvasNode = {
      id,
      type: 'prompt',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom) - 200),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom) - 120),
      zIndex: 14,
      category,
      question: questions[category],
      answers: [],
    };

    setNodes((prev) => ({ ...prev, [id]: newNode }));
    setSelectedNodeId(id);
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Spawn Cross Reference & Connect on Canvas
  const handleSpawnAndConnect = async (relation: CrossReferenceRelation) => {
    if (!activeCrossRef) return;

    const sourceNodeId = activeCrossRef.nodeId;
    const sourceNode = nodes[sourceNodeId];
    const sourceVerse = activeCrossRef.verseNum;

    // Helper to extract verse number from reference string (e.g. "Psalm 44:22" -> 22)
    const parseVerseNum = (refStr: string) => {
      const match = refStr.match(/:(\d+)/);
      return match ? parseInt(match[1], 10) : undefined;
    };

    const isSource = relation.sourceRef.toLowerCase().includes(activeCrossRef.verseRef.toLowerCase());
    const targetRef = isSource ? relation.targetRef : relation.sourceRef;
    const targetVerse = parseVerseNum(targetRef);

    // Look for existing target passage on the canvas
    let targetNodeId = Object.keys(nodes).find((id) => {
      const n = nodes[id];
      if (n.type !== 'scripture') return false;
      const cleanRef = targetRef.toLowerCase();
      const nRef = n.passage.reference.toLowerCase();
      return (
        nRef.includes(cleanRef) ||
        cleanRef.includes(nRef) ||
        (targetVerse !== undefined &&
          n.passage.verses.some((v) => v.verseNum === targetVerse) &&
          nRef.split(' ')[0] === cleanRef.split(' ')[0])
      );
    });

    // If target doesn't exist, fetch & spawn it
    if (!targetNodeId) {
      const passageData = await fetchPassage(targetRef, 'WEB');
      targetNodeId = `scripture-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

      // Count existing target connections from this source so multiple spawned cards don't overlap
      const existingConnectedCount = connections.filter((c) => c.sourceNodeId === sourceNodeId).length;

      const spawnX = sourceNode ? sourceNode.x + 580 : 600;
      const staggerY = existingConnectedCount * 280;
      const spawnY = sourceNode ? sourceNode.y + staggerY : 200 + staggerY;

      const newTargetNode: CanvasNode = {
        id: targetNodeId,
        type: 'scripture',
        x: spawnX,
        y: spawnY,
        zIndex: 10,
        passage: passageData,
        highlights: targetVerse ? {
          [targetVerse]: [{
            verseNum: targetVerse,
            text: '',
            color: 'blue',
            tag: 'Observation',
            author: 'Cross-Reference',
          }]
        } : {},
      };

      setNodes((prev) => ({ ...prev, [targetNodeId!]: newTargetNode }));
      peerSyncRef.current?.sendNodeAdd(newTargetNode);
    }

    // Add connecting line WITH exact sourceVerse and targetVerse
    const newConnection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      sourceNodeId: sourceNodeId,
      sourceVerse: sourceVerse,
      targetNodeId: targetNodeId,
      targetVerse: targetVerse,
      label: relation.title,
      type: relation.type,
      description: relation.explanation,
      color: relation.type === 'direct_quote' ? '#38bdf8' : relation.type === 'prophecy_fulfillment' ? '#10b981' : '#f59e0b',
    };

    setConnections((prev) => [...prev, newConnection]);
    peerSyncRef.current?.sendConnectionAdd(newConnection);
  };

  // Add Sticky for Verse
  const handleAddStickyForVerse = (verseRef: string) => {
    const id = `sticky-${Date.now()}`;
    const newNode: CanvasNode = {
      id,
      type: 'sticky',
      x: Math.round(-pan.x / zoom + window.innerWidth / (2 * zoom)),
      y: Math.round(-pan.y / zoom + window.innerHeight / (2 * zoom)),
      zIndex: 15,
      content: '',
      color: 'amber',
      author: currentUser.name,
      authorColor: currentUser.color,
      category: 'Observation',
      targetVerseRef: verseRef,
    };
    setNodes((prev) => ({ ...prev, [id]: newNode }));
    peerSyncRef.current?.sendNodeAdd(newNode);
  };

  // Switch Template
  const handleSelectTemplate = (tmpl: StudyTemplate | null) => {
    if (tmpl) {
      setNodes(tmpl.nodes);
      setConnections(tmpl.connections);
      setRoomTitle(tmpl.title);
      setPan({ x: 180, y: 140 });
      setZoom(0.85);
      peerSyncRef.current?.sendTitleUpdate(tmpl.title);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes: tmpl.nodes,
          connections: tmpl.connections,
          roomTitle: tmpl.title,
          pan: { x: 180, y: 140 },
          zoom: 0.85,
          lastSaved: Date.now(),
        }));
      } catch (e) {
        console.warn(e);
      }
    } else {
      setNodes({});
      setConnections([]);
      setRoomTitle('Fresh Scripture Study Canvas');
      peerSyncRef.current?.sendTitleUpdate('Fresh Scripture Study Canvas');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          nodes: {},
          connections: [],
          roomTitle: 'Fresh Scripture Study Canvas',
          pan: { x: 180, y: 140 },
          zoom: 0.85,
          lastSaved: Date.now(),
        }));
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleUpdateRoomTitle = (title: string) => {
    setRoomTitle(title);
    peerSyncRef.current?.sendTitleUpdate(title);
  };

  return (
    <div className="w-screen h-screen relative bg-slate-950 overflow-hidden font-sans select-none">
      {/* Top Navigation */}
      <Navbar
        roomTitle={roomTitle}
        onUpdateTitle={handleUpdateRoomTitle}
        collaborators={activeCollaborators}
        currentUser={currentUser}
        roomCode={roomCode}
        zoom={zoom}
        onZoomIn={() => setZoom((z: number) => Math.min(z * 1.15, 2.2))}
        onZoomOut={() => setZoom((z: number) => Math.max(z / 1.15, 0.35))}
        onResetZoom={() => setZoom(1)}
        onCenterCanvas={handleCenterCanvas}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Infinite Canvas */}
      <InfiniteCanvas
        nodes={nodes}
        connections={connections}
        zoom={zoom}
        pan={pan}
        activeTool={activeTool}
        activeColor={activeColor}
        selectedNodeId={selectedNodeId}
        onPanChange={setPan}
        onZoomChange={setZoom}
        onSelectNode={setSelectedNodeId}
        onUpdateNodePosition={handleUpdateNodePosition}
        onDeleteNode={handleDeleteNode}
        onDeleteConnection={handleDeleteConnection}
        onUpdateHighlights={handleUpdateHighlights}
        onUpdateStickyContent={handleUpdateStickyContent}
        onUpdateStickyCategory={handleUpdateStickyCategory}
        onAddPromptAnswer={handleAddPromptAnswer}
        onOpenCrossRefs={(ref, verseNum, nodeId) => {
          let resolvedNodeId = nodeId;
          if (!resolvedNodeId) {
            resolvedNodeId = Object.keys(nodes).find((id) => {
              const n = nodes[id];
              return n.type === 'scripture' && n.passage.verses.some((v) => v.verseNum === verseNum);
            }) || Object.keys(nodes)[0];
          }
          setActiveCrossRef({ verseRef: ref, verseNum, nodeId: resolvedNodeId });
        }}
        onOpenLexicon={(strongs) => setActiveStrongsWord(strongs)}
        onAddStickyForVerse={handleAddStickyForVerse}
        onOpenCommentary={handleOpenCommentary}
        onConnectNodes={handleConnectNodes}
        onCursorMove={handleCursorMove}
      />

      {/* Floating Toolbar */}
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        onAddScripture={() => setIsPassageModalOpen(true)}
        onAddSticky={handleAddSticky}
        onAddLexicon={handleAddLexicon}
        onOpenLexiconDrawer={() => setActiveStrongsWord('G26')}
        onOpenCommentaryDrawer={handleOpenCommentaryFromToolbar}
        onAddPrompt={handleAddPrompt}
      />

      {/* MiniMap in Bottom-Left */}
      <div className="absolute bottom-6 left-6 z-20">
        <MiniMap
          nodes={nodes}
          pan={pan}
          zoom={zoom}
          onPanTo={(x, y) => setPan({ x, y })}
        />
      </div>

      {/* Multiplayer Live Cursors (Rendered for real connected peers & simulation) */}
      <PresenceCursors collaborators={activeCollaborators} />

      {/* Modals & Drawers */}
      <AddPassageModal
        isOpen={isPassageModalOpen}
        onClose={() => setIsPassageModalOpen(false)}
        onAddPassage={handleAddPassage}
      />

      <CrossReferenceDrawer
        isOpen={!!activeCrossRef}
        onClose={() => setActiveCrossRef(null)}
        selectedVerseRef={activeCrossRef?.verseRef || null}
        onSpawnAndConnect={handleSpawnAndConnect}
      />

      <WordLexiconDrawer
        isOpen={!!activeStrongsWord}
        onClose={() => setActiveStrongsWord(null)}
        strongs={activeStrongsWord}
        onPinToCanvas={(entry) => handleAddLexicon(entry.strongs)}
      />

      <CommentaryDrawer
        isOpen={!!activeCommentaryRef}
        onClose={() => setActiveCommentaryRef(null)}
        reference={activeCommentaryRef}
        onPinAsNote={handlePinCommentaryAsSticky}
      />

      <TemplatePickerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        roomCode={roomCode}
        currentUser={currentUser}
        onUpdateCurrentUser={handleUpdateCurrentUser}
        isSimulatingCollab={isSimulatingCollab}
        onToggleCollabSimulation={handleToggleCollabSimulation}
        canvasState={{
          nodes,
          connections,
          zoom,
          pan,
          selectedNodeId,
          activeTool,
          roomTitle,
          roomCode,
          collaborators: activeCollaborators,
        }}
      />

      <ExportStudyModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        roomTitle={roomTitle}
        nodes={nodes}
        connections={connections}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        nodes={nodes}
        onFocusNode={handleFocusNode}
        onAddScripture={(ref) => handleAddPassage(ref, 'BSB')}
        onAddLexicon={handleAddLexicon}
        onAddSticky={() => handleAddSticky('amber')}
        onAddPrompt={() => handleAddPrompt('Observation')}
        onOpenCommentary={handleOpenCommentaryFromToolbar}
        onOpenExport={() => setIsExportModalOpen(true)}
        onCenterCanvas={handleCenterCanvas}
      />

      {/* Password Protection Gate */}
      <UnlockRoomModal
        isOpen={isRoomLocked}
        roomCode={roomCode}
        onUnlocked={() => setIsRoomLocked(false)}
      />
    </div>
  );
};

export default App;
